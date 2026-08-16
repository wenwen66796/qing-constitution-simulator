import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`https://qing-simulator.example${path}`, {
      headers: {
        accept: "text/html",
        host: "qing-simulator.example",
        "x-forwarded-host": "qing-simulator.example",
        "x-forwarded-proto": "https",
      },
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the production research dashboard shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>清末立宪存续模拟器<\/title>/);
  assert.match(html, /基于史料溯源、制度约束和信息不完全/);
  assert.match(html, /https:\/\/qing-simulator\.example\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("ships a compact, internally complete dashboard data bundle", async () => {
  const path = new URL("../public/data/dashboard.json", import.meta.url);
  const data = JSON.parse(await readFile(path, "utf8"));
  assert.equal(data.corpus.runs, 24);
  assert.equal(data.corpus.turns, 469);
  assert.equal(data.corpus.personas, 18);
  assert.equal(data.runs.length, 24);
  assert.equal(data.personas.length, 18);
  assert.ok(data.runs.some((run) => run.scenarioCode === "H"));
  assert.equal(data.ensemble.run_count, 20);
  assert.ok(data.stress.series.historical_anchor.length > 0);
  assert.match(data.methodologyNotice, /不是真实历史统计数据/);
});

test("ships the final social card and removes all starter preview files", async () => {
  const og = await stat(new URL("../public/og.png", import.meta.url));
  assert.ok(og.size > 100_000);
  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/_sites-preview/preview.css", import.meta.url)));
  const packageJson = await readFile(new URL("../package.json", import.meta.url), "utf8");
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
});
