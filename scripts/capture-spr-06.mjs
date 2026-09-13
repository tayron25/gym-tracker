import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { WebSocket } from "ws";

const browserCandidates = [
  { name: "chrome", path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" },
  { name: "edge", path: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" },
];
const browserPreference = process.argv.find((argument) => argument.startsWith("--browser="))?.split("=")[1];
if (browserPreference && !browserCandidates.some((candidate) => candidate.name === browserPreference)) {
  throw new Error("Usa --browser=chrome o --browser=edge.");
}
const browserChoice = browserCandidates.find(
  (candidate) => (!browserPreference || candidate.name === browserPreference) && existsSync(candidate.path),
);
if (!browserChoice) throw new Error(`No se encontró el navegador solicitado: ${browserPreference ?? "Chrome o Edge"}.`);
const browserPath = browserChoice.path;

const baseUrl = "http://127.0.0.1:5174";
const port = 9700 + (process.pid % 200);
const profilePath = resolve(".qa-chrome", `spr-06-${process.pid}`);
const evidencePath = resolve("docs/evidence/spr-06");
mkdirSync(profilePath, { recursive: true });
mkdirSync(evidencePath, { recursive: true });

const browser = spawn(browserPath, [
  "--headless=new",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profilePath}`,
  "--disable-gpu",
  "--hide-scrollbars",
  "--no-first-run",
  "--no-default-browser-check",
  "--remote-allow-origins=*",
  "about:blank",
], { detached: false, stdio: "ignore", windowsHide: true });
process.on("exit", () => browser.kill());

const pause = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));
async function getDevtoolsMetadata() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const [versionResponse, targetsResponse] = await Promise.all([
        fetch(`http://127.0.0.1:${port}/json/version`),
        fetch(`http://127.0.0.1:${port}/json`),
      ]);
      const version = await versionResponse.json();
      const targets = await targetsResponse.json();
      const page = targets.find((target) => target.type === "page");
      if (page?.webSocketDebuggerUrl) return { version, target: page };
    } catch {
      await pause(100);
    }
  }
  throw new Error("El navegador no expuso el destino de depuración.");
}

const devtools = await getDevtoolsMetadata();
const socket = new WebSocket(devtools.target.webSocketDebuggerUrl, { headers: { Origin: "http://localhost" } });
await new Promise((resolvePromise, reject) => {
  socket.once("open", resolvePromise);
  socket.once("error", reject);
});
let commandId = 0;
const pending = new Map();
socket.on("message", (data) => {
  const message = JSON.parse(data.toString("utf8"));
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
  }, 15000);
  pending.set(id, { resolve: resolvePromise, reject, timer });
  socket.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return result.result.value;
};
const navigate = async (path) => {
  await send("Page.navigate", { url: `${baseUrl}${path}` });
  await pause(300);
};
const waitFor = async (expression) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (await evaluate(expression)) return;
    await pause(100);
  }
  throw new Error(`No se cumplió la condición del navegador: ${expression}`);
};

await send("Page.enable");
await send("Runtime.enable");
await navigate("/login");
await evaluate(`sessionStorage.clear(); sessionStorage.setItem("gym-tracker.mock-session", "active"); true`);

const captures = [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 900 },
  { width: 1280, height: 900 },
];
const checks = [];

for (const capture of captures) {
  await send("Emulation.setDeviceMetricsOverride", { width: capture.width, height: capture.height, deviceScaleFactor: 1, mobile: capture.width < 768 });
  for (const view of ["history", "detail", "progress"]) {
    const route = view === "history" ? "/app/history" : view === "detail" ? "/app/history/workout-history-push-a" : "/app/progress";
    await navigate(route);
    await waitFor(view === "history"
      ? `document.querySelector('h1')?.textContent?.includes('Historial.')`
      : view === "detail"
        ? `document.querySelector('h1')?.textContent?.includes('Push A') && Boolean(document.querySelector('#history-notes'))`
        : `document.querySelector('h1')?.textContent?.includes('Lo que está cambiando.') && Boolean(document.querySelector('[role="img"][aria-label="Gráfica de e1RM estimado"]'))`);
    const layout = await evaluate(`(() => ({
      viewport: window.innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      heading: document.querySelector('h1')?.textContent?.trim() ?? null,
      historyRows: document.querySelectorAll('a[href^="/app/history/"]').length,
      detailExercises: document.querySelectorAll('.history-exercise').length,
      hasChart: Boolean(document.querySelector('[role="img"][aria-label="Gráfica de e1RM estimado"]')),
      hasPagination: Boolean(document.querySelector('[aria-label="Paginación del historial"]')),
      hasNote: Boolean(document.querySelector('#history-notes')),
      hasWeekly: Boolean([...document.querySelectorAll('h2')].find((heading) => heading.textContent?.includes('Series por músculo'))),
    }))()`);
    const screenshot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, fromSurface: true });
    const file = `${capture.width}-${view}.png`;
    const image = Buffer.from(screenshot.data, "base64");
    writeFileSync(resolve(evidencePath, file), image);
    checks.push({
      ...capture,
      view,
      file,
      ...layout,
      fileBytes: image.length,
      sha256: createHash("sha256").update(image).digest("hex"),
      noHorizontalOverflow: layout.scrollWidth <= layout.clientWidth,
    });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  browser: {
    name: browserChoice.name,
    executable: browserPath,
    version: devtools.version,
    target: {
      id: devtools.target.id,
      type: devtools.target.type,
      title: devtools.target.title,
      url: devtools.target.url,
      webSocketDebuggerUrl: devtools.target.webSocketDebuggerUrl,
    },
  },
  routes: ["/app/history", "/app/history/workout-history-push-a", "/app/progress"],
  checks,
  allResponsive: checks.every((check) => check.noHorizontalOverflow),
  chartRendered: checks.filter((check) => check.view === "progress").every((check) => check.hasChart),
};
writeFileSync(resolve("docs/evidence/spr-06-browser-checks.json"), `${JSON.stringify(report, null, 2)}\n`);
socket.close();
browser.kill();
console.log(JSON.stringify(report, null, 2));
