# 🚀 部署到Vercel指南

## 方法一：通过Vercel控制台（推荐）

### 1. 准备GitHub仓库
```bash
# 在web目录下初始化git（如果还没有的话）
cd "/Users/wenjingmac/Library/CloudStorage/OneDrive-HKUST(Guangzhou)/Projects/清末立宪/web"
git init
git add .
git commit -m "初始提交：清末立宪历史模拟器

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

### 2. 推送到GitHub
- 访问 https://github.com/new
- 创建新仓库，名称如：`qing-constitution-simulator`
- 不要勾选"Initialize with README"
- 复制仓库URL（如：`https://github.com/你的用户名/qing-constitution-simulator.git`）

```bash
# 添加远程仓库并推送
git remote add origin https://github.com/你的用户名/qing-constitution-simulator.git
git branch -M main
git push -u origin main
```

### 3. 在Vercel部署
1. 访问 https://vercel.com/
2. 点击"Add New" → "Project"
3. 导入你的GitHub仓库
4. 配置：
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.vinext`
5. 添加环境变量（可选，因为我们改为前端输入API Key）：
   - 如果你想预配置API Key，添加：`DEEPSEEK_API_KEY` = `sk-569778ad384a4b51b2df2e431f607c62`
6. 点击"Deploy"

### 4. 完成！
- 5分钟后，你会获得一个公开URL，如：
  ```
  https://qing-constitution-simulator.vercel.app
  ```
- 每次推送到GitHub，Vercel会自动重新部署

---

## 方法二：通过Vercel CLI

### 1. 安装Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录Vercel
```bash
vercel login
```

### 3. 部署
```bash
cd "/Users/wenjingmac/Library/CloudStorage/OneDrive-HKUST(Guangzhou)/Projects/清末立宪/web"
vercel
```

按照提示操作：
- Link to existing project? → No
- What's your project's name? → qing-constitution-simulator
- In which directory is your code located? → ./
- Want to modify these settings? → No

### 4. 生产部署
```bash
vercel --prod
```

---

## 配置说明

### API Key配置
由于我们改为前端输入API Key，用户首次访问时会看到配置对话框。

如果你想在Vercel预配置API Key（让用户无需输入）：
1. 在Vercel项目设置中，进入"Environment Variables"
2. 添加：`DEEPSEEK_API_KEY` = `sk-569778ad384a4b51b2df2e431f607c62`
3. 重新部署项目

### 自定义域名（可选）
1. 在Vercel项目设置中，进入"Domains"
2. 添加你的域名（如：`qing-sim.yourdomain.com`）
3. 配置DNS记录（Vercel会提供详细指南）

---

## 故障排查

### 构建失败
- 检查 `package.json` 中的依赖是否完整
- 确保 `next.config.ts` 配置正确
- 查看Vercel构建日志

### API调用失败
- 检查API Key是否正确配置
- 确认DeepSeek API额度充足
- 查看浏览器控制台错误信息

### 页面无法访问
- 检查Vercel项目状态
- 确认域名DNS配置正确
- 清除浏览器缓存

---

## 费用说明

- **Vercel免费版**：
  - 100 GB带宽/月
  - 100小时构建时间/月
  - 无限项目
  - 足够个人和小型项目使用

- **DeepSeek API**：
  - deepseek-chat (flash): ¥1/百万tokens
  - 单次对话约10K tokens = ¥0.01
  - 预计成本：¥1-5/天（中等使用量）

---

## 下一步

部署完成后：
1. 访问你的Vercel URL
2. 输入API Key（或使用预配置的）
3. 开始模拟历史！
4. 分享URL给朋友

🎉 恭喜！你的清末立宪历史模拟器已经公开上线了！
