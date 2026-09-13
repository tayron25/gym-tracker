import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { WebSocket } from "ws";

const browserCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const browserPath = browserCandidates.find(existsSync);
if (!browserPath) throw new Error("No se encontró Chrome o Edge para la revisión responsive.");

const baseUrl = "http://127.0.0.1:5174";
const port = 9500 + (process.pid % 300);
const profilePath = resolve(".qa-chrome", `spr-05-${process.pid}`);
const evidencePath = resolve("docs/evidence/spr-05");
mkdirSync(profilePath, { recursive: true });
mkdirSync(evidencePath, { recursive: true });

const browser = spawn(browserPath, [
  "--headless",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profilePath}`,
  "--disable-gpu",
  "--in-process-gpu",
  "--disable-gpu-compositing",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-allow-origins=*",
  "about:blank",
], { detached: false, stdio: "ignore", windowsHide: true });
process.on("exit", () => browser.kill());

const pause = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

async function getTarget() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      await pause(100);
    }
  }
  throw new Error("El navegador no expuso el destino de depuración.");
}

const targetUrl = await getTarget();
const socket = new WebSocket(targetUrl, { headers: { Origin: "http://localhost" } });
await new Promise((resolvePromise, reject) => {
  socket.once("open", resolvePromise);
  socket.once("error", reject);
});

let commandId = 0;
const pending = new Map();
socket.on("message", (data) => {
  const raw = data.toString("utf8");
  const message = JSON.parse(raw);
  if (!message.id) return;
  const waiter = pending.get(message.id);
  pending.delete(message.id);
  if (waiter?.timer) clearTimeout(waiter.timer);
  if (message.error) waiter?.reject(new Error(message.error.message));
  else waiter?.resolve(message.result);
});

const send = (method, params = {}) => new Promise((resolvePromise, reject) => {
  const id = ++commandId;
  const timer = setTimeout(() => {
    pending.delete(id);
    reject(new Error(`Tiempo de espera agotado en CDP: ${method}`));
  }, 5000);
  pending.set(id, { resolve: resolvePromise, reject, timer });
  socket.send(JSON.stringify({ id, method, params }));
});

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result.value;
}

async function navigate(path) {
  await send("Page.navigate", { url: `${baseUrl}${path}` });
  await pause(250);
}

async function waitFor(expression) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (await evaluate(expression)) return;
    await pause(100);
  }
  throw new Error(`No se cumplió la condición del navegador: ${expression}`);
}

await send("Page.enable");
await send("Runtime.enable");
await navigate("/login");
await evaluate(`sessionStorage.clear(); sessionStorage.setItem("gym-tracker.mock-session", "active"); true`);
await navigate("/app/workout/active");
await waitFor(`document.querySelector('h1')?.textContent?.includes('Elige una rutina.')`);
await evaluate(`(() => {
  const card = [...document.querySelectorAll('.routine-card')].find((candidate) => candidate.textContent?.includes('Push A'));
  const button = [...(card?.querySelectorAll('button') ?? [])].find((candidate) => candidate.textContent?.includes('Empezar'));
  button?.click();
  return Boolean(button);
})()`);
await waitFor(`document.querySelector('h1')?.textContent?.includes('Push A') && document.querySelectorAll('.exercise-order-row').length === 5`);

const captures = [
  { width: 360, height: 800, file: "360-active-workout.png" },
  { width: 390, height: 844, file: "390-active-workout.png" },
  { width: 768, height: 900, file: "768-active-workout.png" },
  { width: 1280, height: 900, file: "1280-active-workout.png" },
];
const checks = [];

for (const capture of captures) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: capture.width,
    height: capture.height,
    deviceScaleFactor: 1,
    mobile: capture.width < 768,
  });
  await navigate("/app/workout/active");
  await waitFor(`document.querySelectorAll('.exercise-order-row').length === 5`);
  const layout = await evaluate(`(() => {
    const confirm = document.querySelector('button[aria-label^="Confirmar serie"]');
    const rect = confirm?.getBoundingClientRect();
    return {
      viewport: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      heading: document.querySelector('h1')?.textContent?.trim() ?? null,
      exerciseCount: document.querySelectorAll('.exercise-order-row').length,
      confirmWidth: rect?.width ?? null,
      confirmHeight: rect?.height ?? null,
      setRowCount: document.querySelectorAll('.set-row').length,
    };
  })()`);
  const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true });
  writeFileSync(resolve(evidencePath, capture.file), Buffer.from(screenshot.data, "base64"));
  checks.push({ ...capture, ...layout, noHorizontalOverflow: layout.scrollWidth <= layout.clientWidth, confirmTouchTarget: (layout.confirmWidth ?? 0) >= 44 && (layout.confirmHeight ?? 0) >= 44 });
}

await evaluate(`(() => {
  const weight = document.querySelector('input[aria-label="Peso de la serie 1"]');
  weight?.focus();
  return document.activeElement?.getAttribute('aria-label') ?? null;
})()`);
const keyboardFocusBefore = await evaluate(`document.activeElement?.getAttribute('aria-label') ?? null`);
const interactionStartedAt = await evaluate("performance.now()");
await evaluate(`(() => {
  const setValue = (selector, value) => {
    const input = document.querySelector(selector);
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    setter?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };
  setValue('input[aria-label="Peso de la serie 1"]', '80');
  setValue('input[aria-label="Repeticiones de la serie 1"]', '12');
  document.querySelector('button[aria-label="Confirmar serie 1"]')?.click();
  return true;
})()`);
await waitFor(`document.querySelector('[role="status"]')?.textContent?.includes('Serie guardada')`);
const interactionFinishedAt = await evaluate("performance.now()");
const keyboardFocusAfter = await evaluate(`document.activeElement?.getAttribute('aria-label') ?? null`);

const report = {
  generatedAt: new Date().toISOString(),
  browser: browserPath,
  captures: checks,
  workout: {
    exerciseCount: await evaluate("document.querySelectorAll('.exercise-order-row').length"),
    keyboardFocusBefore,
    keyboardFocusAfter,
    confirmationInteractionMs: Math.round(interactionFinishedAt - interactionStartedAt),
    savedStatusVisible: await evaluate(`document.body.textContent?.includes('Serie guardada.') ?? false`),
  },
};
writeFileSync(resolve("docs/evidence/spr-05-browser-checks.json"), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
socket.close();
browser.kill();
