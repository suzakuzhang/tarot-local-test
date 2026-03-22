from __future__ import annotations

from typing import Dict, List, Optional

from storage import (
    consume_invite_code as _consume_invite_code,
    create_invite_code as _create_invite_code,
    list_invite_codes as _list_invite_codes,
    peek_invite_code as _peek_invite_code,
    set_invite_code_active as _set_invite_code_active,
    set_invite_code_max_uses as _set_invite_code_max_uses,
)


def get_invite_codes() -> List[str]:
    rows = _list_invite_codes()
    return [x.get("code", "") for x in rows if x.get("code")]


def list_invite_code_entries() -> List[Dict]:
    return _list_invite_codes()


def validate_invite_code(code: str) -> bool:
    row = _peek_invite_code(code)
    if not row:
        return False
    if not bool(row.get("is_active", True)):
        return False
    return int(row.get("used_count", 0)) < int(row.get("max_uses", 10))


def consume_invite_code(code: str) -> Optional[Dict]:
    return _consume_invite_code(code)


def create_invite_code(code: str, created_by: str, max_uses: int = 10) -> Dict:
    return _create_invite_code(code=code, created_by=created_by, max_uses=max_uses)


def set_invite_code_active(code: str, is_active: bool) -> Optional[Dict]:
    return _set_invite_code_active(code=code, is_active=is_active)


def set_invite_code_max_uses(code: str, max_uses: int, reset_used_count: bool = False) -> Optional[Dict]:
    return _set_invite_code_max_uses(
        code=code,
        max_uses=max_uses,
        reset_used_count=reset_used_count,
    )
