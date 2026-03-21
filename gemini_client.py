from __future__ import annotations

import os
from google import genai

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")


class GeminiClientError(Exception):
    pass


def generate_spirit_reply(system_prompt: str, user_prompt: str) -> str:
    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key:
        raise GeminiClientError("未检测到 GEMINI_API_KEY 环境变量")

    try:
        client = genai.Client(api_key=api_key)
        merged_prompt = (
            "[系统设定]\n"
            f"{system_prompt}\n\n"
            "[用户输入]\n"
            f"{user_prompt}"
        )
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=merged_prompt,
        )
    except Exception as exc:
        raise GeminiClientError(f"Gemini API 请求失败: {exc}") from exc

    text = (getattr(response, "text", "") or "").strip()
    if not text:
        raise GeminiClientError("Gemini 返回为空")
    return text
