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
- 动态 placeholder 与折叠式提问说明
- 洗牌 -> 三选一抽牌 -> 解读的单路径交互
- 等待层体验：
  - 三阶段状态文案切换
  - 呼吸式进度条
  - 与当前牌相关的碎片知识轮播
- 单会话抽牌上限（当前为 10 次）
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
- Data: JSON（结构化牌义）
- LLM API: DeepSeek
- Deployment: Render

## 项目结构

```text
tarot-local-test/
├── app.py                # Flask 后端与 API
├── index.html            # 页面结构
├── style.css             # 页面样式
├── script.js             # 前端交互、抽牌逻辑、等待层、API 请求
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
```

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