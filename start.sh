#!/bin/bash

# 清末立宪历史模拟器 - 启动脚本

set -e

PROJECT_DIR="/Users/wenjingmac/Library/CloudStorage/OneDrive-HKUST(Guangzhou)/Projects/清末立宪/web"

echo "🏛️  清末立宪历史模拟器"
echo "================================"
echo ""

cd "$PROJECT_DIR"

# 检查 .env.local 是否存在
if [ ! -f ".env.local" ]; then
    echo "⚠️  未找到 .env.local 文件"
    echo ""
    echo "请按照以下步骤配置："
    echo "1. cp .env.local.example .env.local"
    echo "2. 编辑 .env.local，填入你的 DeepSeek API Key"
    echo "3. 获取API Key: https://platform.deepseek.com/"
    echo ""
    exit 1
fi

# 检查是否有API Key
if grep -q "your_deepseek_api_key_here" .env.local 2>/dev/null; then
    echo "⚠️  检测到默认API Key"
    echo ""
    echo "请编辑 .env.local，填入真实的 DeepSeek API Key"
    echo "获取地址: https://platform.deepseek.com/"
    echo ""

    read -p "是否继续启动？(y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 启动服务
echo ""
echo "🚀 启动开发服务器..."
echo ""
echo "访问地址："
echo "  本地: http://localhost:3000"
echo "  调试: http://localhost:3000/__debug"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

npm run dev
