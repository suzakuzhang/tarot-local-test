# Tarot Local Test

A web-based tarot-reading prototype built around the 22 Major Arcana of the Rider–Waite deck. It pairs fixed, tradition-grounded card meanings with LLM-generated, context-specific interpretation, inside a deliberately light and boundary-aware interface.

**Live demo:** https://tarot-local-test.onrender.com *(interface in Chinese)*

> *Read in another language: [中文 README](./README.zh.md)*

---

## What this is

This is a research prototype, not a fortune-telling product. It treats tarot not as a predictive device but as a **structured frame for reflection**, and uses it to study how an AI system reorganizes interpretive authority when it speaks through a symbolic system.

Each reading combines three layers:

- **Fixed card meaning** — a stable anchor grounded in traditional Rider–Waite symbolism.
- **Generative interpretation** — a personalized reading produced by an LLM from the user's specific question and context.
- **Lightweight interaction** — a low-friction interface that makes it easier to face a question honestly.

The goal is not to decide for the user, but to help them see more clearly: where they are actually stuck, which signals deserve attention, and what one small next step might be.

It is the first member of a small family of prototypes on AI-mediated interpretation, alongside [`zhouyi`](https://github.com/suzakuzhang/zhouyi) (the *Yijing* counterpart) and [`rupainting`](https://github.com/suzakuzhang/rupainting) / [`anagnosis`](https://github.com/suzakuzhang/anagnosis) (painting).

## Features

**Core draw flow**
1. Choose a question domain (relationships / work / emotion / self-growth).
2. Optionally add the one question most on your mind.
3. Shuffle, and pick one of three face-down cards by intuition.
4. See the card name, orientation (upright / reversed), and the session's keynote.
5. Receive a two-layer result: fixed card meaning + contextualized AI interpretation.

**Interpretation voices** — multiple authorial-tone presets, each with its own prompt engineering (gentle, sharp, poetic, analytic, and several narrative variants).

**Card-spirit mode** — a Gemini-based, time-limited (10-minute) follow-up dialogue scoped to the current reading, letting the user probe a single interpretation in depth.

**Waiting layer** — three-stage status copy, a breathing progress bar, and a rotating feed of tarot-theory fragments while the reading is generated.

**Access tiers** — guest (single draw), invite-code (full reading + spirit mode), pilot/whitelist (style presets, history, invite creation), and admin (management panel).

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-CORS |
| Frontend | Vanilla HTML / CSS / JavaScript |
| Data | JSON (card meanings, access sessions, invite codes, history) |
| AI — single-draw reading | DeepSeek API |
| AI — card-spirit dialogue | Google Gemini API |
| Deployment | Render (auto-deploy on push to `main`) |

## Project structure

```
tarot_local_test/
├── app.py                   # Flask backend, API routes, prompt construction
├── index.html / style.css / script.js   # frontend
├── cards_data.json          # structured meanings for the 22 Major Arcana
├── cards_manifest.json      # card-image metadata and source links
├── access_control.py        # role definitions and capability mapping
├── storage.py               # local JSON storage (sessions, codes, styles, history)
├── pilot_whitelist.py       # whitelist / admin authentication (env-driven)
├── invite_codes.py          # invite-code read/write and consumption
├── card_spirit_prompt.py    # card-spirit system prompt and user-prompt builder
├── card_spirit_session.py   # card-spirit session management
├── gemini_client.py         # Gemini API client wrapper
├── requirements.txt / Procfile / render.yaml
└── assets/                  # static assets (card images, etc.)
```

## Local development

Requires Python 3.10+.

```bash
pip install -r requirements.txt

# API keys
export DEEPSEEK_API_KEY=your_key_here   # single-draw reading
export GEMINI_API_KEY=your_key_here     # card-spirit mode

# Optional: admin / whitelist (all read from the environment, never committed)
export PILOT_ADMIN_CODE=your_admin_code
export PILOT_ADMIN_BIRTH_DATE=YYYY-MM-DD
export PILOT_WHITELIST_JSON='[{"name_pinyin":"zhangsan","birth_year_month":"1990-05","is_active":true}]'

python app.py
```

Production start: `gunicorn app:app --bind 0.0.0.0:10000 --workers 1 --threads 2 --timeout 120`

`access_data.json` is a runtime-local data file, listed in `.gitignore` and never committed.

## Scope and limits

This project is intended for reflection and expression. It does not constitute medical, legal, financial, or other professional advice, and its output should not be the sole basis for any high-stakes real-world decision.

## Author

Created by Shumin Zhang, as part of a research program on how AI systems mediate symbolic interpretation. For citation or reuse, please credit the original repository and author.
