import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const simulationDir = join(repoRoot, "data/simulations");
const personaDir = join(repoRoot, "data/personas");
const evidenceDir = join(repoRoot, "data/evidence");
const outputDir = join(repoRoot, "web/public/data");

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const compactAction = (action) => ({
  id: action.id,
  type: action.action_type,
  title: action.title,
  description: action.description,
  targets: action.target_ids ?? [],
  intensity: action.intensity,
  evidenceClaimIds: action.evidence_claim_ids ?? [],
});

const compactDecision = ([actorId, decision]) => ({
  actorId,
  confidence: decision.confidence,
  redLineStatus: decision.red_line_status,
  reasoning: decision.reasoning_summary,
  beliefUpdates: decision.belief_updates ?? [],
  publicActions: (decision.public_actions ?? []).map(compactAction),
  proposals: (decision.proposals ?? []).map((proposal) => ({
    id: proposal.id,
    targets: proposal.target_ids ?? [],
    offer: proposal.offer ?? [],
    request: proposal.request ?? [],
  })),
});

const compactFinding = (finding) => ({
  referee: finding.referee,
  actionId: finding.action_id,
  success: finding.success,
  legality: finding.legality,
  explanation: finding.explanation,
  flags: finding.flags ?? [],
});

const compactEvent = (event) => ({
  id: event.id,
  phase: event.phase,
  type: event.event_type,
  title: event.title,
  summary: event.summary,
  actorIds: event.actor_ids ?? [],
  visibility: event.visibility,
  sourceClaimIds: event.source_claim_ids ?? [],
  counterfactualReasoning: event.counterfactual_reasoning ?? [],
  uncertaintyNotes: event.uncertainty_notes ?? [],
});

const compactTurn = (turn) => ({
  turn: turn.turn,
  date: turn.date,
  agenda: turn.agenda ?? [],
  activeActorIds: turn.active_actor_ids ?? [],
  historianCommentary: turn.historian_commentary,
  metrics: turn.state_after?.metrics ?? {},
  fiscal: turn.state_after?.fiscal ?? {},
  networkEdges: turn.state_after?.political_network_edges ?? [],
  deltas: (turn.metric_deltas ?? []).map((delta) => ({
    metric: delta.metric,
    oldValue: delta.old_value,
    appliedDelta: delta.applied_delta,
    newValue: delta.new_value,
    reason: delta.reason,
    provenance: delta.rule_or_referee,
  })),
  events: (turn.events ?? []).map(compactEvent),
  decisions: Object.entries(turn.decisions ?? {}).map(compactDecision),
  findings: (turn.findings ?? []).map(compactFinding),
  criticFlags: turn.critic_flags ?? [],
  randomDrawCount: (turn.random_draws ?? []).length,
  // The public bundle deliberately excludes actor-private profile entries,
  // private memories, and non-public commitments. It still exposes enough
  // retrieval metadata to audit what institutional/public context shaped a
  // turn without leaking a participant's private state.
  worldbookActivations: Object.fromEntries(
    Object.entries(turn.worldbook_activations ?? {}).map(([actorId, activations]) => [
      actorId,
      (activations ?? [])
        .filter((activation) => !String(activation.entry_id).startsWith("actor."))
        .map((activation) => ({
          entryId: activation.entry_id,
          title: activation.title,
          promptSlot: activation.prompt_slot,
          included: activation.included,
          reason: activation.reason,
          estimatedTokens: activation.estimated_tokens,
          recursionDepth: activation.recursion_depth,
          sourceClaimIds: activation.source_claim_ids ?? [],
        })),
    ])
  ),
  publicCommitments: (turn.state_after?.commitments ?? [])
    .filter((commitment) => commitment.visibility === "public")
    .map((commitment) => ({
      id: commitment.id,
      parties: commitment.parties ?? [],
      terms: commitment.terms ?? [],
      dueDate: commitment.due_date,
      status: commitment.status,
      enforceability: commitment.enforceability,
    })),
});

const compactRun = (run) => ({
  id: run.run_id,
  seed: run.seed,
  mode: run.mode,
  providerMode: run.provider_mode,
  requestedEndDate: run.requested_end_date,
  completedAt: run.completed_at,
  scenarioCode: run.scenario_code,
  scenarioLabel: run.scenario_label,
  scenarioRationale: run.scenario_rationale ?? [],
  secondaryScenarios: run.secondary_scenarios ?? [],
  evidenceEventIds: run.scenario_evidence_event_ids ?? [],
  warnings: run.warnings ?? [],
  heuristicsNotice: run.heuristics_notice,
  initialMetrics: run.initial_state?.metrics ?? {},
  finalMetrics: run.final_state?.metrics ?? {},
  finalFiscal: run.final_state?.fiscal ?? {},
  finalNetworkEdges: run.final_state?.political_network_edges ?? [],
  institutionalPower: run.final_state?.institutional_power ?? {},
  constitutionalOrder: run.final_state?.constitutional_order ?? {},
  turns: (run.turns ?? []).map(compactTurn),
});

const compactPersona = (persona) => ({
  id: persona.id,
  name: persona.name,
  groups: persona.groups ?? [],
  dateContext: persona.date_context,
  knowledgeCutoff: persona.knowledge_cutoff,
  historicalPositions: persona.historical_positions ?? [],
  politicalObjectives: persona.political_objectives ?? [],
  economicInterests: persona.economic_interests ?? [],
  institutionalPreferences: persona.institutional_preferences ?? [],
  militaryResources: persona.military_resources ?? [],
  politicalNetwork: persona.political_network ?? [],
  allies: persona.allies ?? [],
  rivals: persona.rivals ?? [],
  redLines: persona.red_lines ?? [],
  negotiablePositions: persona.negotiable_positions ?? [],
  riskTolerance: persona.risk_tolerance,
  attitudes: {
    monarchy: persona.attitude_toward_monarchy,
    republic: persona.attitude_toward_republic,
    parliament: persona.attitude_toward_parliament,
    centralization: persona.attitude_toward_centralization,
    provincialAutonomy: persona.attitude_toward_provincial_autonomy,
    foreignLoans: persona.attitude_toward_foreign_loans,
  },
  decisionStyle: persona.decision_style,
  evidence: (persona.evidence ?? []).map((claim) => ({
    id: claim.id,
    field: claim.field,
    type: claim.claim_type,
    statement: claim.statement,
    sourceIds: claim.source_ids ?? [],
    confidence: claim.confidence,
    validFrom: claim.valid_from,
    validTo: claim.valid_to,
    notes: claim.notes,
  })),
  sources: (persona.sources ?? []).map((source) => ({
    id: source.id,
    title: source.title,
    author: source.author,
    date: source.date,
    type: source.type,
    url: source.url,
    locator: source.locator,
    notes: source.notes,
  })),
});

const simulationFiles = (await readdir(simulationDir)).filter((name) => name.endsWith(".json"));
const runFiles = simulationFiles.filter((name) => name.startsWith("run-"));
const ensembleFile = simulationFiles.find((name) => name.startsWith("ensemble-"));
const stressFile = simulationFiles.find((name) => name.startsWith("yuan-death-stress-"));

const rawRuns = await Promise.all(runFiles.map((name) => readJson(join(simulationDir, name))));
const runs = rawRuns.map(compactRun).sort((a, b) => a.seed - b.seed || a.id.localeCompare(b.id));
const ensemble = ensembleFile ? await readJson(join(simulationDir, ensembleFile)) : null;
const stress = stressFile ? await readJson(join(simulationDir, stressFile)) : null;

const personaFiles = (await readdir(personaDir)).filter((name) => name.endsWith(".json"));
const personas = (
  await Promise.all(personaFiles.map((name) => readJson(join(personaDir, name))))
)
  .map(compactPersona)
  .sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));

const evidenceFiles = (await readdir(evidenceDir)).filter((name) => name.endsWith(".json"));
const evidencePackets = await Promise.all(evidenceFiles.map((name) => readJson(join(evidenceDir, name))));

const stressSeries = {};
if (stress) {
  for (const [arm, runId] of Object.entries(stress.arm_run_ids ?? {})) {
    const member = runs.find((run) => run.id === runId);
    stressSeries[arm] = member
      ? [
          { date: member.turns[0]?.date ?? member.completedAt.slice(0, 10), ...member.initialMetrics },
          ...member.turns.map((turn) => ({ date: turn.date, ...turn.metrics })),
        ]
      : [];
  }
}

const bundle = {
  generatedAt: new Date().toISOString(),
  methodologyNotice:
    "这些数字是 simulation heuristics，不是真实历史统计数据；模拟频率不等于客观历史概率。",
  corpus: {
    runs: runs.length,
    turns: runs.reduce((sum, run) => sum + run.turns.length, 0),
    personas: personas.length,
    evidenceClaims: personas.reduce((sum, persona) => sum + persona.evidence.length, 0),
  },
  runs,
  ensemble,
  stress: stress ? { ...stress, series: stressSeries } : null,
  personas,
  evidencePackets,
};

await mkdir(outputDir, { recursive: true });
const outputPath = join(outputDir, "dashboard.json");
await writeFile(outputPath, JSON.stringify(bundle));
const bytes = Buffer.byteLength(JSON.stringify(bundle));
console.log(`Wrote ${outputPath} (${(bytes / 1024 / 1024).toFixed(2)} MiB)`);
