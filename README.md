# 韦特大阿卡纳塔罗（测试版）

借助塔罗的象征图像，陪你把心里那点说不清的东西理一理。

这是一个在线 Web 原型：
以 22 张韦特大阿卡纳为基础，将固定牌意与生成式解读结合，探索一种更轻、更干净、也更有边界感的塔罗交互体验。

## 在线体验

Live Demo: https://tarot-local-test.onrender.com

## 项目定位

这个项目不把塔罗当成绝对预测工具，而是把它当成一种结构化反思方式：

- 用固定牌意提供稳定锚点
- 用生成式解读贴近当前问题语境
- 用轻量交互降低进入门槛

目标不是替用户做决定，而是帮助用户更清楚地看到：

- 我真正卡在哪里
- 这件事里最值得留意的线索是什么
- 下一步最值得尝试的一小步是什么

## 当前版本功能

- 22 张韦特大阿卡纳随机抽牌
- 正位 / 逆位机制
- 固定牌意展示（视觉、基础含义、正逆位含义）
- 基于问题类型与补充问题的生成式解读
- 多风格解读预设（旧版作者风格 / 柔和版 / 锐利版 / 诗性版）
- 动态 placeholder 与折叠式提问说明
- 洗牌 -> 三选一抽牌 -> 解读的单路径交互
- 等待层体验：
  - 三阶段状态文案切换
  - 呼吸式进度条
  - 与当前牌相关的碎片知识轮播
- 访问分层能力：普通体验 / 邀请码体验 / 先行者 / 管理员
- 普通模式单会话 1 次抽牌；激活后可完整体验
- 牌灵模式（围绕当前 reading 的 10 分钟延伸追问）
- 历史记录（最近问题 + 上锁归档）
- 邀请码管理（创建、停用、次数限制）
- 白名单认证与管理员入口
- Render 在线部署

## 交互流程

1. 选择问题类型（感情 / 工作 / 情绪 / 自我成长）
2. 可补充一句当前最想问的问题
3. 点击开始洗牌
4. 从三张牌背中选择一张
5. 展示牌名、方向、主调与固定牌意
6. 后端结合卡牌信息与问题语境生成解读
7. 输出最终结果（固定牌意 + 语境化解读）

## 技术栈

- Backend: Python + Flask
- Frontend: HTML + CSS + JavaScript
- Data: JSON（结构化牌义 + 访问会话与邀请码存储）
- LLM API: DeepSeek（单抽解读）+ Gemini（牌灵对话）
- Deployment: Render

## 项目结构

```text
tarot-local-test/
├── access_control.py     # 访问角色与能力定义
├── storage.py            # 本地 JSON 存储层（邀请码/会话/风格/历史）
├── pilot_whitelist.py    # 白名单与管理员认证
├── invite_codes.py       # 邀请码读写与消费逻辑
├── access_data.json      # 访问相关数据文件
├── card_spirit_prompt.py # 牌灵系统提示词与用户提示构建
├── card_spirit_session.py# 牌灵会话管理
├── gemini_client.py      # Gemini 客户端封装
├── app.py                # Flask 后端与 API
├── index.html            # 页面结构
├── style.css             # 页面样式
├── script.js             # 前端交互、访问状态、抽牌逻辑、API 请求
├── cards_data.json       # 22 张大阿卡纳结构化牌义
├── requirements.txt      # Python 依赖
└── assets/               # 静态资源（牌面图片等）
```

## 本地运行

环境要求：

- Python 3.10+

1) 安装依赖

```bash
pip install -r requirements.txt
```

2) 配置环境变量

```bash
export DEEPSEEK_API_KEY=your_api_key_here
export GEMINI_API_KEY=your_api_key_here

# 可选：管理员与白名单能力（先行版）
export PILOT_ADMIN_CODE=your_admin_code
export PILOT_ADMIN_BIRTH_DATE=YYYY-MM-DD
export PILOT_WHITELIST_JSON='[{"name_pinyin":"zhangsan","birth_year_month":"1990-05","is_active":true}]'
```

说明：

- 如果你本地没有配置 DeepSeek 或 Gemini，但 Render 上已配置，对线上部署不影响。
- 本地仅在调用对应功能时才需要对应 API Key：
  - 单抽解读依赖 DEEPSEEK_API_KEY
  - 牌灵模式依赖 GEMINI_API_KEY

3) 启动服务（开发）

```bash
python app.py
```

或使用 gunicorn：

```bash
gunicorn app:app --bind 0.0.0.0:10000
```

## 部署说明

当前默认部署在 Render。
如果 Render 已配置自动部署 main 分支，推送后会自动触发新版本发布。

建议在 Render 的 Environment 中配置以下变量：

- DEEPSEEK_API_KEY
- GEMINI_API_KEY
- PILOT_ADMIN_CODE（可选）
- PILOT_ADMIN_BIRTH_DATE（可选）
- PILOT_WHITELIST_JSON（可选）

## 使用边界与免责声明

本项目用于反思与表达辅助，不构成医疗、法律、投资等专业建议。
请勿将结果作为高风险现实决策的唯一依据。

## 正在打磨

- 作者风格稳定性（更短、更准、少模板感）
- 结果区信息层次与可读性
- 等待层文案与碎片知识质量
- 更多真实使用反馈后的交互优化

## 后续方向

- 扩展到完整 78 张体系
- 引入更明确的牌阵结构
- 持续探索固定牌意与生成式解读的平衡

## English Summary

This project is a lightweight tarot web prototype based on the 22 Major Arcana cards.
It combines:

- structured card meanings (for consistency)
- LLM-generated interpretation (for context relevance)
- minimal interaction design (for lower cognitive load)

The goal is not deterministic prediction, but reflective guidance.

## Author

Created by Shumin Zhang.

Shared for portfolio, research, and learning purposes.
If you reuse or build on this project, please provide clear attribution to the original repository and author.