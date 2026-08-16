"use client";

import { FormEvent, useMemo, useState } from "react";

type MetricMap = Record<string, number>;

type TurnSummary = {
  turn: number;
  date: string;
  agenda: string[];
  active_actor_ids: string[];
  worldbook_entries: Record<string, string[]>;
  public_events: { phase: number; type: string; summary: string }[];
  metrics: MetricMap;
  critic_flags: string[];
};

type SimulationResult = {
  run_id: string;
  provider_mode: string;
  engine_version: string;
  final_date: string;
  scenario: { code: string; label: string; rationale: string[]; secondary: string[] };
  final_metrics: MetricMap;
  fiscal: Record<string, number | string>;
  turns: TurnSummary[];
  warnings: string[];
  notice: string;
  data_handling: string;
};

const METRIC_LABELS: Record<string, string> = {
  central_legitimacy: "中央合法性",
  parliament_legitimacy: "议会合法性",
  constitutional_norm_strength: "宪政规范",
  yuan_personal_power: "袁世凯个人权力",
  beiyang_cohesion: "北洋凝聚力",
  provincial_compliance: "省份服从度",
  revolutionary_mobilization: "革命动员",
  civilian_control_of_military: "军队文官控制",
  central_revenue: "中央财政能力",
  foreign_debt_pressure: "外债压力",
  civil_war_risk: "内战风险",
  coup_risk: "政变风险",
};

const ACTOR_LABELS: Record<string, string> = {
  yuan_shikai: "袁世凯",
  zhang_jian: "张謇",
  tang_hualong: "汤化龙",
  song_jiaoren: "宋教仁",
  sun_yatsen: "孙中山",
  huang_xing: "黄兴",
  empress_dowager_longyu: "隆裕太后",
  zaifeng: "载沣",
  duan_qirui: "段祺瑞",
  feng_guozhang: "冯国璋",
  wang_shizhen: "王士珍",
  li_yuanhong: "黎元洪",
  cai_e: "蔡锷",
  yan_xishan: "阎锡山",
  liang_qichao: "梁启超",
  yang_du: "杨度",
  yikuang: "奕劻",
};

function actorName(id: string) {
  return ACTOR_LABELS[id] ?? id;
}

function metricColor(key: string, value: number) {
  const risk = key.endsWith("_risk") || key === "foreign_debt_pressure";
  const healthy = risk ? value < 45 : value >= 55;
  return healthy ? "bg-emerald-500" : value >= 35 ? "bg-amber-500" : "bg-rose-500";
}

export default function SimulatorPage() {
  const [apiKey, setApiKey] = useState("");
  const [provider, setProvider] = useState<"online" | "deterministic">("online");
  const [mode, setMode] = useState<"quick" | "standard">("standard");
  const [seed, setSeed] = useState("19111215");
  const [endDate, setEndDate] = useState("1912-03-15");
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  const selectedMetrics = useMemo(
    () =>
      result
        ? Object.entries(result.final_metrics).filter(([key]) => key in METRIC_LABELS)
        : [],
    [result]
  );

  async function startSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (provider === "online" && !apiKey.trim()) {
      setError("在线模式需要临时输入 DeepSeek API Key。它不会保存到浏览器、数据库或模拟工件。");
      return;
    }
    setRunning(true);
    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: provider === "online" ? apiKey : undefined,
          provider,
          mode,
          seed: Number(seed),
          endDate,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setError(payload.error ?? "模拟没有完成。请检查后端服务状态后重试。");
        return;
      }
      setResult(payload.result as SimulationResult);
    } catch {
      setError("无法连接模拟服务。请稍后重试。");
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-stone-900">
      <section className="border-b border-stone-300 bg-[#1f2a2e] text-stone-100">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <p className="mb-3 text-sm tracking-[0.24em] text-amber-300">RESEARCH INSTRUMENT · 1911–1930</p>
          <h1 className="max-w-4xl font-serif text-4xl leading-tight md:text-6xl">真实多 Agent 宪政反事实模拟</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-stone-300">
            人物只提交结构化意图；宪法、军事、财政与外交裁判决定结果。每回合使用冻结状态、信息权限、来源化 persona 与可审计世界书，而不是让角色自由聊天。
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[390px_1fr]">
        <aside className="h-fit rounded-2xl border border-stone-300 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <h2 className="font-serif text-2xl">运行一条新路径</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            默认只推进到 1912 年 3 月，控制公开演示的调用成本。结果不会覆写已发布的研究工件。
          </p>
          <form className="mt-6 space-y-4" onSubmit={startSimulation}>
            <label className="block text-sm font-medium">
              后端
              <select
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
                value={provider}
                onChange={(event) => setProvider(event.target.value as "online" | "deterministic")}
              >
                <option value="online">在线模型（DeepSeek Flash）</option>
                <option value="deterministic">离线确定性规则</option>
              </select>
            </label>
            {provider === "online" && (
              <label className="block text-sm font-medium">
                DeepSeek API Key
                <input
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono text-sm"
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="仅在本次浏览器会话中保留"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                />
                <span className="mt-1 block text-xs font-normal leading-5 text-stone-500">
                  仅通过服务端代理转发一次；不写入 LocalStorage、URL、日志、JSON 或 SQLite。
                </span>
              </label>
            )}
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">
                模式
                <select
                  className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
                  value={mode}
                  onChange={(event) => setMode(event.target.value as "quick" | "standard")}
                >
                  <option value="standard">标准（最多 5 位在线人物/回合）</option>
                  <option value="quick">快速（纯确定性）</option>
                </select>
              </label>
              <label className="block text-sm font-medium">
                Seed
                <input
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 font-mono"
                  inputMode="numeric"
                  value={seed}
                  onChange={(event) => setSeed(event.target.value.replace(/\D/g, ""))}
                />
              </label>
            </div>
            <label className="block text-sm font-medium">
              终点日期
              <input
                className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                type="date"
                min="1911-12-15"
                max="1913-12-31"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </label>
            {error && <p className="rounded-lg bg-rose-50 p-3 text-sm leading-6 text-rose-800">{error}</p>}
            <button
              className="w-full rounded-lg bg-[#a9472d] px-4 py-3 font-semibold text-white transition hover:bg-[#8d3924] disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={running}
            >
              {running ? "模拟运行中…" : "运行真实模拟内核"}
            </button>
            {apiKey && provider === "online" && (
              <button
                type="button"
                className="w-full text-sm text-stone-500 underline"
                onClick={() => setApiKey("")}
              >
                清除此页临时 API Key
              </button>
            )}
          </form>
        </aside>

        <section className="min-w-0">
          {!result ? (
            <div className="rounded-2xl border border-dashed border-stone-400 bg-white/70 p-10 text-center shadow-sm">
              <p className="font-serif text-3xl">等待一条可审计的历史路径</p>
              <p className="mx-auto mt-4 max-w-2xl leading-7 text-stone-600">
                启动后，页面会展示 scenario、状态指标、公开事件和每名活跃人物实际检索到的世界书条目。不会显示或泄露任何人物的私密谈判与底线。
              </p>
            </div>
          ) : (
            <div className="space-y-7">
              <section className="rounded-2xl border border-stone-300 bg-white p-7 shadow-sm">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <p className="text-sm tracking-widest text-stone-500">完成于 {result.final_date} · {result.provider_mode === "online" ? "在线模型" : "确定性规则"}</p>
                    <h2 className="mt-2 font-serif text-3xl">{result.scenario.code} · {result.scenario.label}</h2>
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-6 text-stone-700">
                      {result.scenario.rationale.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-lg bg-stone-100 p-3 text-xs text-stone-600">
                    <div>Run ID: <span className="font-mono">{result.run_id}</span></div>
                    <div>Engine: {result.engine_version}</div>
                  </div>
                </div>
                <p className="mt-5 border-t border-stone-200 pt-4 text-xs leading-5 text-stone-500">{result.notice}</p>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {selectedMetrics.map(([key, value]) => (
                  <article key={key} className="rounded-xl border border-stone-300 bg-white p-4 shadow-sm">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm text-stone-600">{METRIC_LABELS[key]}</span>
                      <strong className="font-serif text-2xl">{value}</strong>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100">
                      <div className={`h-full ${metricColor(key, value)}`} style={{ width: `${value}%` }} />
                    </div>
                  </article>
                ))}
              </section>

              <section className="rounded-2xl border border-stone-300 bg-white p-7 shadow-sm">
                <h2 className="font-serif text-2xl">回合时间线与世界书检索</h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  世界书只提供受证据约束的上下文，不能直接修改国家状态；每个回合都保存检索痕迹以供审计。
                </p>
                <div className="mt-6 space-y-6">
                  {result.turns.map((turn) => (
                    <article key={turn.turn} className="border-l-2 border-[#a9472d] pl-5">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="font-semibold">第 {turn.turn} 回合 · {turn.date}</h3>
                        <span className="text-sm text-stone-500">{turn.agenda.join(" · ")}</span>
                      </div>
                      <p className="mt-2 text-sm text-stone-600">
                        活跃人物：{turn.active_actor_ids.map(actorName).join("、") || "无"}
                      </p>
                      <div className="mt-3 grid gap-3 lg:grid-cols-2">
                        <div className="rounded-lg bg-stone-50 p-3">
                          <h4 className="text-xs font-semibold tracking-wide text-stone-500">公开事件</h4>
                          {turn.public_events.length ? (
                            <ul className="mt-2 space-y-2 text-sm leading-6">
                              {turn.public_events.map((event, index) => <li key={`${event.phase}-${index}`}>{event.summary}</li>)}
                            </ul>
                          ) : <p className="mt-2 text-sm text-stone-500">本回合没有新增公开事件。</p>}
                        </div>
                        <div className="rounded-lg bg-amber-50 p-3">
                          <h4 className="text-xs font-semibold tracking-wide text-stone-500">已激活的世界书条目</h4>
                          {Object.keys(turn.worldbook_entries).length ? (
                            <ul className="mt-2 space-y-2 text-sm leading-6">
                              {Object.entries(turn.worldbook_entries).map(([actor, entries]) => (
                                <li key={actor}><span className="font-medium">{actorName(actor)}：</span>{entries.join("；") || "无"}</li>
                              ))}
                            </ul>
                          ) : <p className="mt-2 text-sm text-stone-500">本回合没有可见条目。</p>}
                        </div>
                      </div>
                      {turn.critic_flags.length > 0 && <p className="mt-3 text-sm text-rose-700">合理性审计：{turn.critic_flags.join("；")}</p>}
                    </article>
                  ))}
                </div>
              </section>

              {(result.warnings.length > 0 || result.data_handling) && (
                <section className="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm leading-6 text-amber-950">
                  <h2 className="font-semibold">运行与数据处理说明</h2>
                  <p className="mt-2">{result.data_handling}</p>
                  {result.warnings.map((warning) => <p className="mt-2" key={warning}>• {warning}</p>)}
                </section>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
