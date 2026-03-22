from __future__ import annotations

import ast
import json
import os
import re
from typing import Dict, List

_DEFAULT_WHITELIST_JSON = "[]"
_NAME_PATTERN = re.compile(r"^[a-z]+$")
_BIRTH_YM_PATTERN = re.compile(r"^\d{4}-(0[1-9]|1[0-2])$")


def normalize_name_pinyin(name: str) -> str:
    if not name:
        return ""
    return "".join((name or "").strip().lower().split())


def is_valid_birth_year_month(text: str) -> bool:
    return bool(_BIRTH_YM_PATTERN.match((text or "").strip()))


def _parse_whitelist_payload(raw: str):
    text = (raw or "").strip()
    if not text:
        return []

    # 1) Preferred path: strict JSON list.
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return parsed
        # Some platforms accidentally store a JSON string of a JSON list.
        if isinstance(parsed, str):
            nested = json.loads(parsed)
            if isinstance(nested, list):
                return nested
    except Exception:
        pass

    # 2) Fallback for single-quoted payloads pasted in env vars.
    try:
        parsed = ast.literal_eval(text)
        if isinstance(parsed, list):
            return parsed
    except Exception:
        pass

    return []


def _load_whitelist() -> List[Dict]:
    raw = os.getenv("PILOT_WHITELIST_JSON", _DEFAULT_WHITELIST_JSON)
    data = _parse_whitelist_payload(raw)

    rows = []
    for item in data:
        if not isinstance(item, dict):
            continue
        name = normalize_name_pinyin(str(item.get("name_pinyin", "")))
        birth = str(item.get("birth_year_month", "")).strip()
        active = bool(item.get("is_active", True))
        if not name or not _NAME_PATTERN.match(name):
            continue
        if not is_valid_birth_year_month(birth):
            continue
        rows.append({
            "name_pinyin": name,
            "birth_year_month": birth,
            "is_active": active,
        })
    return rows


def list_whitelist() -> List[Dict]:
    return _load_whitelist()


def validate_pilot_user(name_pinyin: str, birth_year_month: str) -> bool:
    name = normalize_name_pinyin(name_pinyin)
    birth = (birth_year_month or "").strip()
    if not name or not _NAME_PATTERN.match(name):
        return False
    if not is_valid_birth_year_month(birth):
        return False

    for item in _load_whitelist():
        if not item.get("is_active", True):
            continue
        if item["name_pinyin"] == name and item["birth_year_month"] == birth:
            return True
    return False


def validate_admin_user(admin_code: str, birth_date: str) -> bool:
    expected_code = (os.getenv("PILOT_ADMIN_CODE") or "").strip()
    expected_birth = (os.getenv("PILOT_ADMIN_BIRTH_DATE") or "").strip()
    if not expected_code or not expected_birth:
        return False
    return admin_code.strip() == expected_code and birth_date.strip() == expected_birth
