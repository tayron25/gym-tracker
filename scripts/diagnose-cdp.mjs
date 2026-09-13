import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WebSocket as PackageWebSocket } from "ws";

const candidates = [
  { name: "chrome", path: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" },
  { name: "edge", path: "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" },
].filter((candidate) => existsSync(candidate.path));

const pause = (milliseconds) => new Promise((resolvePromise) => setTimeout(resolvePromise, milliseconds));

async function fetchJson(url, attempts = 50) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response.json();
    } catch {
      // El navegador puede tardar unos instantes en abrir el puerto de depuración.
    }
    await pause(100);
  }
  throw new Error(`No respondió ${url}`);
}

function testCommand(SocketConstructor, websocketUrl, socketOptions) {
  return new Promise((resolvePromise) => {
    const startedAt = performance.now();
    const socket = socketOptions
      ? new SocketConstructor(websocketUrl, socketOptions)
      : new SocketConstructor(websocketUrl);
    const finish = (result) => {
      clearTimeout(timer);
      try {
        socket.close();
      } catch {
        // El diagnóstico ya obtuvo el resultado necesario.
      }
      resolvePromise({ ...result, elapsedMs: Math.round(performance.now() - startedAt) });
    };
    const timer = setTimeout(() => finish({ status: "timeout" }), 10000);
    const onOpen = () => socket.send(JSON.stringify({ id: 1, method: "Page.enable", params: {} }));
    const onMessage = (eventOrData) => {
      const raw = eventOrData?.data ?? eventOrData;
      const message = JSON.parse(typeof raw === "string" ? raw : raw.toString("utf8"));
      if (message.id === 1) finish({ status: message.error ? "error" : "ok", response: message });
    };
    const onError = (error) => finish({ status: "socket-error", error: error?.message ?? String(error) });

    if (typeof socket.addEventListener === "function") {
      socket.addEventListener("open", onOpen, { once: true });
      socket.addEventListener("message", onMessage);
      socket.addEventListener("error", onError, { once: true });
    } else {
      socket.once("open", onOpen);
      socket.on("message", onMessage);
      socket.once("error", onError);
    }
  });
}

async function diagnose(candidate, index) {
  const port = 9820 + index;
  const profilePath = join(tmpdir(), `gym-tracker-cdp-${candidate.name}-${process.pid}`);
  const browser = spawn(candidate.path, [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profilePath}`,
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-allow-origins=*",
    "about:blank",
  ], { stdio: "ignore", windowsHide: true });

  try {
    const version = await fetchJson(`http://127.0.0.1:${port}/json/version`);
    const targets = await fetchJson(`http://127.0.0.1:${port}/json`);
    const target = targets.find((item) => item.type === "page");
    if (!target?.webSocketDebuggerUrl) throw new Error("No se encontró un target de tipo page.");

    return {
      name: candidate.name,
      executable: candidate.path,
      version,
      target: {
        id: target.id,
        type: target.type,
        title: target.title,
        url: target.url,
        webSocketDebuggerUrl: target.webSocketDebuggerUrl,
      },
      nativeWebSocket: await testCommand(globalThis.WebSocket, target.webSocketDebuggerUrl),
      packageWebSocket: await testCommand(PackageWebSocket, target.webSocketDebuggerUrl, {
        headers: { Origin: "http://localhost" },
      }),
    };
  } finally {
    browser.kill();
  }
}

const results = [];
for (const [index, candidate] of candidates.entries()) {
  try {
    results.push(await diagnose(candidate, index));
  } catch (error) {
    results.push({ name: candidate.name, executable: candidate.path, error: error.message });
  }
}

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
