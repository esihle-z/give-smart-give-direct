# Homepage2 redesign — follow-ups

Surfaced by code-quality reviews during the 2026-05-13 Homepage2 redesign execution. None blocked the plan, but they should be addressed before any real-user testing.

Items already called out in the plan's "Out of scope" section (move `buildOzowUrl` server-side, real recipient/hero data, drop Babel-standalone for Vite, remove `#__err` overlay) are **not** repeated here — see `2026-05-13-homepage2-redesign-plan.md` §"Out of scope (follow-ups)".

---

## Priority 1 — fix before real-user testing

### 1. Restore custom async JSX loader in `Homepage.html`

**Where:** `Homepage.html` near the bottom (currently three `<script type="text/babel" src="..."></script>` tags pointing at icons.jsx / components.jsx / app.jsx).

**Why:** The old `Homepage.html` used a custom inline loader that `fetch()`ed each JSX file, transpiled via `Babel.transform`, then `eval`ed with `//# sourceURL=` so uncaught errors surfaced with real file/line in the `#__err` banner. The Homepage2 swap regressed this back to the default `<script type="text/babel" src>` mechanism — which sanitizes any error inside a JSX file to cross-origin `"Script error."` with no file or line. CLAUDE.md documents this exact failure mode as the reason the custom loader exists. With 10 components now in `components.jsx`, debugging the next blank page without it will be miserable.

**How:** Port the inline loader block from prior commit history (or rewrite from the description in CLAUDE.md §"Architecture"). Keep the `#__err` overlay and `window.error` handler as they are.

### 2. Reject `amount=0` (and empty effective amount) in `DonationCard`

**Where:** `components.jsx` ~line 248 (the `.give-btn` "Continue to payment" button in `DonationCard`).

**Why:** If a user types `"0"` into the custom input, `custom === "0"` is truthy → `effective = Number("0") = 0` → `openGive({amount: 0, mode})` → `GiveModal` opens with "R0 /mo" and Continue calls `buildOzowUrl({amount: 0 || 50, mode})`. The `|| 50` rescue in `GiveModal` silently bumps the amount, hiding the bad UI state.

**How:** `disabled={!effective || effective < 1}` on the `.give-btn`. Optionally also strip leading zeros in the input `onChange`.

### 3. Fix tablist ARIA in `DonationCard`

**Where:** `components.jsx` ~lines 219-222 (the `<div className="seg" role="tablist">` once/monthly toggle).

**Why:** `role="tablist"` is set on the container but the inner `<button>`s have no `role="tab"` or `aria-selected` — screen readers announce "tab list" then encounter generic buttons. These aren't really tabs anyway (no panel switch); they're mode toggles.

**How:** Drop `role="tablist"` entirely and add `aria-pressed={mode === "once"}` / `aria-pressed={mode === "monthly"}` to the two buttons. Optionally also add `aria-pressed` to the preset amount buttons and the Other button so AT reflects the visual `.active` class.

### 4. Add accessible name to custom-amount `<input>` in `DonationCard`

**Where:** `components.jsx` ~lines 238-244.

**Why:** Placeholder text disappears on focus and SRs don't reliably treat it as a label. The input is currently anonymous to assistive tech.

**How:** `aria-label="Custom donation amount in Rand"` on the `<input>`. (Visually-hidden `<label>` is fine too, but `aria-label` is cheaper here.)

### 5. Make `GiveModal` dialog discoverable to screen readers

**Where:** `components.jsx` ~lines 370, 374 (the `<div className="modal" role="dialog" aria-modal="true">` and the `<h3>Confirm your gift</h3>`).

**Why:** The dialog has no accessible name — SRs just announce "dialog".

**How:** Give the h3 `id="give-modal-title"` and add `aria-labelledby="give-modal-title"` on the `.modal` div.

### 6. Handle Escape key in `GiveModal`

**Where:** `components.jsx` inside `GiveModal`.

**Why:** Backdrop click closes the modal, but pressing Escape doesn't — universally expected modal behaviour.

**How:**
```jsx
React.useEffect(() => {
  const onKey = (e) => { if (e.key === "Escape") onClose(); };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [onClose]);
```

### 7. Associate `<label>`s with `<input>`s in `GiveModal`

**Where:** `components.jsx` ~lines 383-398 (the two `.field` divs).

**Why:** Labels are siblings of inputs without `htmlFor`/`id` linking — most screen readers do not infer association by proximity, so the inputs are announced as unlabelled.

**How:** Either wrap each `<input>` inside its `<label>`, or add matching `htmlFor="give-name"` / `id="give-name"` and `htmlFor="give-email"` / `id="give-email"`.

---

## Priority 2 — polish (any order, batch as convenient)

### 8. Log errors in `GiveModal.handlePay` before alerting

**Where:** `components.jsx` ~line 361 (the `catch (e)` block).

**Why:** Currently swallows `e` — Web Crypto or config errors disappear into a generic alert. Add `console.error("Ozow redirect failed", e);` so DevTools captures the stack.

### 9. Focus management + body scroll lock in `GiveModal`

**Where:** `components.jsx` inside `GiveModal`.

**Why:** When the modal opens, focus stays on the trigger behind it; the page underneath continues to scroll. Both are standard modal expectations.

**How:** `useEffect` on mount to (a) focus the close button or first input via a ref, (b) set `document.body.style.overflow = "hidden"`, returning a cleanup that restores both.

### 10. Relabel decorative QR

**Where:** `components.jsx` ~line 51 (the `QR` component).

**Why:** `aria-label="QR code"` suggests it's scannable; it's a 13×13 hand-drawn pattern, not a real code. The caption "Tap the QR or scan from a printed card" already conveys where the real code lives.

**How:** Either `aria-hidden="true"` on the wrapper `<div className="qr">`, or relabel to `"QR illustration"`.

### 11. Mark Hero progress bar as a progressbar

**Where:** `components.jsx` ~line 87 (`<div className="hero-bar">` / `<div className="hero-bar-fill">`).

**Why:** Currently a pure-visual element. Once the meta numbers become real (out-of-scope item from the plan), the progress bar should report its value to AT.

**How:** `role="progressbar" aria-valuenow={32} aria-valuemin={0} aria-valuemax={100} aria-label="R12,800 of R40,000 raised"` on the outer `.hero-bar`. Convert the constants to props when the numbers go dynamic.

### 12. Fix Footer heading-level skip + dynamic year

**Where:** `components.jsx` Footer block (~lines 255-294).

**Why:**
- All four column headings are `<h4>` with no `<h3>` above in the footer — heading-level skip. Other sections in the page use `<h3>` for nested headings; `<h4>` in the footer is inconsistent.
- `© 2026` will be wrong on 1 Jan 2027. No SSR, so `new Date().getFullYear()` is hydration-safe.

**How:** Demote the column headings to `<h3>` (purely a JSX change; the CSS targets `.foot-col h4` so either update both or use a class). Replace `2026` with `{new Date().getFullYear()}`.

### 13. Align CTABand with sibling-section conventions

**Where:** `components.jsx` ~lines 231-254.

**Why:** Other sections have `id="..."` and `<h2 className="h2">`; CTABand has neither. The `.cta-band h2` selector in `Homepage.html` styles it directly, so it works visually — but the design-system `.h2` token won't apply if it ever evolves.

**How:** Add `id="cta"` to the section and `className="h2"` to the h2. Optionally also trim the redundant `.cta-band h2` CSS in `Homepage.html` if it duplicates `.h2`.

### 14. Rename `.smallact` to something self-documenting

**Where:** `components.jsx` Story section, plus the `.smallact` rule in `Homepage.html`.

**Why:** Vague — likely "small action," but it doesn't read that way. `.story-cta` or `.inline-link` would self-document.

### 15. Remove dead `counter-reset: step` CSS

**Where:** `Homepage.html` (look for `counter-reset: step` on `.how-grid`).

**Why:** The CSS scaffolding exists but no `.step` rule uses `counter-increment` and the step numbers are rendered directly in JSX (`<span className="step-n">{s.n}</span>`). Either remove the `counter-reset` line, or finish wiring the counter and drop the `n` field from the data array (preferable for resilience to reordering).

---

## Out-of-scope reminder

Items already in the plan's "Out of scope (follow-ups)" — track them there, not here:
- Move `buildOzowUrl` server-side and use real Ozow credentials (also fixes the `Optional1`-not-in-hash latent bug surfaced during Task 1 review)
- Real recipient ID + needs feed (currently hardcoded to Jaylin)
- Real `hero-meta` numbers from a backend (47 / R12,800 / R40,000)
- Remove `#__err` overlay + `try/catch` around `ReactDOM.createRoot` once stable
- Replace Babel-standalone with Vite

---

## How to execute this list

These are independent. The recommended approach next session:

1. Open this file. Use `superpowers:writing-plans` to convert items 1-7 into a small implementation plan (they're the ones that meaningfully affect a real user); add items 8-15 as a second pass if there's appetite.
2. Or just open the relevant `components.jsx` line, fix in place, and commit per item with a `fix:` prefix.

Manual browser smoke test is still outstanding from Task 11 — hard-reload `http://localhost:3333/Homepage.html` at desktop width and 375px before declaring the Homepage2 redesign visually verified.
