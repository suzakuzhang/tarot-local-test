from __future__ import annotations

import os
import requests


GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


class GeminiClientError(Exception):
    pass


def _extract_text(data: dict) -> str:
    candidates = data.get("candidates") or []
    if not candidates:
        return ""

    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    chunks = []
    for p in parts:
        text = p.get("text")
        if text:
            chunks.append(text)
    return "\n".join(chunks).strip()


def generate_spirit_reply(system_prompt: str, user_prompt: str) -> str:
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        raise GeminiClientError("未检测到 GEMINI_API_KEY 环境变量")

    url = f"{GEMINI_BASE_URL}/models/{GEMINI_MODEL}:generateContent?key={api_key}"
    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": user_prompt}]}],
        "generationConfig": {
            "temperature": 0.75,
            "maxOutputTokens": 280,
        },
    }

    try:
        resp = requests.post(url, json=payload, timeout=45)
        resp.raise_for_status()
        data = resp.json()
    except requests.HTTPError as exc:
        detail = ""
        try:
            detail = resp.text
        except Exception:
            detail = str(exc)
        raise GeminiClientError(f"Gemini API 请求失败: {detail}") from exc
    except Exception as exc:
        raise GeminiClientError(f"Gemini API 调用异常: {exc}") from exc

    text = _extract_text(data)
    if not text:
        raise GeminiClientError("Gemini 返回为空")
    return text
