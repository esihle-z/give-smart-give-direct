# Give Smart Pilot Homepage — Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Rebuild Homepage.html as the pilot launch page for givesmartgivedirect.co.za with real content, Jaylin's photo, and Ozow payment integration.

**Architecture:** Single self-contained HTML file loading React 18 via CDN + Babel standalone. Components split across app.jsx, components.jsx, icons.jsx. Ozow payment uses client-side redirect with sandbox placeholders; hash computed via Web Crypto API.

**Tech Stack:** HTML5, Vanilla CSS, React 18 (CDN), Babel Standalone, Ozow redirect API

**Reference:** `docs/plans/2026-05-12-homepage-pilot-design.md`

---

### Task 1: Design System CSS

**Files:** Modify `Homepage.html` — `<style>` block

Update/add these CSS rules (keep all existing variables):

- `.hero` → `background-image: url('assets/images/jaylin.jpg'); background-size: cover; background-position: center 15%; min-height: 100svh;`
- `.hero::before` → gradient overlay: `linear-gradient(105deg, rgba(10,34,64,.88) 0%, rgba(10,34,64,.55) 55%, rgba(10,34,64,.2) 100%)`
- `.hero-content` → `position: relative; z-index: 1; padding: 80px 0 100px; max-width: 600px;`
- `.trust-icons` → `display: flex; gap: 28px; margin: 24px 0; flex-wrap: wrap;`
- `.trust-icon` → `display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,.85); text-align: center;`
- `.story-photo` → `position: relative; aspect-ratio: 3/4; border-radius: 22px; overflow: hidden; box-shadow: 0 30px 60px -20px rgba(10,34,64,.3);`
- `.story-photo img` → `width: 100%; height: 100%; object-fit: cover; object-position: center top;`
- `.story-quote-pill` → `position: absolute; bottom: 20px; left: 16px; right: 16px; background: var(--navy-900); border-radius: 16px; padding: 16px 20px; color: var(--white); display: flex; gap: 12px; align-items: flex-start;`
- `.how-grid::before` (dashed connector) → `content: ""; position: absolute; top: 44px; left: calc(12.5% + 28px); right: calc(12.5% + 28px); border-top: 2px dashed var(--accent); z-index: 0;` — hide below 880px
- `.recipient-wrap` → `position: absolute; bottom: 32px; right: 40px; z-index: 2;` — `position: static; padding: 0 20px 32px;` below 760px
- All multi-column grids collapse to 1 col at ≤640px

Verify: open in browser, fonts load, no layout breaks.

Commit: `git commit -m "feat: update design system CSS for pilot"`

---

### Task 2: Nav Component

**Files:** Modify `app.jsx` — `Nav` function

```jsx
function Nav({ openGive }) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="brand">
          <BrandLogo size={42} />
          <div className="brand-text">
            <span className="t1">Give smart</span>
            <span className="t2">Give direct.</span>
            <span className="t3">givesmartgivedirect.co.za</span>
          </div>
        </div>
        <div className="nav-cta">
          <button className="btn btn-primary" onClick={openGive} id="nav-donate-btn">Donate</button>
          <button className="menu-icon" aria-label="Menu"><Icon.Menu size={20} /></button>
        </div>
      </div>
    </header>
  );
}
```

Verify: logo left, Donate + hamburger right on all screen sizes.

Commit: `git commit -m "feat: rebuild Nav for pilot"`

---

### Task 3: Hero Section

**Files:** Modify `components.jsx` — `Hero` function

```jsx
function Hero({ tw, openGive }) {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-content">
          <span className="eyebrow"><span className="dot" /> Person to person · giving, with proof</span>
          <h1 className="h1">
            <span>Dignified giving.</span>
            <span className="accent with-rule">Real impact.</span>
          </h1>
          <p className="hero-sub">
            Scan a code. Support someone directly. Help restore dignity
            through essentials that matter.
          </p>
          <div className="trust-icons">
            <div className="trust-icon"><Icon.Shield size={28} /><span>Verified<br/>Recipients</span></div>
            <div className="trust-icon"><Icon.Bag size={28} /><span>Essentials<br/>Only</span></div>
            <div className="trust-icon"><Icon.Check size={28} /><span>Transparent<br/>& Trusted</span></div>
          </div>
          <DonationWidget accent={tw.accent} set={tw.amountSet} onGive={openGive} />
        </div>
      </div>
      <div className="recipient-wrap">
        <div className="recipient-card" role="group" aria-label="Verified recipient">
          <div className="head">
            <span className="badge-ic"><Icon.Check size={12} stroke="#0A2240" /></span>
            Verified Support Recipient
          </div>
          <div className="body">
            <div>
              <h3 className="name">Jaylin Cecelia Nomdo</h3>
              <p className="sub">Scan to support essentials</p>
            </div>
            <QR />
          </div>
          <div className="foot">
            <Icon.HeartFilled size={14} style={{ color: "var(--accent)" }} />
            <span>Give smart. Give direct.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Verify: Jaylin's photo fills hero bg, headline left, recipient card bottom-right, widget visible.

Commit: `git commit -m "feat: Hero with real photo and recipient card"`

---

### Task 4: Donation Widget (updated amounts)

**Files:** Modify `components.jsx` — `DonationWidget`

Change presets to `[10, 20, 50]`. "Other" remains the custom input field. Default selected: 50.

Verify: R10 / R20 / R50 / Other render. Default R50 Monthly highlighted.

Commit: `git commit -m "feat: update donation amounts to R10/R20/R50"`

---

### Task 5: Story Section

**Files:** Modify `components.jsx` — `Story` function

```jsx
function Story() {
  return (
    <section className="section tint" id="story">
      <div className="container">
        <div className="story-grid">
          <div>
            <span className="micro">Real people. Real possibilities.</span>
            <h2 className="h2">Help someone transform their life.</h2>
            <p className="lede">
              Jaylin is just one of the many kids from Nectar Road informal settlement
              community, whose homes were destroyed by the recent storm. Your support
              helps them rebuild their homes and restore dignity.
            </p>
            <p className="smallact" style={{color:"var(--accent-strong)",fontWeight:700,marginTop:20}}>
              Small acts. Big change.
            </p>
            <a href="#how" className="btn btn-primary btn-lg" style={{marginTop:24,display:"inline-flex",gap:10}}>
              See how it works <Icon.ArrowRight />
            </a>
          </div>
          <div className="story-photo">
            <img src="assets/images/jaylin.jpg" alt="Jaylin Cecelia Nomdo" />
            <div className="story-quote-pill">
              <span style={{color:"var(--accent)",fontWeight:800,fontSize:28,lineHeight:.6,marginTop:6}}>"</span>
              <p style={{margin:0,fontSize:15,lineHeight:1.45,fontWeight:500}}>
                Thank you for seeing me, not just my situation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Verify: real photo with quote overlay. Text/photo side by side on desktop, stacked on mobile.

Commit: `git commit -m "feat: Story section with real photo and Jaylin copy"`

---

### Task 6: How It Works (4 steps + dashed connector)

**Files:** Modify `components.jsx` — `HowItWorks`

Update steps:
```jsx
const steps = [
  { ic: <Icon.Users />, n: 1, t: "Scan",    d: "Scan the QR code on the card." },
  { ic: <Icon.Heart />, n: 2, t: "Donate",  d: "Choose an amount and donate securely." },
  { ic: <Icon.Bag />,   n: 3, t: "Support", d: "Your donation funds essentials for them." },
  { ic: <Icon.Shield />,n: 4, t: "Redeem",  d: "They shop for what they truly need." },
];
```

Add `position: relative` to `.how-grid` so `::before` connector line works.

Verify: 4 steps, green dashed line connecting icons on desktop, no line on mobile.

Commit: `git commit -m "feat: HowItWorks 4 steps with connector"`

---

### Task 7: Impact Pillars

**Files:** Modify `components.jsx` — `Impact`

Replace animated counters with 4 static value pillars:
```jsx
const pillars = [
  { ic: <Icon.Users />,  n: "100%",      l: "of donations go to essentials" },
  { ic: <Icon.Shield />, n: "Verified",  l: "recipients through trusted partners" },
  { ic: <Icon.Heart />,  n: "Dignity",   l: "preserved through choice, not charity" },
  { ic: <Icon.Chart />,  n: "Real Impact", l: "transparent, trackable and accountable" },
];
```

For `.n` style: if value length > 4, use `fontSize: 28` instead of 44.

Add heading: `<span className="micro" style={{color:"var(--accent)"}}>Together, we create impact</span>`

Verify: dark navy section, 4 green-icon pillars, readable on mobile.

Commit: `git commit -m "feat: Impact section with value pillars"`

---

### Task 8: Gratitude Wall (update copy)

**Files:** Modify `components.jsx` — `Gratitude` notes array

```jsx
const notes = [
  {
    q: "I bought groceries this week for the first time since the storm. My children didn't ask why — just smiled. Thank you, friend I haven't met.",
    who: "Nomsa M.", where: "Nectar Road", initials: "NM", tag: "Groceries",
  },
  {
    q: "My son got to school every day this month. The taxi driver knows him by name now. We are so grateful.",
    who: "Lindiwe T.", where: "Nectar Road", initials: "LT", tag: "Transport",
  },
  {
    q: "We are rebuilding, brick by brick. Knowing someone cares makes it possible to keep going.",
    who: "Mama Joyce", where: "Nectar Road", initials: "MJ", tag: "Rebuilding",
  },
];
```

Verify: 3 Caveat-font quote cards with green ribbons and avatars.

Commit: `git commit -m "feat: Gratitude wall with Nectar Road community stories"`

---

### Task 9: Footer (simplified)

**Files:** Modify `components.jsx` — `Footer`

Keep 4-column layout. Update links to match pilot sections. Add `givesmartgivedirect.co.za` in foot-bottom.

Key links:
- Give: Donate now (#hero), Browse recipients (#recipients), How it works (#how)
- Trust: Verification (#how), Our impact (#impact)
- Contact: `hello@givesmartgivedirect.co.za`, Apply as recipient (#hero)

Footer bottom: `© 2026 Give Smart. Give Direct. · Cape Town, South Africa` | `givesmartgivedirect.co.za · Section 18A receipts available`

Verify: navy footer, columns on desktop, stacked on mobile.

Commit: `git commit -m "feat: simplified pilot footer"`

---

### Task 10: Ozow Payment Integration

**Files:**
- Modify: `Homepage.html` — add `GATEWAY_CONFIG` in inline `<script>` block
- Modify: `components.jsx` — add `buildOzowUrl`, update `GiveModal`

**Step 1:** Add to `Homepage.html` inline script (before React scripts):
```js
window.GATEWAY_CONFIG = {
  provider: "ozow",
  siteCode:   "YOUR_OZOW_SITE_CODE",
  privateKey: "YOUR_OZOW_PRIVATE_KEY",
  countryCode: "ZA",
  currencyCode: "ZAR",
  isTest: true,
  successUrl: window.location.origin + "/?payment=success",
  errorUrl:   window.location.origin + "/?payment=error",
  cancelUrl:  window.location.origin + "/?payment=cancelled",
};
```

**Step 2:** Add `buildOzowUrl` at top of `components.jsx`:
```js
async function buildOzowUrl({ amount, mode }) {
  const cfg = window.GATEWAY_CONFIG;
  const ref = "GSGD-" + Date.now();
  const bankRef = "JAYLIN001-" + ref.slice(-6);
  const hashInput = [
    cfg.siteCode, cfg.countryCode, cfg.currencyCode,
    amount.toFixed(2), bankRef, ref,
    cfg.successUrl, cfg.errorUrl, cfg.cancelUrl,
    cfg.isTest ? "true" : "false", cfg.privateKey
  ].join("").toLowerCase();
  const buf = await crypto.subtle.digest("SHA-512", new TextEncoder().encode(hashInput));
  const hashCheck = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
  const params = new URLSearchParams({
    SiteCode: cfg.siteCode, CountryCode: cfg.countryCode,
    CurrencyCode: cfg.currencyCode, Amount: amount.toFixed(2),
    TransactionReference: ref, BankRef: bankRef,
    SuccessUrl: cfg.successUrl, ErrorUrl: cfg.errorUrl,
    CancelUrl: cfg.cancelUrl, IsTest: String(cfg.isTest),
    HashCheck: hashCheck,
    ...(mode === "monthly" ? { Optional1: "monthly-recurring" } : {}),
  });
  return `https://pay.ozow.com/?${params.toString()}`;
}
```

**Step 3:** Update `GiveModal` to redirect to Ozow on submit:
```jsx
function GiveModal({ details, onClose }) {
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  if (!details) return null;

  const handlePay = async () => {
    setLoading(true);
    try {
      const url = await buildOzowUrl({ amount: details.amount || 50, mode: details.mode });
      window.location.href = url;
    } catch(e) {
      alert("Could not start payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="modal-back" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="x" onClick={onClose}><Icon.Close /></button>
        <h3>Confirm your gift</h3>
        <p>You're giving to Jaylin and the Nectar Road community.</p>
        <div className="summary">
          <span className="lbl">{details.mode === "monthly" ? "Monthly gift" : "One-time gift"}</span>
          <span className="amt">R{Number(details.amount||0).toLocaleString()}{details.mode==="monthly"?" /mo":""}</span>
        </div>
        <div className="field"><label>Your name</label><input placeholder="So Jaylin can thank you" value={name} onChange={e=>setName(e.target.value)} /></div>
        <div className="field"><label>Email for receipt</label><input placeholder="you@email.co.za" value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <button className="give-btn" onClick={handlePay} disabled={loading}>
          {loading ? "Redirecting…" : <><Icon.Lock /> Continue to payment <Icon.ArrowRight /></>}
        </button>
      </div>
    </div>
  );
}
```

**Step 4:** Detect `?payment=success/error/cancelled` in `App.jsx` on mount and show a toast/banner.

**Step 5:** Test: click Give → modal opens → click Continue → browser redirects to Ozow (sandbox). Confirm URL contains SiteCode, Amount, HashCheck params.

Commit: `git commit -m "feat: Ozow payment integration (sandbox mode)"`

---

### Task 11: Mobile Polish & QA

**Files:** Modify `Homepage.html` — media queries

Check at 375px (iPhone) and 768px (iPad):
- [ ] Nav: no overflow
- [ ] Hero: headline readable, widget full-width, recipient card below content
- [ ] Story: photo above text on mobile
- [ ] How it works: 2×2 tablet, 1 col mobile, no dashed line on mobile
- [ ] Impact: 2×2 tablet, 1 col mobile
- [ ] Gratitude: 1 col mobile
- [ ] Footer: 2 col tablet, 1 col mobile

Fix any overflow/wrapping issues. Verify `?payment=success` shows success message.

Commit: `git commit -m "feat: mobile polish and QA for pilot launch"`

---

### Task 12: Render & Review

Open `Homepage.html` in browser. Walk through:
1. Scroll full page — all sections present
2. Click Donate → modal → Continue → Ozow redirect
3. Resize to 375px — all sections readable

When ready to deploy: drag folder to Netlify, point `givesmartgivedirect.co.za` DNS. Before go-live, move `buildOzowUrl` to a Netlify serverless function and set `isTest: false` with real credentials.
