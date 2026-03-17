from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import pathlib
import requests

BASE_DIR = pathlib.Path(__file__).resolve().parent

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
CORS(app)

CARDS_DATA_PATH = BASE_DIR / "cards_data.json"
with open(CARDS_DATA_PATH, "r", encoding="utf-8") as f:
    CARDS_DATA = json.load(f)

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "").strip()
DEEPSEEK_BASE_URL = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat"

def find_card_data(card_name):
    for card in CARDS_DATA:
        if card["name_zh"] == card_name:
            return card
    return None

def get_style_hint(question_style):
    style_hint_map = {
        "intuitive": "请先从牌面第一感觉、画面气氛和直觉感受切入，不急着下结论，先说这张牌给人的心理与能量印象。",
        "story": "请把这张牌读成一个小故事：先说当前处境，再说它可能提示的转折和下一步，让解读有过程感。",
        "analytical": "请更聚焦地指出问题核心、当前症结和最值得调整的一点，语言可以更清晰直接，但不要生硬。",
        "general": "请用平衡自然的方式解读，兼顾牌面象征、现实处境与下一步建议。"
    }
    return style_hint_map.get(question_style, style_hint_map["general"])

def get_type_hint(question_type):
    type_hint_map = {
        "感情": "重点解释关系互动、情感期待、边界、靠近与疏离，不要只谈抽象成长。",
        "工作": "重点解释行动节奏、资源分配、现实压力、推进方式、职场判断与执行感。",
        "情绪": "重点解释内在状态、压抑、不安、恢复、真实感受与心理负担。",
        "自我成长": "重点解释阶段变化、内在动力、盲点、学习、突破与个人成长方向。"
    }
    return type_hint_map.get(question_type, "请结合用户的问题主题自然解读。")

@app.route("/")
def index():
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/healthz")
def healthz():
    return "ok", 200

@app.route("/<path:path>")
def static_proxy(path):
    target = BASE_DIR / path
    if target.exists():
        return send_from_directory(BASE_DIR, path)
    return send_from_directory(BASE_DIR, "index.html")

@app.route("/api/reading", methods=["POST"])
def reading():
    if not DEEPSEEK_API_KEY:
        return jsonify({"error": "未检测到 DEEPSEEK_API_KEY 环境变量"}), 500

    data = request.get_json(force=True)

    card_name = data.get("card_name", "")
    orientation = data.get("orientation", "")
    question_type = data.get("question_type", "")
    question_text = data.get("question_text", "")
    question_style = data.get("question_style", "general")

    orientation_label = "正位" if orientation == "upright" else "逆位"

    card_data = find_card_data(card_name)
    if not card_data:
        return jsonify({"error": f"未找到牌义数据：{card_name}"}), 500

    style_hint = get_style_hint(question_style)
    type_hint = get_type_hint(question_type)

    system_prompt = f"""
你是一个“塔罗解读助手”，风格应接近真实塔罗阅读体验。

你的任务是：
1. 先从牌面象征、画面感和正逆位的气质切入。
2. 再解释这张牌在当前问题里的状态与讯息。
3. 最后给出温和但具体的建议。

当前问题主题要求：
{type_hint}

当前提问风格要求：
{style_hint}

必须遵守：
1. 不做绝对预测，不宣称未来必然发生。
2. 不使用宿命论、恐吓、脏话、色情、暴力表达。
3. 不提供医疗、法律、投资结论。
4. 不要只是重复关键词。
5. 语言要自然、具体，有一点画面感，但不过度神秘。
6. 不要写成空泛心理鸡汤。
7. 输出必须是合法 JSON，不要输出 JSON 以外的任何内容。

JSON 结构固定为：
{{
  "core": "...",
  "context": "...",
  "advice": "..."
}}
"""

    user_prompt = f"""
请根据以下塔罗资料生成 JSON：

牌名：{card_data["name_zh"]}
英文名：{card_data["name_en"]}
方向：{orientation_label}
问题主题：{question_type}
用户问题：{question_text if question_text else "未填写"}
提问方式：{question_style}

牌面视觉描述：{card_data["visual_description"]}
基本意思：{card_data["summary_meaning"]}
正位含义：{card_data["upright_meaning"]}
逆位含义：{card_data["reversed_meaning"]}

额外要求：
1. 如果用户写了问题，必须明显结合这个问题来解读。
2. 感情主题要更贴近关系互动和情感张力。
3. 工作主题要更贴近现实推进、决策与压力。
4. 情绪主题要更贴近内在状态与感受。
5. 自我成长主题要更贴近阶段变化与个人突破。
6. intuitive 风格要更偏感受和画面。
7. story 风格要更偏发展、阶段、变化线索。
8. analytical 风格要更偏问题核心与调整重点。
9. 三段合起来控制在 180 到 320 字之间。
"""

    payload = {
        "model": DEEPSEEK_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.95,
        "max_tokens": 500
    }

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        resp = requests.post(
            f"{DEEPSEEK_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        resp.raise_for_status()
        result = resp.json()
        content = result["choices"][0]["message"]["content"]
        parsed = json.loads(content)

        return jsonify({
            "core": parsed.get("core", ""),
            "context": parsed.get("context", ""),
            "advice": parsed.get("advice", "")
        })

    except requests.HTTPError:
        return jsonify({
            "error": "DeepSeek API 请求失败",
            "detail": resp.text
        }), 500
    except Exception as e:
        return jsonify({
            "error": "解析模型返回失败",
            "detail": str(e)
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 10000)), debug=True)