"use client";

import { useEffect, useMemo, useState } from "react";

type Metrics = Record<string, number>;
type CompactEvent = {
  id: string;
  phase: number;
  type: string;
  title: string;
  summary: string;
  actorIds: string[];
  visibility: string;
  sourceClaimIds: string[];
  counterfactualReasoning: string[];
  uncertaintyNotes: string[];
};
type CompactTurn = {
  turn: number;
  date: string;
  agenda: string[];
  activeActorIds: string[];
  historianCommentary: string;
  metrics: Metrics;
  fiscal: Record<string, number>;
  deltas: Array<{
    metric: string;
    oldValue: number;
    appliedDelta: number;
    newValue: number;
    reason: string;
    provenance: string;
  }>;
  events: CompactEvent[];
  decisions: Array<{
    actorId: string;
    confidence: number;
    redLineStatus: string;
    reasoning: string;
    publicActions: Array<{ id: string; type: string; title: string; description: string }>;
    proposals: Array<{ id: string; targets: string[]; offer: string[]; request: string[] }>;
  }>;
  findings: Array<{
    referee: string;
    actionId: string;
    success: boolean;
    legality: string;
    explanation: string;
    flags: string[];
  }>;
  criticFlags: string[];
  randomDrawCount: number;
  worldbookActivations: Record<string, Array<{
    entryId: string;
    title: string;
    promptSlot: string;
    included: boolean;
    reason: string;
    estimatedTokens: number;
    recursionDepth: number;
    sourceClaimIds: string[];
  }>>;
  publicCommitments: Array<{
    id: string;
    parties: string[];
    terms: string[];
    dueDate?: string;
    status: string;
    enforceability: string;
  }>;
};
type CompactRun = {
  id: string;
  seed: number;
  mode: string;
  providerMode: string;
  completedAt: string;
  requestedEndDate: string;
  scenarioCode: string;
  scenarioLabel: string;
  scenarioRationale: string[];
  secondaryScenarios: string[];
  heuristicsNotice: string;
  initialMetrics: Metrics;
  finalMetrics: Metrics;
  finalFiscal: Record<string, number>;
  finalNetworkEdges: Array<{ source: string; target: string; type: string; weight: number }>;
  turns: CompactTurn[];
};
type Persona = {
  id: string;
  name: string;
  groups: string[];
  knowledgeCutoff: string;
  historicalPositions: string[];
  politicalObjectives: string[];
  economicInterests: string[];
  institutionalPreferences: string[];
  militaryResources: string[];
  allies: string[];
  rivals: string[];
  redLines: string[];
  negotiablePositions: string[];
  riskTolerance: number;
  attitudes: Record<string, string>;
  decisionStyle: string;
  evidence: Array<{
    id: string;
    field: string;
    type: string;
    statement: string;
    sourceIds: string[];
    confidence: number;
    notes?: string;
  }>;
  sources: Array<{
    id: string;
    title: string;
    author: string;
    date: string;
    type: string;
    url: string;
    locator?: string;
  }>;
};
type DashboardBundle = {
  generatedAt: string;
  methodologyNotice: string;
  corpus: { runs: number; turns: number; personas: number; evidenceClaims: number };
  runs: CompactRun[];
  ensemble: {
    run_count: number;
    scenario_frequency: Record<string, number>;
    scenario_share: Record<string, number>;
    major_divergence_points: Array<{
      turn: number;
      date: string;
      uncertainty_event: string;
      entity_id: string;
      successes: number;
      observations: number;
      interpretation: string;
    }>;
    robust_outcomes: string[];
    fragile_outcomes: string[];
  };
  stress: {
    death_dates: Record<string, string | null>;
    arm_scenarios: Record<string, string>;
    observation_snapshots: Record<string, unknown>;
    interpretation: string[];
    notice: string;
    series: Record<string, Array<{ date: string } & Metrics>>;
  } | null;
  personas: Persona[];
};

const tabs = [
  ["命运树", "历史命运树"],
  ["总览", "总览"],
  ["人物", "人物阵营"],
  ["时间线", "事件时间线"],
  ["制度", "制度权力图"],
  ["指标", "指标演变"],
  ["多轮", "多轮情景"],
  ["世界书", "世界书与记忆"],
  ["证据", "史料证据"],
] as const;

const metricMeta: Record<string, { label: string; color: string; danger?: boolean }> = {
  central_legitimacy: { label: "中央合法性", color: "#d4a64a" },
  monarchy_legitimacy: { label: "皇室合法性", color: "#9d7dbe" },
  parliament_legitimacy: { label: "议会合法性", color: "#42a5a0" },
  yuan_personal_power: { label: "袁世凯个人权力", color: "#df704f" },
  beiyang_cohesion: { label: "北洋集团凝聚力", color: "#5b86c4" },
  provincial_compliance: { label: "地方服从度", color: "#8ca758" },
  revolutionary_mobilization: { label: "革命动员", color: "#d45f66", danger: true },
  party_system_strength: { label: "政党体系强度", color: "#69a77c" },
  constitutional_norm_strength: { label: "宪政规范强度", color: "#52b9c8" },
  civilian_control_of_military: { label: "军队文官控制", color: "#7e93cf" },
  central_revenue: { label: "中央财政收入", color: "#c99745" },
  fiscal_deficit: { label: "财政赤字压力", color: "#e07a54", danger: true },
  foreign_debt_pressure: { label: "外债压力", color: "#a26a91", danger: true },
  foreign_recognition: { label: "列强承认", color: "#5da2a6" },
  industrial_growth: { label: "工业增长", color: "#8f9f58" },
  elite_support: { label: "精英支持", color: "#ad8f60" },
  popular_unrest: { label: "社会不安", color: "#ce634f", danger: true },
  ethnic_tension: { label: "族群紧张", color: "#aa5e76", danger: true },
  assassination_risk: { label: "暗杀风险", color: "#b24d5c", danger: true },
  coup_risk: { label: "政变风险", color: "#db6e3f", danger: true },
  civil_war_risk: { label: "内战风险", color: "#ef4d4d", danger: true },
};

const scenarioMeta: Record<string, { icon: string; title: string; text: string; color: string }> = {
  A: { icon: "殿", title: "稳定议会君主制", text: "礼仪性皇室与责任内阁共同存续，预算和立法程序获得持续执行。", color: "#4e9f8f" },
  B: { icon: "袁", title: "威权君主立宪", text: "袁世凯借军政控制架空议会，宪法保留而制衡失效。", color: "#b36d42" },
  C: { icon: "裂", title: "袁—议会宪政危机", text: "法律权威与北洋军事实力持续冲突，制度停留在危机状态。", color: "#d39a3d" },
  D: { icon: "革", title: "共和革命再次发动", text: "立宪交易失去可信度，革命派恢复军事与政治动员。", color: "#c84f4f" },
  E: { icon: "省", title: "事实联邦制演化", text: "省级自治与财政截留固化，中央权威被联邦式安排替代。", color: "#629a70" },
  F: { icon: "军", title: "北洋军分裂军阀化", text: "军饷与继承秩序崩溃，北洋体系裂变为地区军事集团。", color: "#69779c" },
  G: { icon: "宫", title: "宫廷保皇派反扑", text: "皇室与满洲贵族试图恢复被宪法剥夺的实权。", color: "#8c6fa5" },
  H: { icon: "终", title: "清朝最终覆灭", text: "宪制安排彻底失效，王朝在不同时间和机制下结束。", color: "#3e4653" },
  I: { icon: "议", title: "议会成功约束袁世凯", text: "政党组织与预算权形成可执行的文官制衡。", color: "#398aa0" },
  J: { icon: "变", title: "复合过渡路径", text: "多重制度与军事结果交叠，无法由单一情景概括。", color: "#727980" },
};

const phaseLabels: Record<number, string> = {
  1: "状态简报",
  2: "独立决策冻结",
  3: "谈判",
  4: "公开行动",
  5: "裁判结算",
  6: "状态更新",
  7: "历史学者评论",
};

const relationshipLabels: Record<string, string> = {
  alliance: "联盟",
  rivalry: "竞争",
  command: "指挥",
  financial_dependence: "财政依赖",
  negotiation: "谈判",
  party: "党派关系",
  party_relationship: "政党关系",
  court: "宫廷关系",
};

const groupLabels: Record<string, string> = {
  beiyang: "北洋集团",
  central_military: "中央军政",
  constitutionalist: "立宪派",
  parliament: "议会政治",
  revolutionary: "革命派",
  provincial: "地方力量",
  royal: "清廷皇室",
  court: "宫廷",
};

const fmt = (value: number | undefined) => (Number.isFinite(value) ? Math.round(value as number) : "—");
const shortDate = (value: string) => value?.slice(0, 10) ?? "—";

function MetricBadge({ metric, value }: { metric: string; value: number }) {
  const meta = metricMeta[metric] ?? { label: metric, color: "#8e958f" };
  return (
    <div className="metric-card" style={{ "--metric-color": meta.color } as React.CSSProperties}>
      <div className="metric-card__label">{meta.label}</div>
      <div className="metric-card__value">{fmt(value)}</div>
      <div className="metric-card__track"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
    </div>
  );
}

function LineChart({ run, metrics, height = 330 }: { run: CompactRun; metrics: string[]; height?: number }) {
  const width = 920;
  const pad = { left: 48, right: 18, top: 24, bottom: 42 };
  const points = [
    { date: "1911-12-15", metrics: run.initialMetrics },
    ...run.turns.map((turn) => ({ date: turn.date, metrics: turn.metrics })),
  ];
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const x = (index: number) => pad.left + (points.length <= 1 ? 0 : (index / (points.length - 1)) * chartW);
  const y = (value: number) => pad.top + chartH - (Math.max(0, Math.min(100, value)) / 100) * chartH;
  const tickIndexes = Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]));
  return (
    <div className="chart-shell">
      <svg className="line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="状态指标随时间变化折线图">
        {[0, 25, 50, 75, 100].map((tick) => (
          <g key={tick}>
            <line x1={pad.left} y1={y(tick)} x2={width - pad.right} y2={y(tick)} className="grid-line" />
            <text x={pad.left - 10} y={y(tick) + 4} textAnchor="end" className="axis-label">{tick}</text>
          </g>
        ))}
        {tickIndexes.map((index) => (
          <text key={index} x={x(index)} y={height - 14} textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} className="axis-label">
            {points[index]?.date.slice(0, 7)}
          </text>
        ))}
        {metrics.map((metric) => {
          const color = metricMeta[metric]?.color ?? "#8e958f";
          const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(point.metrics[metric] ?? 0).toFixed(1)}`).join(" ");
          return (
            <g key={metric}>
              <path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={x(points.length - 1)} cy={y(points.at(-1)?.metrics[metric] ?? 0)} r="4.5" fill={color} />
            </g>
          );
        })}
      </svg>
      <div className="chart-legend">
        {metrics.map((metric) => <span key={metric}><i style={{ background: metricMeta[metric]?.color }} />{metricMeta[metric]?.label ?? metric}</span>)}
      </div>
    </div>
  );
}

function ScenarioBars({ bundle }: { bundle: DashboardBundle }) {
  const count = bundle.ensemble?.run_count ?? bundle.runs.length;
  return (
    <div className="scenario-bars">
      {Object.entries(scenarioMeta).map(([code, meta]) => {
        const value = bundle.ensemble?.scenario_frequency?.[code] ?? 0;
        const percent = count ? (value / count) * 100 : 0;
        return (
          <div className="scenario-row" key={code}>
            <div className="scenario-row__label"><span>{code}</span>{meta.title}</div>
            <div className="scenario-row__bar"><i style={{ width: `${percent}%`, background: meta.color }} /></div>
            <strong>{value}</strong>
          </div>
        );
      })}
    </div>
  );
}

function FateTree({ bundle, run }: { bundle: DashboardBundle; run: CompactRun }) {
  const count = bundle.ensemble?.run_count ?? bundle.runs.length;
  return (
    <section className="section-stack">
      <div className="origin-card">
        <div className="origin-card__year">1911</div>
        <div>
          <span className="eyebrow">不可修改的历史分歧点</span>
          <h2>“保皇换立宪”密约生效</h2>
          <p>清帝保留国号与礼仪元首地位，但失去行政、财政、人事与实际军令权；袁世凯以宪制名义掌握内阁和北洋体系，张謇与汤化龙分别推动财政和省权制度。</p>
        </div>
      </div>
      <div className="tree-trunk"><span>制度执行 × 军事忠诚 × 财政约束 × 信息误差</span></div>
      <div className="fate-grid">
        {Object.entries(scenarioMeta).map(([code, meta]) => {
          const value = bundle.ensemble?.scenario_frequency?.[code] ?? 0;
          const isSelected = run.scenarioCode === code;
          return (
            <article key={code} className={`fate-card ${isSelected ? "is-selected" : ""}`} style={{ "--scenario-color": meta.color } as React.CSSProperties}>
              <div className="fate-card__top"><span className="fate-icon">{meta.icon}</span><span className="fate-code">{code}</span><strong>{count ? Math.round((value / count) * 100) : 0}%</strong></div>
              <h3>{meta.title}</h3>
              <p>{meta.text}</p>
              <footer>{value} / {count} 个固定种子运行{isSelected && <b>当前路径</b>}</footer>
            </article>
          );
        })}
      </div>
      <div className="analysis-card">
        <span className="eyebrow">当前运行的终局判定</span>
        <h2>{run.scenarioCode} · {run.scenarioLabel}</h2>
        <ul>{run.scenarioRationale.map((reason) => <li key={reason}>{reason}</li>)}</ul>
      </div>
    </section>
  );
}

function Overview({ bundle, run }: { bundle: DashboardBundle; run: CompactRun }) {
  const metrics = ["central_legitimacy", "parliament_legitimacy", "yuan_personal_power", "beiyang_cohesion", "fiscal_deficit", "civil_war_risk"];
  return (
    <section className="section-stack">
      <div className="summary-grid">
        <article className="summary-lead">
          <span className="eyebrow">所选运行</span>
          <h2>{run.scenarioCode} · {run.scenarioLabel}</h2>
          <p>Seed {run.seed} · {run.mode === "quick" ? "快速" : "标准"}模式 · {run.turns.length} 回合 · 终止于 {shortDate(run.completedAt)}</p>
          <div className="pill-row">{run.secondaryScenarios.map((code) => <span key={code}>次要路径 {code}</span>)}</div>
        </article>
        <article className="corpus-card"><strong>{bundle.corpus.runs}</strong><span>模拟运行</span></article>
        <article className="corpus-card"><strong>{bundle.corpus.turns}</strong><span>审计回合</span></article>
        <article className="corpus-card"><strong>{bundle.corpus.evidenceClaims}</strong><span>证据声明</span></article>
      </div>
      <div className="metric-grid">{metrics.map((metric) => <MetricBadge key={metric} metric={metric} value={run.finalMetrics[metric]} />)}</div>
      <div className="panel">
        <div className="panel-heading"><div><span className="eyebrow">核心张力</span><h2>合法性、军权与风险的共同演变</h2></div></div>
        <LineChart run={run} metrics={["central_legitimacy", "parliament_legitimacy", "yuan_personal_power", "beiyang_cohesion", "civil_war_risk"]} />
      </div>
      <div className="two-column">
        <article className="panel compact-panel"><span className="eyebrow">稳健结果</span><h3>跨种子均出现的方向</h3><ul>{bundle.ensemble?.robust_outcomes?.slice(0, 6).map((item) => <li key={item}>{item}</li>)}</ul></article>
        <article className="panel compact-panel"><span className="eyebrow">脆弱结果</span><h3>对随机分歧敏感的方向</h3><ul>{bundle.ensemble?.fragile_outcomes?.slice(0, 6).map((item) => <li key={item}>{item}</li>)}</ul></article>
      </div>
    </section>
  );
}

function People({ bundle, run }: { bundle: DashboardBundle; run: CompactRun }) {
  const [selected, setSelected] = useState("yuan_shikai");
  const persona = bundle.personas.find((item) => item.id === selected) ?? bundle.personas[0];
  const nameById = Object.fromEntries(bundle.personas.map((item) => [item.id, item.name]));
  const edges = run.finalNetworkEdges.filter((edge) => edge.source === selected || edge.target === selected);
  return (
    <section className="people-layout">
      <aside className="people-list">
        <span className="eyebrow">18 位历史行动者</span>
        {bundle.personas.map((item) => (
          <button className={item.id === persona.id ? "active" : ""} key={item.id} onClick={() => setSelected(item.id)}>
            <strong>{item.name}</strong><span>{item.groups.slice(0, 2).map((group) => groupLabels[group] ?? group).join(" · ")}</span>
          </button>
        ))}
      </aside>
      <div className="section-stack">
        <article className="persona-hero">
          <div className="persona-seal">{persona.name.slice(0, 1)}</div>
          <div><span className="eyebrow">知识截止 {persona.knowledgeCutoff}</span><h2>{persona.name}</h2><p>{persona.historicalPositions[0]}</p></div>
          <div className="risk-gauge"><span>风险容忍度</span><strong>{persona.riskTolerance}</strong><i><b style={{ width: `${persona.riskTolerance}%` }} /></i></div>
        </article>
        <div className="two-column">
          <article className="panel compact-panel"><h3>政治目标</h3><ul>{persona.politicalObjectives.map((item) => <li key={item}>{item}</li>)}</ul></article>
          <article className="panel compact-panel"><h3>红线</h3><ul>{persona.redLines.map((item) => <li key={item}>{item}</li>)}</ul></article>
        </div>
        <article className="panel compact-panel"><span className="eyebrow">决策风格</span><p className="large-copy">{persona.decisionStyle}</p></article>
        <article className="panel">
          <div className="panel-heading"><div><span className="eyebrow">所选运行终局网络</span><h2>与 {persona.name} 直接相连的政治关系</h2></div></div>
          <div className="edge-list">
            {edges.length ? edges.map((edge, index) => (
              <div className="edge-row" key={`${edge.source}-${edge.target}-${edge.type}-${index}`}>
                <strong>{nameById[edge.source] ?? edge.source}</strong><span>{relationshipLabels[edge.type] ?? edge.type}<i style={{ width: `${Math.abs(edge.weight) * 100}%` }} /></span><strong>{nameById[edge.target] ?? edge.target}</strong>
              </div>
            )) : <p className="muted">终局状态没有记录该人物的直接网络边。</p>}
          </div>
        </article>
      </div>
    </section>
  );
}

function Timeline({ bundle, run }: { bundle: DashboardBundle; run: CompactRun }) {
  const [turnIndex, setTurnIndex] = useState(Math.max(0, run.turns.length - 1));
  useEffect(() => setTurnIndex(Math.max(0, run.turns.length - 1)), [run.id, run.turns.length]);
  const turn = run.turns[Math.min(turnIndex, run.turns.length - 1)];
  const nameById = Object.fromEntries(bundle.personas.map((persona) => [persona.id, persona.name]));
  if (!turn) return <div className="empty-state">此运行没有回合记录。</div>;
  return (
    <section className="section-stack">
      <div className="timeline-control panel">
        <div><span className="eyebrow">时间旅行控制器</span><h2>第 {turn.turn} 回合 · {turn.date}</h2></div>
        <input type="range" min="0" max={Math.max(0, run.turns.length - 1)} value={turnIndex} onChange={(event) => setTurnIndex(Number(event.target.value))} aria-label="选择模拟回合" />
        <div className="timeline-dates"><span>{run.turns[0]?.date}</span><span>{run.turns.at(-1)?.date}</span></div>
      </div>
      <div className="timeline-brief">
        <div><span className="eyebrow">议程</span><div className="pill-row">{turn.agenda.map((item) => <span key={item}>{item}</span>)}</div></div>
        <div><span className="eyebrow">活跃行动者</span><p>{turn.activeActorIds.map((id) => nameById[id] ?? id).join("、")}</p></div>
        <div><span className="eyebrow">本回合不确定性抽样</span><strong>{turn.randomDrawCount}</strong></div>
      </div>
      <article className="historian-note"><span>史家评议</span><p>{turn.historianCommentary}</p></article>
      <div className="event-grid">
        {turn.events.map((event) => (
          <article className="event-card" key={event.id}>
            <header><span>阶段 {event.phase} · {phaseLabels[event.phase] ?? event.type}</span><b className={`visibility ${event.visibility}`}>{event.visibility}</b></header>
            <h3>{event.title}</h3><p>{event.summary}</p>
            {event.sourceClaimIds.length > 0 && <footer>证据声明：{event.sourceClaimIds.slice(0, 4).join(" · ")}</footer>}
          </article>
        ))}
      </div>
      <div className="two-column">
        <article className="panel compact-panel"><h3>人物公开行动</h3>{turn.decisions.flatMap((decision) => decision.publicActions.map((action) => ({ ...action, actorId: decision.actorId }))).slice(0, 10).map((action) => <div className="action-row" key={action.id}><strong>{nameById[action.actorId] ?? action.actorId} · {action.title}</strong><p>{action.description}</p></div>)}</article>
        <article className="panel compact-panel"><h3>指标变化及原因</h3>{turn.deltas.slice(0, 14).map((delta, index) => <div className="delta-row" key={`${delta.metric}-${index}`}><span>{metricMeta[delta.metric]?.label ?? delta.metric}</span><b className={delta.appliedDelta >= 0 ? "positive" : "negative"}>{delta.appliedDelta >= 0 ? "+" : ""}{delta.appliedDelta}</b><p>{delta.reason}</p></div>)}</article>
      </div>
    </section>
  );
}

function InstitutionMap({ run }: { run: CompactRun }) {
  const values = run.finalMetrics;
  return (
    <section className="section-stack">
      <div className="institution-stage">
        <div className="institution-node royal"><span>礼仪元首</span><h3>清皇室</h3><p>国号、身份、部分宫产与国家象征</p><b>行政权 0 · 军令权 0</b></div>
        <div className="institution-arrow">成文宪法约束 ↓</div>
        <div className="institution-row">
          <div className="institution-node parliament"><span>立法与预算</span><h3>议会</h3><p>法案、预算审议、内阁责任</p><b>合法性 {fmt(values.parliament_legitimacy)}</b></div>
          <div className="institution-exchange">制衡 ↔ 冲突</div>
          <div className="institution-node cabinet"><span>中央行政</span><h3>袁世凯内阁</h3><p>人事、财政执行、军政协调</p><b>个人权力 {fmt(values.yuan_personal_power)}</b></div>
        </div>
        <div className="institution-arrow">预算与行政命令 ↓</div>
        <div className="institution-row triple">
          <div className="institution-node military"><span>军政机构</span><h3>北洋体系</h3><b>凝聚力 {fmt(values.beiyang_cohesion)}</b></div>
          <div className="institution-node province"><span>省级自治</span><h3>省政府与省议会</h3><b>服从度 {fmt(values.provincial_compliance)}</b></div>
          <div className="institution-node fiscal"><span>财政工商</span><h3>张謇制度线</h3><b>收入 {fmt(values.central_revenue)} · 赤字压力 {fmt(values.fiscal_deficit)}</b></div>
        </div>
      </div>
      <div className="power-legend"><span><i className="legal" />成文权限</span><span><i className="material" />事实资源</span><span><i className="risk" />执行冲突</span></div>
      <article className="analysis-card"><span className="eyebrow">制度解释</span><h2>法律权力与事实资源必须分开阅读</h2><p>皇室的军政权在法律上被锁死；但议会能否约束袁世凯，取决于预算执行、北洋军忠诚和地方服从。图中的数字仍是模型启发式指标，不是历史统计。</p></article>
    </section>
  );
}

function MetricEvolution({ run }: { run: CompactRun }) {
  const groups: Record<string, string[]> = {
    "合法性与权力": ["central_legitimacy", "monarchy_legitimacy", "parliament_legitimacy", "yuan_personal_power"],
    "军政风险": ["beiyang_cohesion", "civilian_control_of_military", "coup_risk", "civil_war_risk"],
    "财政与外交": ["central_revenue", "fiscal_deficit", "foreign_debt_pressure", "foreign_recognition"],
    "社会动员": ["revolutionary_mobilization", "party_system_strength", "popular_unrest", "ethnic_tension"],
  };
  const [group, setGroup] = useState(Object.keys(groups)[0]);
  const selected = groups[group];
  return (
    <section className="section-stack">
      <div className="panel">
        <div className="panel-heading"><div><span className="eyebrow">0–100 启发式指数</span><h2>{group}</h2></div><select value={group} onChange={(event) => setGroup(event.target.value)}>{Object.keys(groups).map((name) => <option key={name}>{name}</option>)}</select></div>
        <LineChart run={run} metrics={selected} height={390} />
      </div>
      <div className="metric-grid">{selected.map((metric) => <MetricBadge key={metric} metric={metric} value={run.finalMetrics[metric]} />)}</div>
      <article className="panel">
        <div className="panel-heading"><div><span className="eyebrow">逐回合变化热力图</span><h2>制度变化发生在何时</h2></div></div>
        <div className="heatmap-wrap">
          <table className="heatmap"><thead><tr><th>日期</th>{selected.map((metric) => <th key={metric}>{metricMeta[metric]?.label}</th>)}</tr></thead><tbody>{run.turns.map((turn) => <tr key={turn.turn}><th>{turn.date.slice(0, 7)}</th>{selected.map((metric) => { const delta = turn.deltas.filter((item) => item.metric === metric).reduce((sum, item) => sum + item.appliedDelta, 0); const alpha = Math.min(0.9, 0.18 + Math.abs(delta) / 12); return <td key={metric} style={{ background: delta === 0 ? "rgba(255,255,255,.035)" : delta > 0 ? `rgba(69,164,132,${alpha})` : `rgba(201,78,70,${alpha})` }}>{delta > 0 ? "+" : ""}{delta}</td>; })}</tr>)}</tbody></table>
        </div>
      </article>
    </section>
  );
}

function Ensemble({ bundle }: { bundle: DashboardBundle }) {
  const stressMetrics = ["central_legitimacy", "beiyang_cohesion", "constitutional_norm_strength", "civil_war_risk"];
  return (
    <section className="section-stack">
      <div className="two-column ensemble-columns">
        <article className="panel"><span className="eyebrow">20 次固定种子运行</span><h2>终局情景频率</h2><ScenarioBars bundle={bundle} /></article>
        <article className="panel"><span className="eyebrow">重要分歧点</span><h2>最早发生的随机分叉</h2><div className="divergence-list">{bundle.ensemble?.major_divergence_points?.slice(0, 6).map((point, index) => <div key={`${point.entity_id}-${index}`}><b>{point.date}</b><span>{point.uncertainty_event}</span><strong>{point.successes}/{point.observations}</strong><p>{point.entity_id}</p></div>)}</div></article>
      </div>
      {bundle.stress && <article className="panel">
        <div className="panel-heading"><div><span className="eyebrow">最关键压力测试</span><h2>袁世凯死亡之后，制度能否存活？</h2></div></div>
        <p className="large-copy">三条路径共享死亡前状态：历史锚点臂在 1916-07-15 注入死亡事件，危险窗口与存活对照臂不注入。结果用于识别继承结构的脆弱性，不代表客观概率。</p>
        <div className="stress-grid">{Object.entries(bundle.stress.arm_scenarios).map(([arm, scenario]) => <div key={arm}><span>{arm === "historical_anchor" ? "历史锚点臂" : arm === "hazard_window" ? "危险窗口臂" : "存活对照臂"}</span><strong>{scenario}</strong><small>{bundle.stress?.death_dates[arm] ? `死亡注入 ${bundle.stress.death_dates[arm]}` : "袁世凯存活"}</small></div>)}</div>
        <StressChart series={bundle.stress.series} metrics={stressMetrics} />
      </article>}
    </section>
  );
}

function StressChart({ series, metrics }: { series: Record<string, Array<{ date: string } & Metrics>>; metrics: string[] }) {
  const arms = Object.entries(series);
  return <div className="stress-small-multiples">{metrics.map((metric) => {
    const width = 430, height = 180, pad = 26;
    const maxLength = Math.max(2, ...arms.map(([, values]) => values.length));
    const x = (index: number) => pad + (index / (maxLength - 1)) * (width - pad * 2);
    const y = (value: number) => pad + (1 - Math.max(0, Math.min(100, value)) / 100) * (height - pad * 2);
    const colors: Record<string, string> = { historical_anchor: "#d2554d", hazard_window: "#d7a548", survival_control: "#49a49b" };
    return <div className="stress-chart" key={metric}><h4>{metricMeta[metric]?.label}</h4><svg viewBox={`0 0 ${width} ${height}`}><line x1={pad} y1={y(50)} x2={width - pad} y2={y(50)} className="grid-line" />{arms.map(([arm, values]) => <path key={arm} d={values.map((value, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(value[metric] ?? 0)}`).join(" ")} fill="none" stroke={colors[arm]} strokeWidth="3" />)}</svg></div>;
  })}</div>;
}

function Evidence({ bundle }: { bundle: DashboardBundle }) {
  const [personaId, setPersonaId] = useState("yuan_shikai");
  const [claimType, setClaimType] = useState("ALL");
  const persona = bundle.personas.find((item) => item.id === personaId) ?? bundle.personas[0];
  const claims = persona.evidence.filter((claim) => claimType === "ALL" || claim.type === claimType);
  const sourceMap = Object.fromEntries(persona.sources.map((source) => [source.id, source]));
  return (
    <section className="section-stack">
      <div className="evidence-controls panel"><div><span className="eyebrow">Persona Compiler 输出</span><h2>事实、推断与反事实假设分层</h2></div><select value={personaId} onChange={(event) => setPersonaId(event.target.value)}>{bundle.personas.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select><select value={claimType} onChange={(event) => setClaimType(event.target.value)}><option value="ALL">全部类型</option><option value="FACT">FACT · 史料事实</option><option value="INFERENCE">INFERENCE · 研究推断</option><option value="COUNTERFACTUAL_ASSUMPTION">COUNTERFACTUAL · 反事实设定</option><option value="INSUFFICIENT_EVIDENCE">INSUFFICIENT · 证据不足</option></select></div>
      <div className="evidence-list">{claims.map((claim) => <article className="evidence-card" key={claim.id}><header><span className={`claim-type ${claim.type.toLowerCase()}`}>{claim.type}</span><strong>{Math.round((claim.confidence ?? 0) * 100)}%</strong></header><h3>{claim.statement}</h3><p>字段：{claim.field} · 声明 ID：{claim.id}</p>{claim.sourceIds.length > 0 ? <div className="source-links">{claim.sourceIds.map((sourceId) => { const source = sourceMap[sourceId]; return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">{source.author ? `${source.author}：` : ""}{source.title}</a> : <span key={sourceId}>{sourceId}</span>; })}</div> : <div className="no-source">该类别按协议不伪造来源</div>}</article>)}</div>
    </section>
  );
}

function Worldbook({ bundle, run }: { bundle: DashboardBundle; run: CompactRun }) {
  const [turnIndex, setTurnIndex] = useState(Math.max(0, run.turns.length - 1));
  useEffect(() => setTurnIndex(Math.max(0, run.turns.length - 1)), [run.id, run.turns.length]);
  const turn = run.turns[Math.min(turnIndex, run.turns.length - 1)];
  const nameById = Object.fromEntries(bundle.personas.map((persona) => [persona.id, persona.name]));
  if (!turn) return <div className="empty-state">此运行没有可审计的世界书记录。</div>;
  return (
    <section className="section-stack">
      <article className="analysis-card">
        <span className="eyebrow">受约束的上下文检索</span>
        <h2>世界书不是“万能背景词库”</h2>
        <p>条目必须通过日期、可见性、行动者允许名单、状态条件、关键词或议程匹配，并受依赖深度与 prompt budget 限制。世界书只提供信息上下文；只有裁判与 StateReducer 能改变国家状态。</p>
      </article>
      <div className="timeline-control panel">
        <div><span className="eyebrow">选择回合</span><h2>第 {turn.turn} 回合 · {turn.date}</h2></div>
        <input type="range" min="0" max={Math.max(0, run.turns.length - 1)} value={turnIndex} onChange={(event) => setTurnIndex(Number(event.target.value))} aria-label="选择世界书回合" />
        <div className="timeline-dates"><span>{run.turns[0]?.date}</span><span>{run.turns.at(-1)?.date}</span></div>
      </div>
      <div className="two-column">
        {Object.entries(turn.worldbookActivations).map(([actorId, activations]) => {
          const included = activations.filter((entry) => entry.included);
          return <article className="panel compact-panel" key={actorId}>
            <span className="eyebrow">{nameById[actorId] ?? actorId}</span>
            <h3>本回合可见的公共/制度条目</h3>
            {included.length ? <ul>{included.map((entry) => <li key={entry.entryId}><strong>{entry.title}</strong><br /><small>{entry.reason} · {entry.promptSlot} · 约 {entry.estimatedTokens} tokens</small>{entry.sourceClaimIds.length > 0 && <small><br />声明：{entry.sourceClaimIds.join(" · ")}</small>}</li>)}</ul> : <p className="muted">没有满足检索条件的公开条目。</p>}
          </article>;
        })}
      </div>
      <article className="panel">
        <span className="eyebrow">公开政治承诺</span>
        <h2>跨回合可追踪的协议</h2>
        {turn.publicCommitments.length ? <div className="evidence-list">{turn.publicCommitments.map((commitment) => <article className="evidence-card" key={commitment.id}><header><span className="claim-type fact">{commitment.status}</span><strong>{commitment.enforceability}</strong></header><h3>{commitment.parties.map((id) => nameById[id] ?? id).join("、")}</h3><p>{commitment.terms.join("；")}</p><p>期限：{commitment.dueDate ?? "未设定"}</p></article>)}</div> : <p className="muted">本回合没有公开且仍可追踪的谈判承诺。私下协议不会出现在公共页面。</p>}
      </article>
    </section>
  );
}

function Loading() {
  return <main className="loading-screen"><div className="loading-seal">宪</div><h1>清末立宪存续模拟器</h1><p>正在装载可审计的反事实历史工件……</p><i /></main>;
}

export default function Dashboard() {
  const [bundle, setBundle] = useState<DashboardBundle | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("命运树");
  const [runId, setRunId] = useState("");
  useEffect(() => {
    fetch("/data/dashboard.json")
      .then((response) => {
        if (!response.ok) throw new Error(`数据载入失败 (${response.status})`);
        return response.json();
      })
      .then((data: DashboardBundle) => {
        setBundle(data);
        const collapse = data.runs.find((run) => run.scenarioCode === "H");
        setRunId(collapse?.id ?? data.runs[0]?.id ?? "");
      })
      .catch((reason) => setError(reason instanceof Error ? reason.message : "数据载入失败"));
  }, []);
  const run = useMemo(() => bundle?.runs.find((item) => item.id === runId) ?? bundle?.runs[0], [bundle, runId]);
  if (error) return <main className="loading-screen error-screen"><div className="loading-seal">!</div><h1>站点数据无法载入</h1><p>{error}</p></main>;
  if (!bundle || !run) return <Loading />;
  const scenario = scenarioMeta[run.scenarioCode] ?? scenarioMeta.J;
  return (
    <main className="site-shell">
      <div className="top-rule" />
      <header className="masthead">
        <div className="brand-lockup"><div className="brand-seal">清</div><div><span>QING CONSTITUTIONAL SURVIVAL SIMULATOR</span><h1>清末立宪存续模拟器</h1></div></div>
        <div className="masthead-meta"><span>1911 → 1930</span><b>史料溯源 · 多 Agent · 可复现</b></div>
      </header>
      <div className="methodology-banner"><span>方法警示</span><p>{bundle.methodologyNotice}</p></div>
      <nav className="tab-bar" aria-label="站点栏目">{tabs.map(([id, label]) => <button key={id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>{label}</button>)}</nav>
      <div className="workspace">
        <aside className="run-rail">
          <span className="eyebrow">选择模拟运行</span>
          <select value={run.id} onChange={(event) => setRunId(event.target.value)}>{bundle.runs.map((item) => <option value={item.id} key={item.id}>{item.scenarioCode} · Seed {item.seed}</option>)}</select>
          <div className="run-outcome" style={{ "--scenario-color": scenario.color } as React.CSSProperties}><span>{scenario.icon}</span><strong>{run.scenarioCode} · {run.scenarioLabel}</strong><small>{run.turns.length} 回合 · {shortDate(run.completedAt)}</small></div>
          <dl><div><dt>模型</dt><dd>{run.providerMode === "deterministic" ? "规则引擎" : "在线模型"}</dd></div><div><dt>模式</dt><dd>{run.mode === "quick" ? "快速" : "标准"}</dd></div><div><dt>次要路径</dt><dd>{run.secondaryScenarios.join(" / ") || "无"}</dd></div></dl>
          <div className="rail-note"><strong>审计边界</strong><p>历史人物只接收公开信息、自身私有信息与对其可见的传闻；人物不裁决行动是否成功。</p></div>
        </aside>
        <div className="main-canvas">
          {activeTab === "命运树" && <FateTree bundle={bundle} run={run} />}
          {activeTab === "总览" && <Overview bundle={bundle} run={run} />}
          {activeTab === "人物" && <People bundle={bundle} run={run} />}
          {activeTab === "时间线" && <Timeline bundle={bundle} run={run} />}
          {activeTab === "制度" && <InstitutionMap run={run} />}
          {activeTab === "指标" && <MetricEvolution run={run} />}
          {activeTab === "多轮" && <Ensemble bundle={bundle} />}
          {activeTab === "世界书" && <Worldbook bundle={bundle} run={run} />}
          {activeTab === "证据" && <Evidence bundle={bundle} />}
        </div>
      </div>
      <footer className="site-footer"><div><strong>清末立宪存续模拟器</strong><span>研究型反事实政治模拟 · Engine 0.7.0</span></div><p>historical plausibility &gt; entertaining dialogue · source provenance &gt; confident speculation</p></footer>
    </main>
  );
}
