# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next session: pick up here

**Phase 1 (PayFast migration) is implemented and sandbox-verified, on branch `payfast-phase1`, NOT merged to `main`.** The branch is held off `main` until the partner NPO sends live PayFast credentials.

What's done (commits `35c9fb2` → `0a6ded7` on `payfast-phase1`):

- Ozow code removed. `GiveModal.handlePay` in `components.jsx` now POSTs to a Netlify Function at `window.PAYFAST_CONFIG.signEndpoint`, receives signed PayFast fields, and auto-submits a hidden form to PayFast's hosted checkout.
- New repo `~/Documents/My_apps/give-smart-functions/` holds two Netlify Functions (`sign-payfast`, `payfast-itn`) deployed at `https://give-smart-functions.netlify.app`. 55/55 unit tests passing.
- End-to-end sandbox flow verified 2026-05-19 (R5 donation through full chain — see `docs/plans/2026-05-19-payfast-phase1-verification.md`).

What's left — **Task 10, live cutover** in `docs/plans/2026-05-19-payfast-phase1-plan.md`:

1. Wait for partner NPO to send live `merchant_id`, `merchant_key`, `passphrase` (PayFast account is mid-FICA verification).
2. Update Netlify env vars (`PAYFAST_*`, switch `*_URL` from sandbox to `www.payfast.co.za`), drop `http://localhost:3333` from `ALLOWED_ORIGINS`, redeploy.
3. Real R5 test → confirm funds in NPO PayFast wallet → NPO refunds the test donation.
4. Merge `payfast-phase1` → `main` (GitHub Pages auto-deploys), tag `payfast-phase1-live`.

Background reading if needed: `docs/plans/2026-05-19-payfast-research.md` (the 5-subagent research that informed the migration).

## Project overview

Give Smart. Give Direct. (`givesmartgivedirect.co.za`) is a South African direct-giving platform that connects donors with verified recipients via physical QR cards. The pilot is a **single self-contained HTML page** — no build step, no backend, no package manager.

## Running the app

**You must serve over HTTP — `file://` won't work.** Babel-standalone fetches the `.jsx` files via `fetch()`, which is blocked under `file://`. From the project root:

```bash
python3 -m http.server 3333
# then open http://localhost:3333/index.html
```

If port 3333 is busy: `lsof -ti :3333 | xargs kill -9` then restart.

All React/Babel is loaded via CDN from within the HTML file. Changes to `app.jsx`, `components.jsx`, `icons.jsx`, or `tweaks-panel.jsx` are picked up on hard-reload (Cmd+Shift+R) — no build step.

## Verifying the profile

```bash
bash .agent/tests/run-tests.sh
```

This checks that all required `.agent/skills/*/SKILL.md` files exist, have valid frontmatter, contain no legacy tool references, and that `AGENTS.md` maps each tool correctly.

## Architecture

`index.html` uses a **custom async JSX loader** (inline `<script>` near the end of `<body>`) that `fetch`es each `.jsx` file, transpiles via `Babel.transform`, then `eval`s with `//# sourceURL=` for real stack traces. This replaces the default `<script type="text/babel" src="...">` mechanism, which sanitises errors as cross-origin "Script error." and makes blank-page debugging impossible.

Files load in this order (matches the loader, not the script tag order):

1. `tweaks-panel.jsx` — `TweaksPanel` + `useTweaks` hook for live design tweaks (dev only); exports to `window`
2. `icons.jsx` — defines `Icon` map and `BrandLogo`; assigned to `window.Icon` / `window.BrandLogo`
3. `components.jsx` — all page section components; ends with `Object.assign(window, { ... })`
4. `app.jsx` — root `App` and `Nav`; ends with `ReactDOM.createRoot(...).render(<App />)`

Global state flows from `App` via props. `useTweaks` drives live design variables (accent colour, navy, donation amount presets, hero layout variant) which are applied as CSS custom properties on `document.documentElement`.

### Scope rules (Babel-standalone)

Top-level `function` declarations in a transpiled script become global automatically. Top-level `const`/`let` do not — they must be explicitly assigned to `window` to be visible from another file. That's why `icons.jsx` does `window.Icon = Icon` (it's a `const`) but `components.jsx`'s `Object.assign(window, { Hero, Story, ... })` is partly decorative for the functions but still useful documentation of what crosses the file boundary.

### Error overlay

`index.html` injects `<div id="__err">` and a `window.error` handler near the top of `<body>`. Any uncaught error or promise rejection shows as a red banner at the top of the page with the file, line, and stack. Keep this in until production deploy.

### Key globals in `index.html`

- `window.__TWEAK_DEFAULTS` — initial tweak values consumed by `useTweaks`
- `window.PAYFAST_CONFIG` — public PayFast client config; only field is `signEndpoint`, the Netlify Function URL that signs requests server-side

### Payment flow

`GiveModal.handlePay` in `components.jsx` POSTs `{ amount, name, email, newsletterOptIn }` to the Netlify Function at `window.PAYFAST_CONFIG.signEndpoint` (deployed at `https://give-smart-functions.netlify.app/.netlify/functions/sign-payfast`). The function returns `{ processUrl, fields }` where `fields` already includes a server-computed `signature`. The browser builds a hidden form and POSTs it to `processUrl` (PayFast hosted page). PayFast posts the result server-to-server to a second Netlify Function (`payfast-itn`), which verifies the signature, validates via PayFast's `/eng/query/validate` postback, and emits a `{"event":"donation",...}` JSON line to `netlify logs` (Google Sheets logging is deferred — Apps Script deployment kept returning "Sorry, unable to open the file" despite correct permissions; see `docs/plans/2026-05-19-payfast-phase1-plan.md`). The merchant passphrase never reaches the browser.

The functions live in a **separate repo** at `~/Documents/My_apps/give-smart-functions/` with its own `main` branch — that repo is auto-deployed to Netlify on push. The static site (this repo) only knows the public `signEndpoint` URL. Don't try to commingle them.

#### PayFast quirks discovered the hard way (keep these in mind)

1. **Sandbox merchant `10000100` has a passphrase**, despite docs saying empty. As of 2026-05-19 it's `jt7NOE43FZPn`. Set as the `PAYFAST_PASSPHRASE` env var. If sandbox signing starts failing in future, suspect PayFast rotated this.
2. **Outbound signing omits empty fields; inbound ITN signing INCLUDES them.** PayFast's own docs are inconsistent here. Our `lib/itn-verify.mjs:verifySignature` works on the **raw POST body bytes** directly (strip `&signature=...`, append `&passphrase=...`, MD5) — do NOT parse to fields and re-encode, or empty `custom_str2..5` / `name_last` will produce a signature mismatch. Regression test for a real captured ITN lives in `tests/itn-verify.test.mjs`.
3. **Field order is "as they appear in the form POST".** Outbound: we control order in `sign-payfast.mjs`'s `fields` object and the client form-builder iterates that same order. Inbound: handled automatically by the raw-body verifier.

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

## Verification before claiming "done"

Spec-text review alone is **not enough** for this codebase. A subagent comparing rendered JSX against a spec cannot see the difference between `"` (U+0022) and `"` / `"` (U+201C / U+201D) — they're visually identical in most fonts but Babel rejects the curly ones. This bit us once: Task 5 introduced curly quotes in `Story`'s JSX and the page rendered blank for the rest of the implementation pass.

Run these against every changed `.jsx` file before declaring a task complete:

```bash
# 1. Curly-quote / non-ASCII smart-punctuation check
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' app.jsx components.jsx icons.jsx tweaks-panel.jsx

# 2. Babel syntax-parse (requires @babel/core + @babel/preset-react locally)
node -e "require('@babel/core').parseSync(require('fs').readFileSync('components.jsx','utf8'), {presets:['@babel/preset-react']})"
```

Better still: keep the HTTP server running and hard-reload after every commit. Blank page = open DevTools first, not speculate.

## Agent workflow (`.agent/`)

This project uses the Antigravity Superpowers profile for AI-assisted development:

- Skills live in `.agent/skills/<name>/SKILL.md`
- Live task tracking goes in `docs/plans/task.md` (table-only, created at runtime)
- One active task at a time — no parallel coding subagents
- Before claiming completion: run verification, confirm exit status, update task table, report evidence
