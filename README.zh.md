# 韦特大阿卡纳塔罗（测试版）

基于韦特体系 22 张大阿卡纳的在线塔罗原型，将固定牌意与 AI 生成式解读结合，探索一种更轻、更干净、更有边界感的塔罗交互体验。

**在线体验**：https://tarot-local-test.onrender.com

---

## 这是什么

这个项目不把塔罗当预测工具，而是当作结构化反思的框架。每次解读融合三层：

- **固定牌意** — 基于传统韦特象征的稳定锚点
- **生成式解读** — 由大语言模型根据用户具体问题和语境生成的个性化解读
- **轻量交互** — 尽可能低门槛的界面，让人更容易诚实地面对自己的问题

目标不是替用户做决定，而是帮助用户更清楚地看到：真正卡在哪里、最值得留意的线索是什么、下一步最值得尝试的一小步是什么。

## 功能

### 核心抽牌流程
1. 选择问题类型（感情 / 工作 / 情绪 / 自我成长）
2. 可补充一句当前最想问的问题
3. 点击洗牌，从三张牌背中凭直觉选一张
4. 展示牌名、方向（正位/逆位）与本次主调
5. 输出双层结果：固定牌意 + 语境化 AI 解读

### 解读风格
多种作者性语感预设，各有独立的提示词工程：
- 旧版作者风格、柔和版、锐利版、诗性版
- 自然流、感受流、剧情流、拆解流、点破流、天烽流、个人流（含克制/锋利变体）

### 牌灵模式
基于 Gemini 的延伸对话，围绕当前这次 reading 展开，限时 10 分钟。允许用户通过追问深入探索一次解读。

### 等待层体验
- 三阶段状态文案切换
- 呼吸式进度条
- 与当前牌和塔罗理论相关的碎片知识轮播

### 访问分层

| 角色 | 能力 |
|------|------|
| 普通用户 | 单会话 1 次抽牌 |
| 邀请码用户 | 完整解读 + 牌灵模式 |
| 先行者（白名单） | + 风格预设、历史记录、创建邀请码 |
| 管理员 | + 管理面板、白名单管理 |

### 历史与管理
- 最近问题列表，支持上锁归档
- 邀请码创建、停用、次数限制
- 白名单认证与管理员入口

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Python、Flask、Flask-CORS |
| 前端 | 原生 HTML、CSS、JavaScript |
| 数据 | JSON（牌义、访问会话、邀请码、历史记录） |
| AI — 单抽解读 | DeepSeek API |
| AI — 牌灵对话 | Google Gemini API |
| 部署 | Render（推送 main 自动部署） |

## 项目结构

```
tarot-local-test/
├── app.py                  # Flask 后端、API 路由、提示词构建
├── index.html              # 页面结构
├── style.css               # 页面样式
├── script.js               # 前端交互、访问状态、抽牌逻辑、API 请求
├── cards_data.json         # 22 张大阿卡纳结构化牌义
├── cards_manifest.json     # 牌面图片元数据与来源链接
├── access_control.py       # 角色定义与能力映射
├── storage.py              # 本地 JSON 存储层（会话、邀请码、风格、历史）
├── pilot_whitelist.py      # 白名单与管理员认证
├── invite_codes.py         # 邀请码读写与消费逻辑
├── card_spirit_prompt.py   # 牌灵系统提示词与用户提示构建
├── card_spirit_session.py  # 牌灵会话管理
├── gemini_client.py        # Gemini API 客户端封装
├── access_data.example.json# 访问数据模板（示例，非真实数据）
├── requirements.txt        # Python 依赖
├── Procfile                # Gunicorn 启动命令
├── render.yaml             # Render 部署配置
├── assets/                 # 静态资源（牌面图片等）
└── private_docs/           # 参考文本（用于等待层碎片知识提取）
```

## 本地开发

**环境要求**：Python 3.10+

```bash
# 安装依赖
pip install -r requirements.txt

# 配置 API Key
export DEEPSEEK_API_KEY=your_key_here    # 单抽解读需要
export GEMINI_API_KEY=your_key_here      # 牌灵模式需要

# 可选：管理员与白名单
export PILOT_ADMIN_CODE=your_admin_code
export PILOT_ADMIN_BIRTH_DATE=YYYY-MM-DD
export PILOT_WHITELIST_JSON='[{"name_pinyin":"zhangsan","birth_year_month":"1990-05","is_active":true}]'

# 启动
python app.py
```

生产模式启动：

```bash
gunicorn app:app --bind 0.0.0.0:10000 --workers 1 --threads 2 --timeout 120
```

## 部署

当前部署在 Render，推送 main 分支后自动触发新版本发布。在 Render 的 Environment 中配置以下变量：

- `DEEPSEEK_API_KEY`
- `GEMINI_API_KEY`
- `PILOT_ADMIN_CODE`（可选）
- `PILOT_ADMIN_BIRTH_DATE`（可选）
- `PILOT_WHITELIST_JSON`（可选）

`access_data.json` 为运行时本地数据文件，已加入 `.gitignore`，不会提交到仓库。

## 使用边界

本项目用于反思与表达辅助，不构成医疗、法律、投资等专业建议。请勿将结果作为高风险现实决策的唯一依据。

## English Summary

A web-based tarot reading prototype built around the 22 Major Arcana of the Rider-Waite deck. It combines structured card meanings with LLM-generated interpretations and minimal interaction design. The goal is not deterministic prediction, but reflective guidance — helping users see where they're stuck, what deserves attention, and what one small next step might look like.

## 作者

Created by Shumin Zhang.

本项目用于个人作品集、研究与学习目的。如需引用或二次开发，请注明原始仓库与作者。
