#!/bin/bash

echo "🚀 清末立宪历史模拟器 - 自动部署脚本"
echo "================================================"
echo ""

# 检查是否已配置Git remote
if git remote get-url origin 2>/dev/null; then
    echo "✅ Git远程仓库已配置"
    git remote -v
    echo ""
else
    echo "❌ 未配置Git远程仓库"
    echo ""
    echo "请先在GitHub创建仓库："
    echo "1. 访问 https://github.com/new"
    echo "2. 仓库名：qing-constitution-simulator"
    echo "3. 设为Public"
    echo "4. 不勾选任何初始化选项"
    echo ""
    read -p "输入你的GitHub用户名: " username
    echo ""
    git remote add origin "https://github.com/$username/qing-constitution-simulator.git"
    echo "✅ 已配置远程仓库: https://github.com/$username/qing-constitution-simulator.git"
    echo ""
fi

# 推送到GitHub
echo "📤 推送代码到GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    echo ""
else
    echo ""
    echo "❌ 推送失败，请检查："
    echo "- GitHub仓库是否已创建"
    echo "- 是否有推送权限"
    echo "- 网络连接是否正常"
    echo ""
    exit 1
fi

# 部署到Vercel
echo "🌐 部署到Vercel..."
echo ""
echo "选择部署方式："
echo "1. 通过Vercel网站（推荐，更稳定）"
echo "2. 通过Vercel CLI（需要登录）"
echo ""
read -p "请选择 [1/2]: " choice

if [ "$choice" = "1" ]; then
    echo ""
    echo "📋 请按照以下步骤操作："
    echo ""
    echo "1. 访问 https://vercel.com/"
    echo "2. 用GitHub账号登录"
    echo "3. 点击 'Add New' → 'Project'"
    echo "4. 选择 'qing-constitution-simulator' 仓库"
    echo "5. 点击 'Import'"
    echo "6. 保持默认设置，点击 'Deploy'"
    echo "7. 等待3-5分钟完成部署"
    echo ""
    echo "🎉 完成后你会得到一个永久URL，例如："
    echo "   https://qing-constitution-simulator.vercel.app"
    echo ""
    echo "📱 用浏览器打开Vercel网站继续部署"
    open "https://vercel.com/new"
    
elif [ "$choice" = "2" ]; then
    echo ""
    echo "🔐 启动Vercel CLI部署..."
    
    # 检查vercel命令是否存在
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI未安装"
        echo ""
        echo "安装方法："
        echo "npm install -g vercel"
        echo ""
        exit 1
    fi
    
    # 登录Vercel
    echo "请在浏览器中完成登录..."
    vercel login
    
    # 部署
    echo ""
    echo "开始部署..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 部署成功！"
        echo ""
    else
        echo ""
        echo "❌ 部署失败，请尝试方式1（通过网站部署）"
        echo ""
    fi
else
    echo "❌ 无效选择"
    exit 1
fi

echo "================================================"
echo "✅ 部署流程完成！"
echo ""
echo "📌 下一步："
echo "1. 访问你的Vercel URL"
echo "2. 输入API密钥: sk-569778ad384a4b51b2df2e431f607c62"
echo "3. 开始模拟历史！"
echo ""
echo "📚 完整文档："
echo "- README.md"
echo "- 🚀快速部署指南.md"
echo "- 📦最终交付清单.md"
echo ""
