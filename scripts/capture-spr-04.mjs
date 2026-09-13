import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const chromeCandidates = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const chromePath = chromeCandidates.find(existsSync);
if (!chromePath) throw new Error("No se encontró Chrome o Edge para la revisión responsive.");

const port = 9300 + (process.pid % 300);
const baseUrl = "http://127.0.0.1:5174";
const profilePath = resolve(".qa-chrome", String(process.pid));
const evidencePath = resolve("docs/evidence/spr-04");
mkdirSync(profilePath, { recursive: true });
mkdirSync(evidencePath, { recursive: true });

const browser = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profilePath}`,
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "about:blank",
  ],
  { detached: false, stdio: "ignore", windowsHide: true },
);

const pause = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

async function devtoolsTarget() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json`);
      const targets = await response.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {
      await pause(100);
    }
  }
  throw new Error("Chrome no expuso el destino de depuración.");
}

const socket = new WebSocket(await devtoolsTarget());
await new Promise((resolvePromise, reject) => {
  socket.addEventListener("open", resolvePromise, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let commandId = 0;
const pending = new Map();
const eventWaiters = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const waiter = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) waiter?.reject(new Error(message.error.message));
    else waiter?.resolve(message.result);
  } else if (message.method) {
    const waiters = eventWaiters.get(message.method) ?? [];
    eventWaiters.delete(message.method);
    waiters.forEach((resolvePromise) => resolvePromise(message.params));
  }
});

const send = (method, params = {}) =>
  new Promise((resolvePromise, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve: resolvePromise, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

const waitForEvent = (method) =>
  new Promise((resolvePromise) => {
    const waiters = eventWaiters.get(method) ?? [];
    waiters.push(resolvePromise);
    eventWaiters.set(method, waiters);
  });

async function navigate(path) {
  const loaded = waitForEvent("Page.loadEventFired");
  await send("Page.navigate", { url: `${baseUrl}${path}` });
  await loaded;
  await pause(100);
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result.value;
}

async function key(key, code, windowsVirtualKeyCode, modifiers = 0) {
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code,
    windowsVirtualKeyCode,
    modifiers,
    text: key === "Enter" ? "\r" : undefined,
  });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode, modifiers });
  await pause(60);
}

await send("Page.enable");
await send("Runtime.enable");
await navigate("/login");
await evaluate(`sessionStorage.setItem("gym-tracker.mock-session", "active")`);

const captures = [
  { width: 360, height: 800, path: "/app/routines/routine-push-a", file: "360-routine-editor.png" },
  { width: 390, height: 844, path: "/app/exercises", file: "390-exercise-catalog.png" },
  { width: 768, height: 900, path: "/app/routines", file: "768-routines.png" },
  { width: 1280, height: 900, path: "/app/exercises/exercise-lateral-custom", file: "1280-exercise-detail.png" },
];
const checks = [];

for (const capture of captures) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: capture.width,
    height: capture.height,
    deviceScaleFactor: 1,
    mobile: capture.width < 768,
  });
  await navigate(capture.path);
  const layout = await evaluate(`({
    viewport: window.innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    heading: document.querySelector("h1")?.textContent?.trim() ?? null
  })`);
  const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true });
  writeFileSync(resolve(evidencePath, capture.file), Buffer.from(screenshot.data, "base64"));
  checks.push({ ...capture, ...layout, noHorizontalOverflow: layout.scrollWidth <= layout.clientWidth });
}

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await navigate("/app/exercises");
const dialogOpened = await evaluate(`(() => {
  const trigger = [...document.querySelectorAll("button")].find((button) => button.textContent.includes("Nuevo ejercicio"));
  trigger?.focus();
  trigger?.click();
  return Boolean(trigger);
})()`);
await pause(100);
const dialogInitialFocus = await evaluate(`document.activeElement?.id || document.activeElement?.textContent?.trim() || null`);
await key("Escape", "Escape", 27);
const dialogReturnedFocus = await evaluate(`document.activeElement?.textContent?.trim() ?? null`);

await navigate("/app/routines/routine-push-a");
const reorderFocused = await evaluate(`(() => {
  const button = document.querySelector('button[aria-label="Bajar Press banca"]');
  button?.focus();
  return document.activeElement?.getAttribute("aria-label") ?? null;
})()`);
await key("Enter", "Enter", 13);
const reorderedHeadings = await evaluate(`([...document.querySelectorAll(".routine-item h3")].map((heading) => heading.textContent?.trim()))`);

const report = {
  generatedAt: new Date().toISOString(),
  browser: chromePath,
  captures: checks,
  keyboard: {
    dialogOpened,
    dialogInitialFocus,
    dialogReturnedFocus,
    reorderFocused,
    reorderedHeadings,
  },
};
writeFileSync(resolve("docs/evidence/spr-04-browser-checks.json"), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

socket.close();
browser.kill();
