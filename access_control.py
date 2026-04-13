from __future__ import annotations

ROLE_NORMAL = "normal"
ROLE_INVITE = "invite"
ROLE_PILOT = "pilot"
ROLE_ADMIN = "admin"

ACCESS_NORMAL = "normal"
ACCESS_INVITE_CODE = "invite_code"
ACCESS_WHITELIST = "whitelist"
ACCESS_ADMIN_CODE = "admin_code"

SPIRIT_ALLOWED_ROLES = {ROLE_NORMAL, ROLE_INVITE, ROLE_PILOT, ROLE_ADMIN}
STYLE_ALLOWED_ROLES = {ROLE_PILOT, ROLE_ADMIN}
HISTORY_ALLOWED_ROLES = {ROLE_PILOT, ROLE_ADMIN}
ADMIN_ONLY_ROLES = {ROLE_ADMIN}
INVITE_CODE_CREATE_ALLOWED_ROLES = {ROLE_PILOT, ROLE_ADMIN}


def get_capabilities(role: str) -> dict:
    role = (role or ROLE_NORMAL).strip()
    can_spirit = role in SPIRIT_ALLOWED_ROLES
    can_style = role in STYLE_ALLOWED_ROLES
    can_history = role in HISTORY_ALLOWED_ROLES
    can_create_invite_codes = role in INVITE_CODE_CREATE_ALLOWED_ROLES
    return {
        "can_draw": True,
        "can_spirit": can_spirit,
        "can_history": can_history,
        "can_style_profile": can_style,
        "can_lock_history": can_history,
        "can_create_invite_codes": can_create_invite_codes,
        "is_admin": role == ROLE_ADMIN,
    }
