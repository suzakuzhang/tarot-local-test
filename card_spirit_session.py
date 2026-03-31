from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
import uuid
from typing import Optional


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).isoformat()


@dataclass
class Message:
    session_id: str
    role: str
    content: str
    created_at: str
    round_index: int


@dataclass
class CardSpiritSession:
    session_id: str
    reading_id: str
    card_name: str
    orientation: str
    question: str
    direction: str
    started_at: str
    expires_at: str
    remaining_rounds: int
    status: str
    summary_state: str = ""
    messages: list[Message] = field(default_factory=list)


class CardSpiritSessionManager:
    def __init__(self, ttl_seconds: int = 600, max_rounds: int = 8):
        self.ttl_seconds = ttl_seconds
        self.max_rounds = max_rounds
        self.readings: dict[str, dict] = {}
        self.sessions: dict[str, CardSpiritSession] = {}

    def create_reading(self, card_name: str, orientation: str, question: str, direction: str = "") -> str:
        reading_id = str(uuid.uuid4())
        self.readings[reading_id] = {
            "reading_id": reading_id,
            "card_name": card_name,
            "orientation": orientation,
            "question": question,
            "direction": direction,
            "created_at": _iso(_utcnow()),
        }
        return reading_id

    def get_reading(self, reading_id: str) -> Optional[dict]:
        return self.readings.get(reading_id)

    def create_session(self, reading_id: str) -> CardSpiritSession:
        reading = self.get_reading(reading_id)
        if not reading:
            raise ValueError("reading_not_found")

        now = _utcnow()
        expires_at = now + timedelta(seconds=self.ttl_seconds)
        session_id = str(uuid.uuid4())
        session = CardSpiritSession(
            session_id=session_id,
            reading_id=reading_id,
            card_name=reading.get("card_name", ""),
            orientation=reading.get("orientation", ""),
            question=reading.get("question", ""),
            direction=reading.get("direction", ""),
            started_at=_iso(now),
            expires_at=_iso(expires_at),
            remaining_rounds=self.max_rounds,
            status="active",
            summary_state="",
            messages=[],
        )
        self.sessions[session_id] = session
        return session

    def end_session(self, session_id: str, reason: str = "ended") -> Optional[CardSpiritSession]:
        session = self.sessions.get(session_id)
        if not session:
            return None
        if reason == "expired":
            session.status = "expired"
        else:
            session.status = "ended"
        return session

    def get_session(self, session_id: str) -> Optional[CardSpiritSession]:
        session = self.sessions.get(session_id)
        if not session:
            return None
        self._auto_expire(session)
        return session

    def _auto_expire(self, session: CardSpiritSession) -> None:
        if session.status != "active":
            return
        if _utcnow() >= datetime.fromisoformat(session.expires_at):
            session.status = "expired"

    def append_message(self, session_id: str, role: str, content: str, round_index: int) -> Message:
        session = self.get_session(session_id)
        if not session:
            raise ValueError("session_not_found")
        msg = Message(
            session_id=session_id,
            role=role,
            content=content,
            created_at=_iso(_utcnow()),
            round_index=round_index,
        )
        session.messages.append(msg)
        return msg

    def get_recent_messages(self, session_id: str, max_items: int = 8) -> list[Message]:
        session = self.get_session(session_id)
        if not session:
            return []
        return session.messages[-max_items:]

    def can_chat(self, session: CardSpiritSession) -> tuple[bool, str]:
        self._auto_expire(session)
        if session.status != "active":
            return False, "session_not_active"
        if session.remaining_rounds <= 0:
            session.status = "ended"
            return False, "rounds_exhausted"
        return True, "ok"

    def consume_round(self, session: CardSpiritSession) -> int:
        if session.remaining_rounds > 0:
            session.remaining_rounds -= 1
        if session.remaining_rounds <= 0:
            session.status = "ended"
        return self.max_rounds - session.remaining_rounds

    def serialize_session(self, session: CardSpiritSession) -> dict:
        return {
            "session_id": session.session_id,
            "reading_id": session.reading_id,
            "card_name": session.card_name,
            "orientation": session.orientation,
            "question": session.question,
            "direction": session.direction,
            "started_at": session.started_at,
            "expires_at": session.expires_at,
            "remaining_rounds": session.remaining_rounds,
            "status": session.status,
            "summary_state": session.summary_state,
        }

    def serialize_full_session(self, session: CardSpiritSession) -> dict:
        return {
            **self.serialize_session(session),
            "messages": [
                {
                    "session_id": m.session_id,
                    "role": m.role,
                    "content": m.content,
                    "created_at": m.created_at,
                    "round_index": m.round_index,
                }
                for m in session.messages
            ],
            "message_count": len(session.messages),
        }

    def export_session(self, session_id: str) -> Optional[dict]:
        session = self.get_session(session_id)
        if not session:
            return None
        return self.serialize_full_session(session)


card_spirit_sessions = CardSpiritSessionManager(ttl_seconds=600, max_rounds=8)
