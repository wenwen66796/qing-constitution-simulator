# 清末立宪存续模拟器：公开界面

这个 Next.js 项目是研究工件的公开阅读层和真实模拟的轻量入口。

- `/dashboard` 读取已审核的 ensemble、袁世凯死亡压力测试、史料与 persona 工件。
- `/simulator` 不再执行前端随机角色聊天或直接改写指标。它将请求交给 Python `SimulationDirector`，由世界书、信息投影、谈判、裁判团与唯一 StateReducer 共同处理。

## 本地运行

```bash
npm install
npm run dev
```

只浏览 dashboard 不需要任何模型服务。要启用 `/simulator`，先在仓库根目录启动 Python 服务：

```bash
python -m pip install -e ".[online,service]"
qing-sim serve --host 127.0.0.1 --port 8000
```

然后建立 `web/.env.local`：

```dotenv
QING_SIMULATION_API_URL=http://127.0.0.1:8000
```

访问者在网页中临时输入自己的 DeepSeek API Key。前端不会将其保存到 LocalStorage、URL 或任何公开数据文件；Vercel proxy 和 Python 服务只在处理当次请求时使用它。完整的生产部署与安全边界见仓库根目录的 [`docs/WEB_SERVICE_DEPLOYMENT.md`](../docs/WEB_SERVICE_DEPLOYMENT.md)。
