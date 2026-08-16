import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

// 角色决策生成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character, situation, history, userAction, apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        { error: "需要提供API密钥" },
        { status: 400 }
      );
    }

    // 构建角色决策提示词
    const prompt = buildCharacterPrompt(character, situation, history, userAction);

    // 调用DeepSeek API（使用flash模型）
    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你正在模拟清末立宪时期（1911-1916）的历史人物。请根据人物性格、政治目标和当前局势生成真实的决策。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("DeepSeek API错误:", errorText);
      return NextResponse.json(
        { error: "API调用失败", details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const decision = data.choices[0].message.content;

    // 解析结构化决策
    const parsedDecision = parseDecision(decision, character);

    return NextResponse.json({
      success: true,
      character: character.name,
      decision: parsedDecision,
      rawResponse: decision,
    });

  } catch (error) {
    console.error("模拟错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误", details: String(error) },
      { status: 500 }
    );
  }
}

function buildCharacterPrompt(
  character: any,
  situation: any,
  history: any[],
  userAction?: any
): string {
  let prompt = `你现在扮演**${character.name}**，时间是${situation.date}。

## 你的身份信息
- 政治立场：${character.politicalObjectives.join("、")}
- 制度偏好：${character.institutionalPreferences.join("、")}
- 盟友：${character.allies.join("、")}
- 对手：${character.rivals.join("、")}
- 红线：${character.redLines.join("；")}
- 决策风格：${character.decisionStyle}

## 当前局势
- 中央合法性：${situation.metrics.central_legitimacy}
- 宪政规范强度：${situation.metrics.constitutional_norm_strength}
- 君主制合法性：${situation.metrics.monarchy_legitimacy}
- 政变风险：${situation.metrics.coup_risk}
- 袁世凯个人权力：${situation.metrics.yuan_personal_power}

`;

  if (history.length > 0) {
    prompt += `## 最近发生的事件\n`;
    history.slice(-5).forEach((event: any) => {
      prompt += `- ${event.character}：${event.action}\n`;
    });
  }

  if (userAction) {
    prompt += `\n## 刚刚发生\n${userAction.character}做出决策：${userAction.action}\n`;
  }

  prompt += `\n## 你的决策
请基于你的政治目标和当前局势，做出一个**具体的行动决策**。

请用以下JSON格式回答：
\`\`\`json
{
  "action": "你的具体行动（一句话）",
  "reasoning": "你的内心想法（为什么这样做）",
  "targets": ["受此行动影响的其他人物"],
  "type": "constitutional_reform / power_struggle / military_action / negotiation / fiscal_policy",
  "publicity": "public / private / secret",
  "tone": "aggressive / cautious / conciliatory / neutral"
}
\`\`\`
`;

  return prompt;
}

function parseDecision(rawResponse: string, character: any): any {
  try {
    // 从markdown代码块中提取JSON
    const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : rawResponse;

    const parsed = JSON.parse(jsonStr);

    return {
      character: character.name,
      characterId: character.id,
      action: parsed.action || "观望局势",
      reasoning: parsed.reasoning || "",
      targets: parsed.targets || [],
      type: parsed.type || "negotiation",
      publicity: parsed.publicity || "public",
      tone: parsed.tone || "neutral",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // 备用方案：从文本中提取关键信息
    return {
      character: character.name,
      characterId: character.id,
      action: rawResponse.slice(0, 200),
      reasoning: "AI生成的回复",
      targets: [],
      type: "negotiation",
      publicity: "public",
      tone: "neutral",
      timestamp: new Date().toISOString(),
    };
  }
}
