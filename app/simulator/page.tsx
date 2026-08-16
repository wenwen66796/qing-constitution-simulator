"use client";

import { useEffect, useState } from "react";

type Decision = {
  character: string;
  characterId: string;
  action: string;
  reasoning: string;
  targets: string[];
  type: string;
  publicity: string;
  tone: string;
  timestamp: string;
};

type Character = {
  id: string;
  name: string;
  faction: string;
  role: string;
  avatar?: string;
  politicalObjectives: string[];
  institutionalPreferences: string[];
  allies: string[];
  rivals: string[];
  redLines: string[];
  decisionStyle: string;
};

type Metrics = {
  central_legitimacy: number;
  constitutional_norm_strength: number;
  monarchy_legitimacy: number;
  parliament_legitimacy: number;
  coup_risk: number;
  yuan_personal_power: number;
  beiyang_cohesion: number;
  revolutionary_mobilization: number;
};

const INITIAL_METRICS: Metrics = {
  central_legitimacy: 45,
  constitutional_norm_strength: 35,
  monarchy_legitimacy: 40,
  parliament_legitimacy: 30,
  coup_risk: 40,
  yuan_personal_power: 70,
  beiyang_cohesion: 65,
  revolutionary_mobilization: 35,
};

const CHARACTERS: Character[] = [
  {
    id: "yuan_shikai",
    name: "袁世凯",
    faction: "北洋实力派",
    role: "内阁总理大臣",
    politicalObjectives: ["掌握实权", "控制军队", "维持秩序"],
    institutionalPreferences: ["强行政", "弱立法"],
    allies: ["段祺瑞", "冯国璋"],
    rivals: ["载沣", "良弼"],
    redLines: ["军权旁落", "个人权力被剥夺"],
    decisionStyle: "务实权谋，等待时机",
  },
  {
    id: "zhang_jian",
    name: "张謇",
    faction: "立宪派",
    role: "实业家、立宪领袖",
    politicalObjectives: ["建立责任内阁", "议会监督行政", "地方自治"],
    institutionalPreferences: ["英式君主立宪", "三权分立"],
    allies: ["汤化龙", "梁启超"],
    rivals: ["宗社党"],
    redLines: ["宪法被废除", "议会被解散"],
    decisionStyle: "温和改良，注重程序",
  },
  {
    id: "zaifeng",
    name: "载沣",
    faction: "宗室保守派",
    role: "摄政王（已被架空）",
    politicalObjectives: ["保全皇室", "恢复部分权力"],
    institutionalPreferences: ["保留君主实权"],
    allies: ["良弼", "铁良"],
    rivals: ["袁世凯", "立宪派"],
    redLines: ["皇帝退位", "皇室财产被剥夺"],
    decisionStyle: "保守谨慎，依赖亲信",
  },
  {
    id: "liangbi",
    name: "良弼",
    faction: "宗社党",
    role: "禁卫军统领",
    politicalObjectives: ["保卫皇权", "对抗袁世凯"],
    institutionalPreferences: ["君主专制"],
    allies: ["载沣", "铁良"],
    rivals: ["袁世凯", "革命党"],
    redLines: ["皇权完全丧失"],
    decisionStyle: "激进强硬，不惜政变",
  },
  {
    id: "tang_hualong",
    name: "汤化龙",
    faction: "立宪派",
    role: "湖北咨议局议长",
    politicalObjectives: ["推动地方自治", "约束中央集权"],
    institutionalPreferences: ["联邦制倾向"],
    allies: ["张謇", "各省咨议局"],
    rivals: ["中央集权派"],
    redLines: ["地方自治被取消"],
    decisionStyle: "地方本位，强调分权",
  },
];

const FACTION_COLORS: Record<string, string> = {
  "北洋实力派": "#8b3a3a",
  "立宪派": "#3d8a5e",
  "宗室保守派": "#6b3a1a",
  "宗社党": "#5a2a7a",
};

export default function ConversationalSimulator() {
  const [history, setHistory] = useState<Decision[]>([]);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [currentDate, setCurrentDate] = useState("1912-01-01");
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [isSimulating, setIsSimulating] = useState(false);
  const [userMode, setUserMode] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [userAction, setUserAction] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(true);

  const simulateNextTurn = async () => {
    if (!apiKey) {
      alert("请先输入API密钥");
      setShowApiKeyDialog(true);
      return;
    }

    setIsSimulating(true);

    // 随机选择2-3个活跃角色进行决策
    const activeCharacters = CHARACTERS.slice(0, Math.floor(Math.random() * 2) + 2);

    for (const character of activeCharacters) {
      try {
        const response = await fetch("/api/simulate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            character,
            situation: { metrics, date: currentDate },
            history,
            apiKey,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setHistory((prev) => [...prev, data.decision]);

          // 根据决策类型更新指标
          setMetrics((prev) => updateMetrics(prev, data.decision));

          // 视觉效果等待
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          console.error("模拟失败:", data.error);
          if (data.error.includes("API") || data.error.includes("密钥")) {
            alert("API调用失败，请检查密钥是否正确");
            setShowApiKeyDialog(true);
          }
        }
      } catch (error) {
        console.error("模拟错误:", error);
      }
    }

    // 推进回合和日期
    setCurrentTurn((prev) => prev + 1);
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    setCurrentDate(nextDate.toISOString().split("T")[0]);

    setIsSimulating(false);
  };

  const handleUserDecision = async () => {
    if (!selectedCharacter || !userAction.trim()) return;

    const userDecision: Decision = {
      character: selectedCharacter.name,
      characterId: selectedCharacter.id,
      action: userAction,
      reasoning: "用户决策",
      targets: [],
      type: "user_action",
      publicity: "public",
      tone: "neutral",
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => [...prev, userDecision]);
    setMetrics((prev) => updateMetrics(prev, userDecision));
    setUserAction("");
    setUserMode(false);

    // Trigger AI characters to respond
    await simulateNextTurn();
  };

  const updateMetrics = (prev: Metrics, decision: Decision): Metrics => {
    const updates = { ...prev };

    // 基于决策类型的简单启发式指标变化
    switch (decision.type) {
      case "constitutional_reform":
        updates.constitutional_norm_strength += 10;
        updates.parliament_legitimacy += 5;
        updates.coup_risk += 5;
        break;
      case "power_struggle":
        updates.yuan_personal_power += 8;
        updates.coup_risk += 15;
        updates.central_legitimacy -= 5;
        break;
      case "military_action":
        updates.coup_risk += 20;
        updates.beiyang_cohesion -= 10;
        break;
      case "negotiation":
        updates.central_legitimacy += 3;
        updates.coup_risk -= 3;
        break;
      case "fiscal_policy":
        updates.central_legitimacy += 5;
        break;
    }

    // 将值限制在0-100之间
    Object.keys(updates).forEach((key) => {
      updates[key as keyof Metrics] = Math.max(
        0,
        Math.min(100, updates[key as keyof Metrics])
      );
    });

    return updates;
  };

  const exportTimeline = () => {
    const exportData = {
      turns: currentTurn,
      startDate: "1912-01-01",
      endDate: currentDate,
      finalMetrics: metrics,
      history,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `清末立宪模拟_${currentDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ background: "#080c18" }}>
      {/* API密钥对话框 */}
      {showApiKeyDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4 p-6 rounded-lg" style={{ background: "#0b0e1e", border: "1px solid #252540" }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: "#c8a84b" }}>
              🔑 配置API密钥
            </h3>
            <p className="text-sm mb-4" style={{ color: "#ddd0b0" }}>
              请输入你的DeepSeek API密钥以开始模拟历史。
            </p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 rounded-lg mb-4"
              style={{
                background: "#101228",
                border: "1px solid #252540",
                color: "#ddd0b0",
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (apiKey.trim()) {
                    setShowApiKeyDialog(false);
                  } else {
                    alert("请输入有效的API密钥");
                  }
                }}
                className="flex-1 px-4 py-2 rounded-lg font-medium"
                style={{
                  background: "#2a5a4a",
                  color: "#ddd0b0",
                }}
              >
                确认
              </button>
              <button
                onClick={() => setShowApiKeyDialog(false)}
                className="px-4 py-2 rounded-lg"
                style={{
                  background: "#1a1530",
                  border: "1px solid #3a3050",
                  color: "#8a7a60",
                }}
              >
                取消
              </button>
            </div>
            <p className="text-xs mt-4" style={{ color: "#8a7a60" }}>
              💡 获取密钥：<a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="underline">https://platform.deepseek.com/</a>
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b" style={{ borderColor: "#252540", background: "#0b0e1e" }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold" style={{ color: "#c8a84b" }}>
            🏛️ 清末立宪历史模拟器
          </h1>
          <p className="text-sm mt-1" style={{ color: "#8a7a60" }}>
            对话式历史演化 · DeepSeek驱动 · 第{currentTurn}回合 · {currentDate}
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-12 gap-6">
        {/* Left: Metrics Panel */}
        <div className="col-span-3">
          <div className="sticky top-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "#c8a84b" }}>
              📊 当前局势
            </h2>

            <div className="space-y-3">
              {Object.entries(metrics).map(([key, value]) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: "#8a7a60" }}>
                      {key === "central_legitimacy" && "中央合法性"}
                      {key === "constitutional_norm_strength" && "宪政规范"}
                      {key === "monarchy_legitimacy" && "君主合法性"}
                      {key === "parliament_legitimacy" && "议会合法性"}
                      {key === "coup_risk" && "政变风险"}
                      {key === "yuan_personal_power" && "袁世凯权力"}
                      {key === "beiyang_cohesion" && "北洋凝聚力"}
                      {key === "revolutionary_mobilization" && "革命动员"}
                    </span>
                    <span style={{ color: "#c8a84b" }}>{value.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "#1e1e38" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        background: value > 70 ? "#6a9a6a" : value < 30 ? "#9a6a6a" : "#c8a84b",
                        width: `${value}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={simulateNextTurn}
              disabled={isSimulating || userMode}
              className="w-full mt-6 px-4 py-2.5 rounded-lg font-medium transition-all"
              style={{
                background: isSimulating || userMode ? "#252540" : "#1a1530",
                border: "1px solid #3a3050",
                color: isSimulating || userMode ? "#5a5a7a" : "#c8a84b",
              }}
            >
              {isSimulating ? "⏳ 模拟中..." : "▶️ 推进一回合"}
            </button>

            <button
              onClick={() => setUserMode(!userMode)}
              disabled={isSimulating}
              className="w-full mt-3 px-4 py-2.5 rounded-lg font-medium transition-all"
              style={{
                background: userMode ? "#1a3030" : "#1a1530",
                border: `1px solid ${userMode ? "#3a6050" : "#3a3050"}`,
                color: userMode ? "#6a9a6a" : "#8a7a60",
              }}
            >
              {userMode ? "✅ 用户模式" : "🎭 扮演角色"}
            </button>

            <button
              onClick={exportTimeline}
              className="w-full mt-3 px-4 py-2 rounded-lg text-sm transition-all"
              style={{
                background: "#1a1530",
                border: "1px solid #3a3050",
                color: "#8a7a60",
              }}
            >
              📥 导出时间轴
            </button>

            <button
              onClick={() => setShowApiKeyDialog(true)}
              className="w-full mt-3 px-4 py-2 rounded-lg text-sm transition-all"
              style={{
                background: "#1a1530",
                border: "1px solid #3a3050",
                color: "#8a7a60",
              }}
            >
              🔑 修改API密钥
            </button>
          </div>
        </div>

        {/* Middle: Conversation Timeline */}
        <div className="col-span-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#c8a84b" }}>
            💬 历史对话
          </h2>

          <div className="space-y-4">
            {history.length === 0 && (
              <div className="text-center py-12" style={{ color: "#5a5a7a" }}>
                <p>点击"推进一回合"开始模拟历史...</p>
                <p className="text-xs mt-2">首次运行需要配置API密钥</p>
              </div>
            )}

            {history.map((decision, idx) => {
              const character = CHARACTERS.find((c) => c.id === decision.characterId);
              const factionColor = character ? FACTION_COLORS[character.faction] : "#5a5a7a";

              return (
                <div key={idx} className="flex gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ background: factionColor, color: "#fff" }}
                  >
                    {decision.character[0]}
                  </div>

                  {/* Message Bubble */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color: "#c8a84b" }}>
                        {decision.character}
                      </span>
                      <span className="text-xs" style={{ color: "#5a5a7a" }}>
                        {character?.faction}
                      </span>
                    </div>

                    <div
                      className="p-3 rounded-lg"
                      style={{ background: "#101228", border: "1px solid #252540" }}
                    >
                      <p className="text-sm" style={{ color: "#ddd0b0" }}>
                        {decision.action}
                      </p>

                      {decision.reasoning && (
                        <details className="mt-2">
                          <summary
                            className="text-xs cursor-pointer"
                            style={{ color: "#8a7a60" }}
                          >
                            内心想法
                          </summary>
                          <p className="text-xs mt-1" style={{ color: "#8a7a60" }}>
                            {decision.reasoning}
                          </p>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* User Input */}
          {userMode && (
            <div className="mt-6 p-4 rounded-lg" style={{ background: "#1a3030", border: "1px solid #3a6050" }}>
              <h3 className="font-semibold mb-3" style={{ color: "#6a9a6a" }}>
                🎭 你的回合
              </h3>

              <select
                value={selectedCharacter?.id || ""}
                onChange={(e) => {
                  const char = CHARACTERS.find((c) => c.id === e.target.value);
                  setSelectedCharacter(char || null);
                }}
                className="w-full px-3 py-2 rounded-lg mb-3"
                style={{
                  background: "#101228",
                  border: "1px solid #252540",
                  color: "#ddd0b0",
                }}
              >
                <option value="">选择你要扮演的角色...</option>
                {CHARACTERS.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name} ({char.faction})
                  </option>
                ))}
              </select>

              <textarea
                value={userAction}
                onChange={(e) => setUserAction(e.target.value)}
                placeholder="描述你的行动..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg mb-3"
                style={{
                  background: "#101228",
                  border: "1px solid #252540",
                  color: "#ddd0b0",
                }}
              />

              <button
                onClick={handleUserDecision}
                disabled={!selectedCharacter || !userAction.trim()}
                className="px-4 py-2 rounded-lg font-medium"
                style={{
                  background: selectedCharacter && userAction.trim() ? "#2a5a4a" : "#252540",
                  color: selectedCharacter && userAction.trim() ? "#ddd0b0" : "#5a5a7a",
                }}
              >
                🚀 执行决策
              </button>
            </div>
          )}
        </div>

        {/* Right: Character Cards */}
        <div className="col-span-3">
          <h2 className="text-lg font-semibold mb-4" style={{ color: "#c8a84b" }}>
            👥 人物
          </h2>

          <div className="space-y-3">
            {CHARACTERS.map((char) => (
              <div
                key={char.id}
                className="p-3 rounded-lg"
                style={{ background: "#101228", border: "1px solid #252540" }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2"
                  style={{ background: FACTION_COLORS[char.faction], color: "#fff" }}
                >
                  {char.name[0]}
                </div>
                <h3 className="font-semibold text-sm" style={{ color: "#c8a84b" }}>
                  {char.name}
                </h3>
                <p className="text-xs mb-1" style={{ color: "#8a7a60" }}>
                  {char.faction}
                </p>
                <p className="text-xs" style={{ color: "#8a7a60" }}>
                  {char.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
