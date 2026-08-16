#!/bin/bash

# 测试DeepSeek API集成

echo "🧪 测试清末立宪模拟器API"
echo "================================"
echo ""

# 测试数据
TEST_PAYLOAD='{
  "character": {
    "id": "yuan_shikai",
    "name": "袁世凯",
    "faction": "北洋实力派",
    "role": "内阁总理大臣",
    "politicalObjectives": ["掌握实权", "控制军队"],
    "institutionalPreferences": ["强行政", "弱立法"],
    "allies": ["段祺瑞"],
    "rivals": ["载沣"],
    "redLines": ["军权旁落"],
    "decisionStyle": "务实权谋"
  },
  "situation": {
    "date": "1912-01-01",
    "metrics": {
      "central_legitimacy": 45,
      "constitutional_norm_strength": 35,
      "monarchy_legitimacy": 40,
      "coup_risk": 40,
      "yuan_personal_power": 70
    }
  },
  "history": []
}'

echo "📤 发送测试请求到 http://localhost:3000/api/simulate"
echo ""

# 发送请求
RESPONSE=$(curl -s -X POST \
  http://localhost:3000/api/simulate \
  -H "Content-Type: application/json" \
  -d "$TEST_PAYLOAD")

echo "📥 响应结果："
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# 检查是否成功
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo "✅ API测试成功！"
    echo ""
    echo "决策内容："
    echo "$RESPONSE" | jq -r '.decision.action' 2>/dev/null || echo "（JSON解析失败）"
elif echo "$RESPONSE" | grep -q 'API key'; then
    echo "⚠️  需要配置DeepSeek API Key"
    echo ""
    echo "请编辑 .env.local 文件，填入你的API Key"
    echo "获取地址: https://platform.deepseek.com/"
elif echo "$RESPONSE" | grep -q 'error'; then
    echo "❌ API调用失败"
    echo ""
    echo "错误信息："
    echo "$RESPONSE" | jq -r '.error' 2>/dev/null || echo "$RESPONSE"
else
    echo "❓ 未知响应"
fi

echo ""
echo "提示："
echo "- 确保开发服务器正在运行 (npm run dev)"
echo "- 确保 .env.local 中配置了 DEEPSEEK_API_KEY"
