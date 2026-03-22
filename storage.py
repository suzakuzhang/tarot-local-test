from __future__ import annotations

import json
import pathlib
import threading
import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional

BASE_DIR = pathlib.Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "access_data.json"

_LOCK = threading.Lock()


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _default_data() -> Dict:
    return {
        "invite_codes": [],
        "access_sessions": {},
        "style_profiles": {},
        "history_records": [],
    }


def _load() -> Dict:
    if not DATA_FILE.exists():
        return _default_data()
    try:
        raw = DATA_FILE.read_text(encoding="utf-8")
        data = json.loads(raw)
    except Exception:
        return _default_data()

    base = _default_data()
    if isinstance(data, dict):
        base.update({k: v for k, v in data.items() if k in base})
    return base


def _save(data: Dict) -> None:
    DATA_FILE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def list_invite_codes() -> List[Dict]:
    with _LOCK:
        data = _load()
        return list(data.get("invite_codes", []))


def peek_invite_code(code: str) -> Optional[Dict]:
    key = (code or "").strip().upper()
    if not key:
        return None
    with _LOCK:
        data = _load()
        for item in data.get("invite_codes", []):
            if item.get("code") == key:
                return dict(item)
    return None


def consume_invite_code(code: str) -> Optional[Dict]:
    key = (code or "").strip().upper()
    if not key:
        return None

    with _LOCK:
        data = _load()
        invite_codes = data.get("invite_codes", [])

        for idx, item in enumerate(invite_codes):
            if item.get("code") != key:
                continue

            if not bool(item.get("is_active", True)):
                return None

            used = int(item.get("used_count", 0))
            max_uses = int(item.get("max_uses", 10))
            if used >= max_uses:
                item["is_active"] = False
                invite_codes[idx] = item
                data["invite_codes"] = invite_codes
                _save(data)
                return None

            used += 1
            item["used_count"] = used
            if used >= max_uses:
                item["is_active"] = False
            invite_codes[idx] = item
            data["invite_codes"] = invite_codes
            _save(data)
            return dict(item)

    return None


def create_invite_code(code: str, created_by: str, max_uses: int = 10) -> Dict:
    key = (code or "").strip().upper()
    if not key:
        key = f"INV{uuid.uuid4().hex[:8].upper()}"

    with _LOCK:
        data = _load()
        invite_codes = data.get("invite_codes", [])
        for item in invite_codes:
            if item.get("code") == key:
                raise ValueError("邀请码已存在")

        row = {
            "code": key,
            "used_count": 0,
            "max_uses": max(1, int(max_uses)),
            "is_active": True,
            "created_by": (created_by or "system").strip() or "system",
            "created_at": _utcnow_iso(),
        }
        invite_codes.append(row)
        data["invite_codes"] = invite_codes
        _save(data)
        return dict(row)


def count_invite_codes_created_today(created_by: str) -> int:
    creator = (created_by or "").strip()
    if not creator:
        return 0

    today = datetime.now(timezone.utc).date()
    count = 0

    with _LOCK:
        data = _load()
        invite_codes = data.get("invite_codes", [])
        for item in invite_codes:
            if (item.get("created_by") or "").strip() != creator:
                continue
            try:
                created_at = datetime.fromisoformat((item.get("created_at") or "").strip())
            except Exception:
                continue
            if created_at.astimezone(timezone.utc).date() == today:
                count += 1

    return count


def set_invite_code_active(code: str, is_active: bool) -> Optional[Dict]:
    key = (code or "").strip().upper()
    if not key:
        return None

    with _LOCK:
        data = _load()
        invite_codes = data.get("invite_codes", [])
        for idx, item in enumerate(invite_codes):
            if item.get("code") != key:
                continue
            item["is_active"] = bool(is_active)
            invite_codes[idx] = item
            data["invite_codes"] = invite_codes
            _save(data)
            return dict(item)
    return None


def create_access_session(payload: Dict, ttl_hours: int = 24) -> Dict:
    token = uuid.uuid4().hex
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=max(1, int(ttl_hours)))).isoformat()

    row = {
        "token": token,
        "role": payload.get("role", "normal"),
        "access_type": payload.get("access_type", "normal"),
        "activated": bool(payload.get("activated", False)),
        "user_id": payload.get("user_id", ""),
        "user_name": payload.get("user_name", ""),
        "birth_year_month": payload.get("birth_year_month", ""),
        "created_at": _utcnow_iso(),
        "expires_at": expires_at,
    }

    with _LOCK:
        data = _load()
        sessions = data.get("access_sessions", {})
        sessions[token] = row
        data["access_sessions"] = sessions
        _save(data)

    return dict(row)


def get_access_session(token: str) -> Optional[Dict]:
    key = (token or "").strip()
    if not key:
        return None

    with _LOCK:
        data = _load()
        sessions = data.get("access_sessions", {})
        row = sessions.get(key)
        if not isinstance(row, dict):
            return None

        try:
            expires_at = datetime.fromisoformat(row.get("expires_at", ""))
            if datetime.now(timezone.utc) >= expires_at:
                sessions.pop(key, None)
                data["access_sessions"] = sessions
                _save(data)
                return None
        except Exception:
            sessions.pop(key, None)
            data["access_sessions"] = sessions
            _save(data)
            return None

        return dict(row)


def save_style_profile(user_id: str, role: str, preset: str) -> Dict:
    uid = (user_id or "").strip()
    if not uid:
        raise ValueError("缺少 user_id")

    with _LOCK:
        data = _load()
        profiles = data.get("style_profiles", {})
        row = {
            "user_id": uid,
            "role": role,
            "preset": preset,
            "updated_at": _utcnow_iso(),
        }
        profiles[uid] = row
        data["style_profiles"] = profiles
        _save(data)
        return dict(row)


def get_style_profile(user_id: str) -> Optional[Dict]:
    uid = (user_id or "").strip()
    if not uid:
        return None
    with _LOCK:
        data = _load()
        row = (data.get("style_profiles", {}) or {}).get(uid)
        return dict(row) if isinstance(row, dict) else None


def add_history_record(record: Dict) -> Dict:
    required = ["user_id", "role", "direction", "question", "reading_id"]
    for key in required:
        if not str(record.get(key, "")).strip():
            raise ValueError(f"缺少字段: {key}")

    row = {
        "user_id": str(record["user_id"]).strip(),
        "role": str(record["role"]).strip(),
        "direction": str(record["direction"]).strip(),
        "question": str(record["question"]).strip(),
        "reading_id": str(record["reading_id"]).strip(),
        "card_name": str(record.get("card_name", "")).strip(),
        "created_at": _utcnow_iso(),
        "is_locked": bool(record.get("is_locked", False)),
    }

    with _LOCK:
        data = _load()
        history = data.get("history_records", [])
        history.append(row)

        unlocked_idx = [
            i for i, x in enumerate(history)
            if x.get("user_id") == row["user_id"]
            and x.get("direction") == row["direction"]
            and not bool(x.get("is_locked", False))
        ]

        if len(unlocked_idx) > 5:
            drop_count = len(unlocked_idx) - 5
            drop_set = set(unlocked_idx[:drop_count])
            history = [x for i, x in enumerate(history) if i not in drop_set]

        data["history_records"] = history
        _save(data)
        return dict(row)


def list_history_records(user_id: str, direction: str = "") -> List[Dict]:
    uid = (user_id or "").strip()
    if not uid:
        return []
    direct = (direction or "").strip()

    with _LOCK:
        data = _load()
        rows = [x for x in data.get("history_records", []) if x.get("user_id") == uid]
        if direct:
            rows = [x for x in rows if x.get("direction") == direct]
        rows.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return rows


def set_history_lock(user_id: str, reading_id: str, is_locked: bool) -> Optional[Dict]:
    uid = (user_id or "").strip()
    rid = (reading_id or "").strip()
    if not uid or not rid:
        return None

    with _LOCK:
        data = _load()
        history = data.get("history_records", [])
        updated = None
        for idx, row in enumerate(history):
            if row.get("user_id") == uid and row.get("reading_id") == rid:
                row["is_locked"] = bool(is_locked)
                history[idx] = row
                updated = dict(row)
                break

        if not updated:
            return None

        data["history_records"] = history
        _save(data)
        return updated
