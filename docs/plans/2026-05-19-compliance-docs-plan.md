# Compliance Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the three Phase-3 compliance artifacts (Privacy Policy page, Terms of Service page, footer disclosure block) and add a newsletter opt-in checkbox to the donation modal, so the site can lawfully accept donations once Phase 1 (PayFast plumbing) is complete.

**Architecture:** Two static HTML pages at the repo root (`privacy.html`, `terms.html`) styled with minimal inline CSS that mirrors the existing brand tokens. Two edits to `components.jsx`: replace `Footer` with an ECT Act §43 disclosure version, and add a newsletter-opt-in checkbox to `GiveModal`. All operator and NPO-specific values are written as `__PLACEHOLDER__` tokens to be filled by the business partner before launch.

**Tech Stack:** Hand-written HTML/CSS, React via Babel-standalone (no build step), same fonts/colors as the live site (`Fraunces`, `Inter`, `--navy-900`, `--green-500`, `--paper`, `--ink` CSS variables).

---

## Verification commands

This codebase has no unit-test framework — manual smoke + two static checks (per `CLAUDE.md`). Use these throughout the plan:

```bash
# 1. Curly-quote check (Babel rejects these; site goes blank if any slip in)
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' components.jsx privacy.html terms.html

# 2. Babel syntax-parse of components.jsx (requires @babel/core + @babel/preset-react in node_modules)
node -e "require('@babel/core').parseSync(require('fs').readFileSync('components.jsx','utf8'), {presets:['@babel/preset-react']})"

# 3. HTML validity of new pages (no installed tool — just visually load over HTTP)
python3 -m http.server 3333
# then open http://localhost:3333/privacy.html and /terms.html
```

## Placeholder convention

All operator/NPO values use `__TOKEN__` form (double underscores) so they are inert in both HTML and JSX (JSX `{{ }}` would otherwise be parsed as an expression block). Tokens:

| Token | Meaning |
|---|---|
| `__OPERATOR_NAME__` | Business partner's full legal name (operator) |
| `__OPERATOR_ADDRESS__` | Physical address (ECT Act §43) |
| `__OPERATOR_EMAIL__` | Public contact email |
| `__OPERATOR_PHONE__` | Public phone number |
| `__NPO_NAME__` | Partner NPO's registered name |
| `__NPO_NUMBER__` | NPO registration number |
| `__NPO_CONTACT__` | Public NPO contact email |
| `__EFFECTIVE_DATE__` | Policy effective date |

After the partner sends details, a single repo-wide find-and-replace across `privacy.html`, `terms.html`, `components.jsx` swaps them out.

---

## Task 1: Create `privacy.html`

**Files:**
- Create: `privacy.html`

- [ ] **Step 1: Create the file with the content below**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Privacy Policy — Give Smart. Give Direct.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --navy-900: #0A2240;
    --green-500: #6DBE3F;
    --ink: #0A1F3A;
    --ink-2: #41546F;
    --paper: #FAF9F5;
    --line: #E5E3DA;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--ink);
    background: var(--paper);
    line-height: 1.6;
  }
  .container { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
  header.doc-head { border-bottom: 1px solid var(--line); padding-bottom: 24px; margin-bottom: 32px; }
  a.back { color: var(--green-500); text-decoration: none; font-weight: 600; font-size: 14px; }
  a.back:hover { text-decoration: underline; }
  h1 { font-family: 'Fraunces', serif; font-weight: 700; color: var(--navy-900); font-size: 36px; margin: 16px 0 8px; }
  .updated { color: var(--ink-2); font-size: 14px; }
  h2 { font-family: 'Fraunces', serif; font-weight: 600; color: var(--navy-900); font-size: 22px; margin: 40px 0 12px; }
  p, li { color: var(--ink); }
  a { color: var(--green-500); }
  ul { padding-left: 20px; }
  li { margin-bottom: 6px; }
  footer.doc-foot { border-top: 1px solid var(--line); margin-top: 48px; padding-top: 24px; color: var(--ink-2); font-size: 14px; }
</style>
</head>
<body>
  <div class="container">
    <header class="doc-head">
      <a href="/" class="back">&larr; Back to Give Smart</a>
      <h1>Privacy Policy</h1>
      <p class="updated">Effective __EFFECTIVE_DATE__</p>
    </header>

    <h2>1. Who we are</h2>
    <p>
      Give Smart. Give Direct. ("Give Smart", "we", "us") is a direct-giving
      platform operated by __OPERATOR_NAME__. For the current pilot, all
      donations are processed by and settle directly into the merchant
      account of our partner non-profit, __NPO_NAME__ (NPO registration
      number __NPO_NUMBER__). Give Smart presents recipients' stories and
      routes donors to the payment gateway; the NPO is the actual recipient
      of the funds.
    </p>

    <h2>2. What we collect</h2>
    <p>When you make a donation we collect:</p>
    <ul>
      <li>Your name (so the recipient and the NPO can thank you)</li>
      <li>Your email address (for receipts and follow-up)</li>
      <li>The amount and date of your gift</li>
    </ul>
    <p>
      We also keep basic server-side request logs (IP address, timestamp,
      the page requested) for security and troubleshooting. We do not use
      third-party analytics, advertising trackers, or social media
      tracking pixels.
    </p>
    <p>
      Your payment card details are entered directly on PayFast's secure
      payment page. We never see, store, or process your card data.
    </p>

    <h2>3. Why we collect it</h2>
    <p>We use your information for these purposes only:</p>
    <ul>
      <li>To fulfil your donation &mdash; your name and email are passed to PayFast so the transaction can be processed and you receive a receipt.</li>
      <li>To send you a one-off thank-you and an impact update about how your gift was used.</li>
      <li>To share with our partner NPO __NPO_NAME__, so they can acknowledge you and (where applicable) issue a Section 18A tax receipt.</li>
      <li><strong>Only if you tick the opt-in box at donation time:</strong> to add you to a list for occasional updates about future giving opportunities. You can unsubscribe at any time.</li>
    </ul>

    <h2>4. Who we share it with</h2>
    <p>We share your name and email with:</p>
    <ul>
      <li><strong>PayFast</strong> (Payfast (Pty) Ltd) &mdash; to process your donation. PayFast is PCI DSS Level 1 certified.</li>
      <li><strong>__NPO_NAME__</strong> &mdash; our partner NPO and the merchant of record for your donation.</li>
    </ul>
    <p>We do not sell or rent your data, and we do not share it with any other third party.</p>

    <h2>5. How long we keep it</h2>
    <p>
      We retain donor records for five (5) years after your most recent
      donation. This aligns with South African tax and financial
      record-keeping norms. After that period we delete or anonymise the
      record unless we are required by law to keep it longer.
    </p>

    <h2>6. Your rights</h2>
    <p>Under POPIA you have the right to:</p>
    <ul>
      <li>Ask what personal information we hold about you</li>
      <li>Ask us to correct it if it is inaccurate</li>
      <li>Ask us to delete it (subject to any legal retention obligations)</li>
      <li>Withdraw your consent for marketing communications at any time</li>
      <li>Object to the processing of your information</li>
      <li>Lodge a complaint with the Information Regulator at <a href="https://inforegulator.org.za">inforegulator.org.za</a></li>
    </ul>
    <p>To exercise any of these rights, contact our Information Officer at <a href="mailto:__OPERATOR_EMAIL__">__OPERATOR_EMAIL__</a>.</p>

    <h2>7. Information Officer</h2>
    <p>Our Information Officer is __OPERATOR_NAME__, reachable at <a href="mailto:__OPERATOR_EMAIL__">__OPERATOR_EMAIL__</a>.</p>

    <h2>8. Cookies</h2>
    <p>
      Give Smart does not set tracking cookies. The site stores one
      technical preference in your browser's local storage to remember
      any developer tweaks-panel state. This stays on your device and is
      never sent to us.
    </p>

    <h2>9. Changes to this policy</h2>
    <p>
      We may update this policy from time to time. The effective date at
      the top of the page reflects the latest version. Material changes
      will be announced on the site homepage.
    </p>

    <footer class="doc-foot">
      <p>Questions? <a href="mailto:__OPERATOR_EMAIL__">__OPERATOR_EMAIL__</a> &middot; <a href="/terms.html">Terms of Service</a></p>
    </footer>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify it renders cleanly**

If a Python server is already running on port 3333, hard-reload `http://localhost:3333/privacy.html`. Otherwise:

```bash
python3 -m http.server 3333
```

Expected: page loads in Inter/Fraunces fonts, navy headings, green links. All `__TOKEN__` placeholders visibly bracketed (not silently rendered empty).

- [ ] **Step 3: Curly-quote check**

```bash
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' privacy.html
```

Expected: no output. Curly quotes won't break HTML the way they break JSX, but consistency matters and grep is cheap.

- [ ] **Step 4: Commit**

```bash
git add privacy.html
git commit -m "feat: add Privacy Policy page with POPIA disclosures"
```

---

## Task 2: Create `terms.html`

**Files:**
- Create: `terms.html`

- [ ] **Step 1: Create the file with the content below**

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Terms of Service &mdash; Give Smart. Give Direct.</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --navy-900: #0A2240;
    --green-500: #6DBE3F;
    --ink: #0A1F3A;
    --ink-2: #41546F;
    --paper: #FAF9F5;
    --line: #E5E3DA;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Inter', system-ui, sans-serif;
    color: var(--ink);
    background: var(--paper);
    line-height: 1.6;
  }
  .container { max-width: 720px; margin: 0 auto; padding: 48px 24px; }
  header.doc-head { border-bottom: 1px solid var(--line); padding-bottom: 24px; margin-bottom: 32px; }
  a.back { color: var(--green-500); text-decoration: none; font-weight: 600; font-size: 14px; }
  a.back:hover { text-decoration: underline; }
  h1 { font-family: 'Fraunces', serif; font-weight: 700; color: var(--navy-900); font-size: 36px; margin: 16px 0 8px; }
  .updated { color: var(--ink-2); font-size: 14px; }
  h2 { font-family: 'Fraunces', serif; font-weight: 600; color: var(--navy-900); font-size: 22px; margin: 40px 0 12px; }
  p, li { color: var(--ink); }
  a { color: var(--green-500); }
  ul { padding-left: 20px; }
  li { margin-bottom: 6px; }
  footer.doc-foot { border-top: 1px solid var(--line); margin-top: 48px; padding-top: 24px; color: var(--ink-2); font-size: 14px; }
</style>
</head>
<body>
  <div class="container">
    <header class="doc-head">
      <a href="/" class="back">&larr; Back to Give Smart</a>
      <h1>Terms of Service</h1>
      <p class="updated">Effective __EFFECTIVE_DATE__</p>
    </header>

    <h2>1. About Give Smart</h2>
    <p>
      Give Smart. Give Direct. is a referral and awareness platform
      operated by __OPERATOR_NAME__. We present the stories of verified
      recipients and direct donors to a payment gateway so that a gift
      can be made. For the current pilot, the actual recipient of all
      donations is our partner non-profit, __NPO_NAME__ (NPO
      __NPO_NUMBER__), who acts as the merchant of record.
    </p>

    <h2>2. How donations work</h2>
    <p>
      When you click to give, you are redirected to PayFast, a South
      African payment gateway. The transaction is processed by PayFast
      and settles into __NPO_NAME__'s merchant account. Your card
      statement will reflect __NPO_NAME__ as the merchant. PayFast or
      the NPO will send you a transactional receipt by email.
    </p>

    <h2>3. Tax receipts</h2>
    <p>
      Section 18A tax receipts (where applicable) are issued by our
      partner NPO, not by Give Smart. To request a Section 18A receipt
      or to query one already issued, contact __NPO_NAME__ at
      <a href="mailto:__NPO_CONTACT__">__NPO_CONTACT__</a>.
    </p>

    <h2>4. Your responsibilities as a donor</h2>
    <ul>
      <li>Provide an accurate name and email so the receipt and any follow-up reach you.</li>
      <li>Use only a payment method you are lawfully authorised to use.</li>
      <li>Do not attempt to interfere with the site, the payment gateway, or any other donor's transaction.</li>
    </ul>

    <h2>5. Refunds and disputes</h2>
    <p>
      Donations are intended to be final. Give Smart does not hold donor
      funds and cannot reverse a transaction. If you believe a payment
      was made in error or fraudulently, please contact PayFast and
      __NPO_NAME__ directly to initiate a dispute.
    </p>

    <h2>6. Recipient information</h2>
    <p>
      We present recipients and their stories in good faith and
      undertake reasonable verification before publishing. However, we
      make no warranty about the precise allocation of any individual
      gift, and Give Smart is not responsible for how donated funds are
      subsequently used by the partner NPO or any onward recipient.
      Donations are made to the NPO and are not earmarked contracts with
      any specific individual unless the NPO explicitly states otherwise.
    </p>

    <h2>7. Limitation of liability</h2>
    <p>
      To the maximum extent permitted by South African law, Give Smart,
      __OPERATOR_NAME__, and our agents are not liable for any indirect,
      incidental, special, or consequential damages arising out of your
      use of the site or your decision to donate. Our total liability in
      connection with any transaction is limited to the value of that
      transaction.
    </p>

    <h2>8. Governing law</h2>
    <p>
      These terms are governed by the laws of the Republic of South
      Africa. Any dispute will be resolved in the South African courts
      having jurisdiction.
    </p>

    <h2>9. Changes to these terms</h2>
    <p>
      We may update these terms from time to time. The effective date at
      the top reflects the latest version. You are bound by the version
      of these terms that is live at the time of your donation.
    </p>

    <h2>10. Contact</h2>
    <p>Questions about these terms: <a href="mailto:__OPERATOR_EMAIL__">__OPERATOR_EMAIL__</a></p>

    <footer class="doc-foot">
      <p><a href="/privacy.html">Privacy Policy</a> &middot; __OPERATOR_NAME__ &middot; __OPERATOR_ADDRESS__</p>
    </footer>
  </div>
</body>
</html>
```

- [ ] **Step 2: Verify it renders**

Hard-reload `http://localhost:3333/terms.html`. Confirm fonts, colors, all placeholders visible, "Back to Give Smart" link returns to `/`.

- [ ] **Step 3: Curly-quote check**

```bash
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' terms.html
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add terms.html
git commit -m "feat: add Terms of Service page with NPO-as-merchant disclosure"
```

---

## Task 3: Replace `Footer` in `components.jsx` with ECT §43 disclosure

**Files:**
- Modify: `components.jsx:246-285` (`Footer` function)

- [ ] **Step 1: Read the current Footer to confirm line numbers**

```bash
sed -n '246,285p' components.jsx
```

Expected: shows the `function Footer() { ... }` block ending with `}` before `function DonationCard`.

- [ ] **Step 2: Replace the Footer function**

Use Edit to replace the entire `function Footer() { ... }` block (lines 246-285) with:

```jsx
function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="foot-top">
          <div className="foot-brand">
            <BrandLogo size={36} />
            <div className="foot-wordmark">
              <span>Give Smart</span>
              <span className="accent">Give Direct.</span>
            </div>
            <p className="foot-tag">
              Person to person giving, with proof. Cape Town, South Africa.
            </p>
          </div>
          <div className="foot-col">
            <h4>Give</h4>
            <a href="#give">Donate now</a>
            <a href="#story">Meet Jaylin</a>
            <a href="#how">How it works</a>
          </div>
          <div className="foot-col">
            <h4>Legal</h4>
            <a href="/privacy.html">Privacy policy</a>
            <a href="/terms.html">Terms of service</a>
            <a href="#how">Verification</a>
            <a href="#impact">Our impact</a>
          </div>
          <div className="foot-col">
            <h4>Contact</h4>
            <a href="mailto:__OPERATOR_EMAIL__">__OPERATOR_EMAIL__</a>
            <span style={{ color: "var(--ink-3, #7E8EA3)" }}>__OPERATOR_PHONE__</span>
            <span style={{ color: "var(--ink-3, #7E8EA3)" }}>__OPERATOR_ADDRESS__</span>
          </div>
        </div>
        <div className="foot-disclosure" style={{ borderTop: "1px solid var(--line, #E5E3DA)", paddingTop: 16, marginTop: 24, fontSize: 13, color: "var(--ink-2, #41546F)", lineHeight: 1.5 }}>
          <p style={{ margin: 0 }}>
            Give Smart. Give Direct. is operated by __OPERATOR_NAME__.
            Donations for the current pilot are received by our partner
            non-profit, __NPO_NAME__ (NPO __NPO_NUMBER__), who is the
            merchant of record. Section 18A tax receipts are issued by
            the NPO on request.
          </p>
        </div>
        <div className="foot-bottom">
          <span>&copy; 2026 Give Smart. Give Direct.</span>
          <span>givesmartgivedirect.co.za</span>
        </div>
      </div>
    </footer>
  );
}
```

Note: the existing "Trust" column is merged into a renamed "Legal" column that now leads with Privacy/Terms (the legally required links) and keeps the Verification/Impact anchors below. This avoids growing the footer to a 5-column grid.

- [ ] **Step 3: Curly-quote + Babel parse**

```bash
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' components.jsx
node -e "require('@babel/core').parseSync(require('fs').readFileSync('components.jsx','utf8'), {presets:['@babel/preset-react']})"
```

Expected: grep returns nothing, node command exits 0 with no output.

- [ ] **Step 4: Browser smoke**

Hard-reload `http://localhost:3333/`. Scroll to footer. Confirm:
- Four columns render (Brand, Give, Legal, Contact)
- Privacy policy and Terms of service links navigate to `/privacy.html` and `/terms.html`
- ECT §43 disclosure paragraph visible above the copyright line
- All `__TOKEN__` placeholders rendered as literal text (not collapsed to empty)
- No console errors (open DevTools Console)

- [ ] **Step 5: Commit**

```bash
git add components.jsx
git commit -m "feat: add ECT Act section 43 disclosure to footer, link Privacy/Terms"
```

---

## Task 4: Add newsletter opt-in checkbox to `GiveModal`

**Files:**
- Modify: `components.jsx:339-399` (`GiveModal` function)

- [ ] **Step 1: Add the `optIn` state variable**

Use Edit to change:

```jsx
function GiveModal({ details, onClose }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
```

to:

```jsx
function GiveModal({ details, onClose }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [optIn, setOptIn] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
```

- [ ] **Step 2: Insert the checkbox between the email field and the Give button**

Use Edit to change:

```jsx
        <div className="field">
          <label>Email for receipt</label>
          <input
            placeholder="you@email.co.za"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <button className="give-btn" onClick={handlePay} disabled={loading}>
```

to:

```jsx
        <div className="field">
          <label>Email for receipt</label>
          <input
            placeholder="you@email.co.za"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--ink-2, #41546F)", margin: "4px 0 12px", cursor: "pointer", lineHeight: 1.4 }}>
          <input
            type="checkbox"
            checked={optIn}
            onChange={e => setOptIn(e.target.checked)}
            style={{ marginTop: 3, flexShrink: 0 }}
          />
          <span>Send me occasional updates about future giving opportunities. You can unsubscribe any time.</span>
        </label>
        <button className="give-btn" onClick={handlePay} disabled={loading}>
```

- [ ] **Step 3: Curly-quote + Babel parse**

```bash
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' components.jsx
node -e "require('@babel/core').parseSync(require('fs').readFileSync('components.jsx','utf8'), {presets:['@babel/preset-react']})"
```

Expected: both clean.

- [ ] **Step 4: Browser smoke**

Hard-reload `http://localhost:3333/`. Click any preset amount to open the GiveModal. Confirm:
- Name and email fields still render and accept input
- Checkbox renders below the email field, **unchecked by default**
- Clicking the label toggles the checkbox
- "Continue to payment" button still sits below the checkbox and (clicking it) still attempts the Ozow redirect (will fail in sandbox, that's expected — Phase 1 replaces this)
- No console errors

- [ ] **Step 5: Mobile width check**

In DevTools, toggle device toolbar and set width to 375px. Confirm checkbox label wraps cleanly and doesn't overflow the modal.

- [ ] **Step 6: Commit**

```bash
git add components.jsx
git commit -m "feat: add newsletter opt-in checkbox to GiveModal (POPIA consent)"
```

---

## Task 5: Final verification + push

- [ ] **Step 1: Full repo curly-quote sweep**

```bash
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' app.jsx components.jsx icons.jsx tweaks-panel.jsx privacy.html terms.html index.html
```

Expected: no output.

- [ ] **Step 2: Babel parse all JSX files**

```bash
for f in app.jsx components.jsx icons.jsx tweaks-panel.jsx; do
  echo "=== $f ==="
  node -e "require('@babel/core').parseSync(require('fs').readFileSync('$f','utf8'), {presets:['@babel/preset-react']})" && echo OK
done
```

Expected: each file prints `=== name ===` then `OK`.

- [ ] **Step 3: End-to-end manual smoke**

Hard-reload `http://localhost:3333/`. Walk through:
1. Homepage renders, no console errors
2. Footer shows Legal column with Privacy / Terms links
3. Click Privacy → reads cleanly, "Back to Give Smart" returns home
4. Click Terms → reads cleanly, footer link to Privacy works
5. Open GiveModal → newsletter checkbox present, default off
6. Resize to 375px → no overflow on homepage, modal, or either policy page

- [ ] **Step 4: Push**

```bash
git push origin main
```

Wait ~30s for GitHub Pages redeploy, then hard-reload `https://www.givesmartgivedirect.co.za/` (or the local URL if HTTPS still pending) and re-verify points 1-6 against the live site.

- [ ] **Step 5: Hand-off note for placeholder fill**

When the business partner sends the eight token values, run:

```bash
# Example — replace VALUES with real ones
sed -i '' 's/__OPERATOR_NAME__/Real Name/g' privacy.html terms.html components.jsx
sed -i '' 's/__OPERATOR_EMAIL__/real@email.co.za/g' privacy.html terms.html components.jsx
# … repeat for each token
```

Then re-verify the site renders, commit (`chore: fill compliance doc placeholders with real values`), and push.

---

## Acceptance criteria (from spec)

- [x] `privacy.html` and `terms.html` exist at repo root, render correctly over HTTP, and link back to `/`. → covered by Tasks 1, 2
- [x] Footer block on `index.html` shows operator name, address, email, phone, NPO name + reg, and links to both new pages. → covered by Task 3
- [x] `GiveModal` shows a newsletter opt-in checkbox, default unchecked. → covered by Task 4
- [x] All `__PLACEHOLDER__` tokens remain visibly bracketed until the partner sends real values. → enforced by manual smoke in every task
- [x] Site still renders end-to-end with no console errors at desktop and at ~375px width. → covered by Task 5 step 3
