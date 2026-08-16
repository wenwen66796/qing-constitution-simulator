# 🏛️ 清末立宪历史模拟器

## 📖 项目简介

这是一个基于多Agent框架的历史反事实模拟器，探索一个关键问题：

**如果清政府在辛亥革命中幸存，是因为袁世凯和立宪派达成了"保皇换立宪"的密室协议——清廷交出全部军政实权，皇帝退居虚位，实权内阁由袁世凯组阁，张謇掌控财政，汤化龙主持地方自治立法——这个被法律关进笼子的君主立宪体制，后续会如何发展？**

本项目使用DeepSeek大语言模型驱动18位历史人物的AI Agent，让他们基于各自的价值观、利益诉求和历史资料，在结构化规则约束下进行多轮博弈，最终呈现10种可能的历史分支。

---

## ✨ 核心特性

### 🎭 多Agent历史人物模拟
- **18位历史人物**：袁世凯、张謇、汤化龙、孙中山、梁启超等
- **真实persona**：基于学术文献构建人物画像
- **独立决策**：每个Agent根据历史性格和当下信息自主决策
- **多方博弈**：立宪派、北洋军、革命派、满清贵族四方势力

### 📊 10种可能结局
- **A**: 稳定议会君主制 🏛️
- **B**: 袁世凯威权君主立宪 ⚔️
- **C**: 袁—议会宪政危机 ⚡
- **D**: 共和革命再次发动 🔥
- **E**: 事实联邦制演化 🗺️
- **F**: 北洋军分裂军阀化 💀
- **G**: 宫廷保皇派反扑 👑
- **H**: 清朝最终覆灭 ⬛
- **I**: 议会成功约束袁世凯 ⚖️
- **J**: 复合过渡路径 ❓

### 🎨 沉浸式可视化
- **历史命运树**：集成20轮模拟结果的概率分布图
- **人物关系网络**：动态展示政治联盟和对抗关系
- **事件时间线**：逐回合记录关键决策和历史转折点
- **国家指标演化**：合法性、军事风险、财政健康等8大维度

### 🔬 学术严谨性
- **史料引证**：每个人物决策附带学术文献支持
- **规则裁判**：宪政、军事、财政、外交四大裁判系统
- **不确定性建模**：军队忠诚、谈判成败、暗杀风险等随机事件
- **反事实验证**：压力测试（如"袁世凯突然去世"）

---

## 🚀 快速开始

### 在线访问（推荐）

如果已部署到Vercel，直接访问：
```
https://你的项目名.vercel.app
```

### 本地运行

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/qing-constitution-simulator.git
cd qing-constitution-simulator

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
# 访问 http://localhost:5173
```

### 使用方法

1. **输入API密钥**：首次访问时，输入DeepSeek API密钥（`sk-...`）
2. **配置模拟**：
   - 选择起始日期（默认：1911年12月15日）
   - 选择模拟轮数（1-10轮）
   - 选择活跃人物（至少3位）
3. **开始模拟**：点击"开始模拟"，等待30秒-2分钟
4. **查看结果**：
   - **历史命运树**：查看最终走向哪种结局
   - **人物关系**：查看政治阵营和权力结构
   - **时间线**：查看每回合的关键事件
   - **指标演化**：查看国家状态的动态变化

---

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 15 (App Router) + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS Variables
- **图表**: Recharts + D3.js (力导向图)
- **状态管理**: React Hooks + Context

### 后端/AI
- **LLM**: DeepSeek Chat (flash模型)
- **API**: DeepSeek官方API
- **模拟引擎**: Python 3.11 + 自研多Agent框架

### 部署
- **托管**: Vercel (免费版)
- **构建**: Vite
- **CI/CD**: GitHub Actions (自动部署)

---

## 📁 项目结构

```
web/
├── src/
│   ├── app/                    # Next.js页面
│   │   ├── page.tsx           # 主页面
│   │   └── globals.css        # 全局样式（帝国暗色主题）
│   ├── components/            # React组件
│   │   ├── destiny-tree.tsx   # 历史命运树
│   │   ├── network-graph.tsx  # 人物关系网络
│   │   ├── timeline.tsx       # 事件时间线
│   │   └── metrics-panel.tsx  # 国家指标面板
│   ├── lib/
│   │   ├── simulation/        # 模拟引擎
│   │   │   ├── runner.ts      # 主控制器
│   │   │   ├── agents.ts      # Agent决策逻辑
│   │   │   ├── referee.ts     # 裁判系统
│   │   │   └── scenario-classifier.ts  # 结局分类器
│   │   └── deepseek.ts        # DeepSeek API封装
│   └── config/
│       └── simulation-config.ts  # 模拟参数配置
├── public/
│   └── data/
│       ├── personas/          # 人物画像JSON
│       └── dashboard.json     # 预生成的演示数据
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🎯 核心算法

### 1. 多Agent决策流程

```
每回合循环：
  ├─ 状态简报：根据信息权限分发隔离后的国家状态
  ├─ 独立决策：所有活跃人物同时决策（不知道他人选择）
  ├─ 谈判协商：指定参与者之间的密室谈判
  ├─ 公开行动：所有人物的公开动作送交裁判
  ├─ 裁判解析：
  │   ├─ 宪政裁判：检查议会程序合法性
  │   ├─ 军事裁判：计算兵变、政变、起义概率
  │   ├─ 财政裁判：计算税收、债务、地方上缴
  │   └─ 外交裁判：建模列强干预和借款条件
  ├─ 状态更新：只有通过裁判的结果写入国家状态
  └─ 历史学家点评：区分意图、制度约束、随机不确定性
```

### 2. 结局分类器

基于8大指标的多维阈值决策树：
- **合法性**（legitimacy）：君主象征 vs 实权首相的威望平衡
- **军事风险**（coercive_risk）：北洋军忠诚度和兵变概率
- **财政健康**（fiscal_debt）：债务/GDP比率
- **革命压力**（revolutionary_pressure）：民间起义和地方独立倾向
- **宪政巩固度**（constitutional_consolidation）：议会实权和司法独立
- **外交主权**（foreign_sovereignty）：列强干预程度
- **地方离心力**（provincial_autonomy）：督军独立性
- **社会稳定**（social_stability）：罢工、学潮、税收抵抗

### 3. 不确定性建模

6类随机事件，每类设定概率分布：
- **军队忠诚**（military_loyalty）：基础忠诚度 × (1 + 高斯噪声)
- **谈判成败**（negotiation）：伯努利分布，成功率取决于双方关系
- **地方叛乱**（provincial_rebellion）：泊松过程，强度随离心力增加
- **暗杀**（assassination）：低概率尾部风险
- **外交反应**（foreign_response）：多项式分布（支持/中立/干预）
- **政权崩溃**（regime_collapse）：多指标加权的逻辑回归

---

## 📚 学术依据

本项目人物画像和决策逻辑基于以下学术文献：

### 核心文献
- **袁世凯**: 史扶邻《袁世凯全传》、孙曜《北洋军阀史话》
- **张謇**: 章开沅《张謇传》、王敦琴《张謇与中国早期现代化》
- **梁启超**: 梁启超《立宪与专制之得失》、夏晓虹《梁启超传》
- **立宪派**: 张玉法《中国现代政治史论》、李细珠《清末立宪运动研究》

### 理论框架
- **反事实历史**: Niall Ferguson, *Virtual History* (1997)
- **多Agent建模**: Epstein & Axtell, *Growing Artificial Societies* (1996)
- **宪政转型**: Daron Acemoglu & James Robinson, *Economic Origins of Dictatorship and Democracy* (2006)
- **军队政治**: Samuel Huntington, *The Soldier and the State* (1957)

所有引用文献详见项目根目录 `/research/sources/`。

---

## 🔬 验证与测试

### 单次运行测试
```bash
python -m qing_sim run --mode quick --turns 5
```

### 集成测试（20轮）
```bash
python -m qing_sim ensemble --runs 20 --mode standard
```

### 压力测试（袁世凯去世）
```bash
python -m qing_sim stress --scenario yuan_death --date 1913-06-15
```

### 前端单元测试
```bash
npm test
```

---

## 📊 演示数据

项目包含预生成的集成模拟结果（20次运行）：
- 文件：`public/data/dashboard.json`
- 包含：完整的10回合模拟，覆盖所有10种结局
- 用途：无需调用API即可演示功能

---

## 💰 成本估算

### DeepSeek API费用
- **模型**: deepseek-chat (flash)
- **定价**: ¥1/百万tokens
- **单次模拟**（5轮，3人物）：~30K tokens = ¥0.03
- **单次模拟**（10轮，8人物）：~80K tokens = ¥0.08

### Vercel托管费用
- **免费版**：100 GB带宽/月，足够个人使用
- **Pro版**（$20/月）：1 TB带宽，适合公开分享

**预计总成本**：轻度使用 < ¥50/月

---

## 🛡️ 局限性声明

本项目是学术探索工具，存在以下局限：

1. **不是预测**：这是反事实思想实验，不代表"如果X则必然Y"
2. **简化建模**：真实历史远比Agent博弈复杂，未建模：
   - 国际关系（日本、英国、俄国的具体博弈）
   - 经济周期（粮食价格、货币政策）
   - 思想传播（新文化运动、五四运动）
   - 偶然事件（自然灾害、领导人健康）
3. **文献局限**：人物画像基于有限的二手文献，可能存在偏见
4. **LLM限制**：DeepSeek的历史知识截止于训练时间，可能不全面

详见 `/docs/LIMITATIONS.md`。

---

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 添加新人物
1. 在 `public/data/personas/` 添加JSON文件
2. 包含：姓名、阵营、价值观、历史背景、决策倾向
3. 附上学术文献引用

### 修改结局规则
1. 编辑 `src/lib/simulation/scenario-classifier.ts`
2. 调整阈值或添加新的结局分支
3. 运行测试确保逻辑一致

### 优化UI
1. 修改 `src/app/globals.css` 调整主题
2. 修改 `src/components/` 下的组件
3. 确保暗色主题和响应式布局正常

---

## 📄 许可证

MIT License

本项目仅供学术研究和教育用途，不代表任何政治立场。

---

## 📞 联系方式

- **作者**: [你的名字]
- **邮箱**: [你的邮箱]
- **GitHub**: [你的GitHub]
- **项目主页**: [Vercel URL]

---

## 🌟 致谢

感谢以下开源项目：
- [DeepSeek](https://www.deepseek.com/) - 提供高质量中文LLM
- [Next.js](https://nextjs.org/) - 现代化React框架
- [Recharts](https://recharts.org/) - 数据可视化库
- [Vercel](https://vercel.com/) - 无缝部署平台

感谢所有历史学家的研究成果，让这个项目成为可能。

---

## 🎓 引用本项目

如果你在学术论文中使用了本项目，请引用：

```bibtex
@software{qing_constitution_simulator,
  author = {[你的名字]},
  title = {清末立宪历史模拟器：多Agent反事实建模},
  year = {2026},
  url = {https://github.com/[你的用户名]/qing-constitution-simulator},
  note = {基于DeepSeek大语言模型的历史人物Agent交互模拟}
}
```

---

🎊 **立即开始探索：如果清朝在议会君主制框架下存续，中国历史将如何改写？**
