# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Give Smart. Give Direct. (`givesmartgivedirect.co.za`) is a South African direct-giving platform that connects donors with verified recipients via physical QR cards. The pilot is a **single self-contained HTML page** — no build step, no backend, no package manager.

## Running the app

Open `Homepage.html` directly in a browser. There is no dev server or build process. All React/Babel is loaded via CDN from within the HTML file. Changes to `app.jsx`, `components.jsx`, `icons.jsx`, or `tweaks-panel.jsx` are picked up on reload.

## Verifying the profile

```bash
bash .agent/tests/run-tests.sh
```

This checks that all required `.agent/skills/*/SKILL.md` files exist, have valid frontmatter, contain no legacy tool references, and that `AGENTS.md` maps each tool correctly.

## Architecture

All source files are loaded as `<script type="text/babel">` tags in `Homepage.html` in this order:

1. `icons.jsx` — SVG icon components
2. `tweaks-panel.jsx` — `TweaksPanel` + `useTweaks` hook for live design tweaks (dev only)
3. `components.jsx` — all page section components (`Hero`, `Story`, `HowItWorks`, `Impact`, `Gratitude`, `Recipients`, `LiveFeed`, `GiveModal`, `DonationWidget`, etc.)
4. `app.jsx` — root `App` component wiring sections together; `Nav` is also defined here

Global state flows from `App` via props. `useTweaks` drives live design variables (accent colour, navy, donation amount presets, hero layout variant) which are applied as CSS custom properties on `document.documentElement`.

### Key globals in `Homepage.html`

- `window.__TWEAK_DEFAULTS` — initial tweak values consumed by `useTweaks`
- `window.GATEWAY_CONFIG` — Ozow payment config (siteCode, privateKey, isTest flag, redirect URLs)

### Payment flow

`buildOzowUrl()` in `components.jsx` builds an Ozow redirect URL client-side using Web Crypto API (`crypto.subtle.digest("SHA-512")`) for the `HashCheck` parameter. **This is sandbox-only** — for production, move hash computation to a Netlify/Vercel serverless function so the private key is never exposed in client JS.

### Tweaks panel

A floating dev panel rendered by `TweaksPanel` (from `tweaks-panel.jsx`). Activated by the host environment via `window.postMessage({ type: "__activate_edit_mode" })`. Not visible in production builds.

## Brand tokens

| Token | Value |
|---|---|
| Navy | `#0A2240` |
| Green (accent) | `#6DBE3F` |
| Primary font | Plus Jakarta Sans (800/700/600/500) |
| Accent font | Caveat (gratitude wall quotes) |
| Mono font | JetBrains Mono (labels, tags) |

CSS custom properties `--accent` and `--navy-900` are overridden at runtime by the tweaks system.

## Agent workflow (`.agent/`)

This project uses the Antigravity Superpowers profile for AI-assisted development:

- Skills live in `.agent/skills/<name>/SKILL.md`
- Live task tracking goes in `docs/plans/task.md` (table-only, created at runtime)
- One active task at a time — no parallel coding subagents
- Before claiming completion: run verification, confirm exit status, update task table, report evidence
