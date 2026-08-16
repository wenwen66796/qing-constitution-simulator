# 部署到Vercel - 完整指南

## 前置条件

1. **GitHub账号**（用于托管代码）
2. **Vercel账号**（免费，访问 https://vercel.com）
3. **DeepSeek API Key**（访问 https://platform.deepseek.com/ 获取）

## 步骤 1：准备代码

确保你的项目在GitHub上：

```bash
cd "/Users/wenjingmac/Library/CloudStorage/OneDrive-HKUST(Guangzhou)/Projects/清末立宪/web"

# 如果还没有初始化git
git init
git add .
git commit -m "Initial commit: 对话式历史模拟器"

# 创建GitHub仓库后，推送代码
git remote add origin https://github.com/你的用户名/qing-constitutional-simulator.git
git push -u origin main
```

## 步骤 2：连接Vercel

1. 访问 https://vercel.com/new
2. 点击 **"Import Git Repository"**
3. 选择你刚才创建的GitHub仓库
4. 点击 **"Import"**

## 步骤 3：配置环境变量

在Vercel项目设置页面：

1. 找到 **"Environment Variables"** 部分
2. 添加以下变量：

```
Key: DEEPSEEK_API_KEY
Value: sk-你的实际API密钥
Environment: Production, Preview, Development (全选)
```

3. 点击 **"Save"**

## 步骤 4：部署

1. Vercel会自动开始部署
2. 等待几分钟（首次部署需要安装依赖）
3. 部署完成后，你会看到一个公开URL：

```
https://qing-constitutional-simulator.vercel.app
```

或者类似：

```
https://qing-constitutional-simulator-你的用户名.vercel.app
```

## 步骤 5：自定义域名（可选）

如果你有自己的域名：

1. 在Vercel项目设置中找到 **"Domains"**
2. 点击 **"Add Domain"**
3. 输入你的域名（例如：`history.yourdomain.com`）
4. 按照Vercel提供的DNS配置说明，在你的域名提供商处添加记录
5. 等待DNS生效（通常几分钟到几小时）

## 步骤 6：测试部署

访问你的Vercel URL，确认：

✅ 页面正常加载  
✅ 帝国暗金主题显示正确  
✅ 点击"推进一回合"能触发AI模拟  
✅ 用户扮演模式正常工作  
✅ 导出功能可以下载JSON

## 自动部署

每次你推送代码到GitHub，Vercel会自动：

1. 检测到代码变化
2. 重新构建项目
3. 部署新版本
4. 保留旧版本（可以回滚）

```bash
# 本地修改后
git add .
git commit -m "优化对话界面"
git push

# Vercel会自动部署，几分钟后新版本上线
```

## 监控和调试

### 查看部署日志

1. 访问 https://vercel.com/你的用户名/qing-constitutional-simulator
2. 点击最新的部署
3. 查看 **"Build Logs"** 和 **"Runtime Logs"**

### 查看API调用

Vercel Functions面板会显示：
- API调用次数
- 响应时间
- 错误率

## 费用说明

### Vercel免费额度

- ✅ **无限流量**
- ✅ **100GB带宽/月**
- ✅ **1000次Function调用/天**
- ✅ **自动HTTPS**
- ✅ **全球CDN**

### DeepSeek API费用

DeepSeek R1定价（截至2026年8月）：
- **输入**: ¥0.014 / 1K tokens
- **输出**: ¥0.28 / 1K tokens

**估算**：每次对话约消耗1K输入 + 500输出 = ¥0.15

如果每天有100次对话 = ¥15/天

**建议**：
- 设置API调用限额
- 添加请求频率限制
- 监控每日消费

## 安全建议

### 1. 保护API Key

❌ **永远不要**把API Key提交到Git：

```bash
# 确保 .env.local 在 .gitignore 中
echo ".env.local" >> .gitignore
```

✅ **只在Vercel环境变量中配置**

### 2. 添加速率限制

编辑 `app/api/simulate/route.ts`，添加：

```typescript
// 简单的内存速率限制（生产环境建议用Redis）
const rateLimit = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const requests = rateLimit.get(ip) || [];
  const recentRequests = requests.filter(t => now - t < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  return true;
}

// 在POST函数开头添加
export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please try again later." },
      { status: 429 }
    );
  }
  
  // ... 其余代码
}
```

### 3. 监控异常流量

在Vercel Dashboard设置告警：
- Function调用次数 > 1000/小时
- 错误率 > 5%
- 响应时间 > 5秒

## 故障排查

### 问题1：部署失败

**原因**：依赖安装失败

**解决**：
```bash
# 本地测试构建
npm run build

# 如果成功，推送到GitHub
git push
```

### 问题2：API返回500错误

**原因**：DeepSeek API Key未配置或无效

**解决**：
1. 检查Vercel环境变量是否正确
2. 在DeepSeek平台确认Key有效
3. 查看Vercel Runtime Logs

### 问题3：页面空白

**原因**：客户端代码错误

**解决**：
1. 打开浏览器开发者工具（F12）
2. 查看Console错误
3. 检查Network请求是否成功

## 性能优化

### 1. 启用Edge Functions

编辑 `app/api/simulate/route.ts`：

```typescript
export const runtime = 'edge';
export const preferredRegion = ['sin1', 'hkg1']; // 新加坡、香港
```

### 2. 添加缓存

```typescript
export async function POST(request: NextRequest) {
  // 对相同输入缓存结果
  const cacheKey = JSON.stringify(body);
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return NextResponse.json(cached);
  }
  
  // ... 调用API
  
  cache.set(cacheKey, result);
  return NextResponse.json(result);
}
```

## 分享链接

部署完成后，你可以分享：

```
🌐 清末立宪历史模拟器
https://your-project.vercel.app

🎮 体验对话式历史演化
📊 AI驱动的政治博弈
🎭 扮演历史人物，改变历史进程
```

## 下一步

- [ ] 添加更多历史人物
- [ ] 实现多用户实时对战（WebSocket）
- [ ] 生成PDF报告
- [ ] 添加历史事件数据库
- [ ] 支持自定义场景

---

**需要帮助？**

- Vercel文档: https://vercel.com/docs
- DeepSeek文档: https://platform.deepseek.com/docs
- GitHub Issues: 提交问题到你的仓库
