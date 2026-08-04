/**
 * smoke.mjs — boots the production build and walks the real routes.
 *
 * Dependency-free on purpose: the overnight loop runs unattended, and a
 * browser download that fails at 3am costs a whole iteration. Plain HTTP
 * against `next start` catches what actually breaks in this app — a route
 * that 500s, a server component that throws, a redirect chain that loops.
 *
 * Run directly (node scripts/smoke.mjs) or via scripts/verify.sh.
 */

import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const PORT = Number(process.env.SMOKE_PORT ?? 3111);
const BASE = `http://127.0.0.1:${PORT}`;
const BOOT_TIMEOUT_MS = 90_000;
const REQUEST_TIMEOUT_MS = 20_000;
/** Hard ceiling. Nothing in an unattended loop may hang the night. */
const TOTAL_BUDGET_MS = 300_000;

/**
 * `expect` is deliberately loose on auth-gated paths: without real Supabase
 * credentials /app redirects to /login, with them it renders. Both are
 * healthy — only a 5xx or an exception page is a failure.
 */
const ROUTES = [
  { path: "/", mustContain: "Karma" },
  { path: "/login" },
  { path: "/partner" },
  { path: "/admin" },
  { path: "/app", allowRedirect: true },
  { path: "/app/missions", allowRedirect: true },
  { path: "/app/rewards", allowRedirect: true },
  { path: "/app/leaderboard", allowRedirect: true },
  { path: "/app/profile", allowRedirect: true },
  { path: "/this-route-does-not-exist", expectStatus: 404 },
];

const ERROR_MARKERS = [
  "Application error: a server-side exception",
  "Internal Server Error",
  "__NEXT_ERROR_CODE",
];

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function waitForServer(child) {
  const deadline = Date.now() + BOOT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`next start exited early with code ${child.exitCode}`);
    }
    try {
      await fetchWithTimeout(BASE, { redirect: "manual" });
      return;
    } catch {
      await sleep(500);
    }
  }
  throw new Error(`server did not answer on ${BASE} within ${BOOT_TIMEOUT_MS}ms`);
}

async function checkRoute(route) {
  const res = await fetchWithTimeout(BASE + route.path, { redirect: "manual" });
  const status = res.status;

  if (route.expectStatus && status !== route.expectStatus) {
    return `expected ${route.expectStatus}, got ${status}`;
  }
  if (!route.expectStatus) {
    if (status >= 500) return `server error ${status}`;
    const isRedirect = status >= 300 && status < 400;
    if (isRedirect && !route.allowRedirect) {
      return `unexpected redirect ${status} → ${res.headers.get("location")}`;
    }
    if (!isRedirect && status >= 400) return `client error ${status}`;
  }

  const body = status >= 300 && status < 400 ? "" : await res.text();
  const marker = ERROR_MARKERS.find((m) => body.includes(m));
  if (marker) return `error page rendered (matched "${marker}")`;
  if (route.mustContain && !body.includes(route.mustContain)) {
    return `body is missing expected text "${route.mustContain}"`;
  }
  return null;
}

/**
 * `next start` forks a `next-server` worker that inherits our stdio pipes.
 * Killing only the direct child leaves that worker alive: it holds the pipes
 * open, the parent's event loop never drains, and the smoke stage hangs
 * forever instead of failing. So the child gets its own process group and we
 * signal the whole group.
 */
function killTree(child) {
  if (child.pid == null) return;
  for (const signal of ["SIGTERM", "SIGKILL"]) {
    try {
      process.kill(-child.pid, signal);
    } catch {
      /* group already gone */
    }
    if (signal === "SIGTERM" && child.exitCode === null) continue;
    break;
  }
  child.stdout?.destroy();
  child.stderr?.destroy();
}

async function main() {
  log(`starting: next start -p ${PORT}`);
  const child = spawn("npx", ["--no-install", "next", "start", "-p", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env },
    detached: true,
  });

  const serverLog = [];
  const capture = (chunk) => serverLog.push(chunk.toString());
  child.stdout.on("data", capture);
  child.stderr.on("data", capture);

  const failures = [];
  try {
    await waitForServer(child);
    log(`server up on ${BASE}\n`);

    for (const route of ROUTES) {
      let problem;
      try {
        problem = await checkRoute(route);
      } catch (err) {
        problem = `request threw: ${err.message}`;
      }
      if (problem) {
        failures.push(`${route.path} — ${problem}`);
        log(`  FAIL  ${route.path} — ${problem}`);
      } else {
        log(`  ok    ${route.path}`);
      }
    }
  } catch (err) {
    failures.push(`server never became reachable: ${err.message}`);
  } finally {
    killTree(child);
    await sleep(300);
  }

  if (failures.length > 0) {
    log(`\n${failures.length} smoke failure(s):`);
    for (const f of failures) log(`  - ${f}`);
    log("\n--- server output ---");
    log(serverLog.join("").slice(-4000));
    return 1;
  }

  log(`\nall ${ROUTES.length} routes healthy`);
  return 0;
}

const watchdog = setTimeout(() => {
  log(`\nsmoke harness exceeded its ${TOTAL_BUDGET_MS / 1000}s budget — aborting`);
  process.exit(1);
}, TOTAL_BUDGET_MS);
watchdog.unref();

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    log(`smoke harness crashed: ${err.stack ?? err.message}`);
    process.exit(1);
  });
