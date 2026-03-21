import os


def _parse_codes(raw: str) -> list[str]:
    items = [p.strip() for p in (raw or "").split(",")]
    return [x for x in items if x]


def get_invite_codes() -> list[str]:
    # Keep MVP simple: env var list, fallback to a local default code.
    raw = os.getenv("CARD_SPIRIT_INVITE_CODES", "SPIRIT10")
    codes = _parse_codes(raw)
    return codes or ["SPIRIT10"]


def validate_invite_code(code: str) -> bool:
    if not code or not code.strip():
        return False
    return code.strip() in set(get_invite_codes())
