# Homepage2 Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adopt `Homepage2.html` as the canonical pilot homepage by rewriting `app.jsx` and `components.jsx` to match its new class names and section structure.

**Architecture:** Single self-contained HTML + three JSX files loaded via Babel-standalone. No build step. Components communicate via props from `App`. State is local: `scrolled` (window scroll), `giveDetails` (modal open), `paymentMsg` (URL-driven toast). All section components register on `window` at the bottom of `components.jsx`.

**Tech Stack:** HTML5, vanilla CSS (already in Homepage2.html), React 18 via CDN, Babel Standalone, Web Crypto API for Ozow hash.

**Spec:** `docs/plans/2026-05-13-homepage2-redesign-design.md`

---

## Universal verification (run at end of every task that touches a `.jsx` file)

Two checks. If either fails, fix before claiming the task is done.

**1. Curly-quote scan** — must return nothing:

```bash
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' app.jsx components.jsx
```

**2. Browser render check** — keep `python3 -m http.server 3333` running from project root, then:

```bash
# In case server isn't running:
lsof -ti :3333 | xargs kill -9 2>/dev/null
cd "/Users/ez/Documents/My_apps/Give Smart" && python3 -m http.server 3333 &>/tmp/give-smart-server.log &
```

Hard-reload `http://localhost:3333/Homepage.html` (Cmd+Shift+R). If a red `#__err` banner appears, paste its contents and fix the named file/line. The page may render only partial sections until later tasks land; that is expected. A broken page (banner) is not.

---

## File structure (after this plan)

```
Homepage.html        ← was Homepage2.html (after Task 1)
app.jsx              ← Nav + App + ReactDOM.render (rewritten in Task 2)
components.jsx       ← buildOzowUrl, QR, all 8 section components + GiveModal + DonationCard (built up Tasks 3–10)
icons.jsx            ← UNCHANGED
docs/plans/2026-05-13-homepage2-redesign-design.md
docs/plans/2026-05-13-homepage2-redesign-plan.md      ← this file
```

Files to delete in Task 1: old `Homepage.html`, `tweaks-panel.jsx`.

---

## Task 1: Swap HTML files and prep components.jsx skeleton

**Files:**
- Delete: `Homepage.html` (old), `tweaks-panel.jsx`
- Rename: `Homepage2.html` → `Homepage.html`
- Replace: `components.jsx` (full rewrite; only the skeleton lands in this task)

- [ ] **Step 1:** Delete old `Homepage.html` and `tweaks-panel.jsx`, rename the new one:

```bash
cd "/Users/ez/Documents/My_apps/Give Smart"
rm Homepage.html tweaks-panel.jsx
mv Homepage2.html Homepage.html
```

- [ ] **Step 2:** Replace `components.jsx` with this skeleton (preserves `buildOzowUrl` + `QR`, stubs every section as a one-line placeholder so the page renders end-to-end without errors after Task 2):

```jsx
// ── Ozow payment URL builder (sandbox; SHA-512 hash client-side) ──────────
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
  const hashCheck = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  const params = new URLSearchParams({
    SiteCode: cfg.siteCode, CountryCode: cfg.countryCode,
    CurrencyCode: cfg.currencyCode, Amount: amount.toFixed(2),
    TransactionReference: ref, BankRef: bankRef,
    SuccessUrl: cfg.successUrl, ErrorUrl: cfg.errorUrl,
    CancelUrl: cfg.cancelUrl, IsTest: String(cfg.isTest),
    HashCheck: hashCheck,
    ...(mode === "monthly" ? { Optional1: "monthly-recurring" } : {}),
  });
  return "https://pay.ozow.com/?" + params.toString();
}

// ── Decorative QR (13×13, not a real scannable code) ──────────────────────
function QR() {
  const pattern = [
    "1111111 010 1111111",
    "1000001 110 1000001",
    "1011101 001 1011101",
    "1011101 110 1011101",
    "1011101 010 1011101",
    "1000001 100 1000001",
    "1111111 011 1111111",
    "0000000 100 0000000",
    "1110100 101 0110011",
    "0011010 010 1100110",
    "1101001 110 0011010",
    "1111111 001 1101101",
    "1000001 010 1100110",
  ].map(r => r.replace(/\s/g, ""));
  const cells = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const on = pattern[r] && pattern[r][c] === "1";
      cells.push(<div key={r + "-" + c} className={"cell " + (on ? "" : "off")} />);
    }
  }
  return <div className="qr" aria-label="QR code">{cells}</div>;
}

// ── Section components (filled in later tasks) ────────────────────────────
function Hero({ openGive }) { return <section className="hero" id="hero" />; }
function Story() { return <section className="section tint" id="story" />; }
function HowItWorks() { return <section className="section" id="how" />; }
function GiveSection({ openGive }) { return <section className="section give-section" id="give" />; }
function Impact() { return <section className="section dark" id="impact" />; }
function CTABand({ openGive }) { return <section className="cta-band" />; }
function Footer() { return <footer />; }
function DonationCard({ openGive }) { return <div className="donation-card" />; }
function GiveModal({ details, onClose }) { return null; }

Object.assign(window, {
  Hero, Story, HowItWorks, GiveSection, Impact, CTABand, Footer,
  DonationCard, GiveModal, QR
});
```

- [ ] **Step 3:** Run the universal verification (curly-quote grep + browser hard-reload). Page should render a working `Homepage.html` but with empty section bodies. The `#__err` banner must not appear. Old features (LiveFeed, gratitude wall, etc.) must be gone.

- [ ] **Step 4:** Commit:

```bash
cd "/Users/ez/Documents/My_apps/Give Smart"
git add -A
git commit -m "chore: swap to Homepage2 HTML, stub new components.jsx skeleton"
```

---

## Task 2: Rewrite app.jsx (Nav + App + payment toast)

**Files:**
- Replace: `app.jsx`

- [ ] **Step 1:** Replace `app.jsx` entirely with this implementation. Nav has scroll-based class toggling (`is-top` / `is-scrolled`). App removes `useTweaks` and wires `openGive` to every section that needs it.

```jsx
const { useState, useEffect } = React;

function Nav({ scrolled, openGive }) {
  return (
    <header className={"nav " + (scrolled ? "is-scrolled" : "is-top")}>
      <div className="container nav-inner">
        <div className="brand">
          <BrandLogo size={36} />
          <div className="brand-text">
            <span className="t1">Give Smart</span>
            <span className="t2">Give Direct.</span>
          </div>
        </div>
        <nav className="nav-links">
          <a href="#how">How it works</a>
          <a href="#story">Story</a>
          <a href="#impact">Impact</a>
        </nav>
        <button className="btn btn-green" onClick={() => openGive()}>Donate</button>
      </div>
    </header>
  );
}

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [giveDetails, setGive] = useState(null);
  const [paymentMsg, setPaymentMsg] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("payment");
    if (p === "success") setPaymentMsg({ type: "success", text: "Thank you! Your gift is on its way." });
    else if (p === "error") setPaymentMsg({ type: "error", text: "Payment failed. Please try again." });
    else if (p === "cancelled") setPaymentMsg({ type: "info", text: "Payment cancelled." });
  }, []);

  const openGive = (details) => {
    if (details && typeof details === "object" && details.amount != null) {
      setGive(details);
    } else {
      setGive({ amount: 50, mode: "monthly" });
    }
  };

  return (
    <>
      <Nav scrolled={scrolled} openGive={openGive} />
      <Hero openGive={openGive} />
      <Story />
      <HowItWorks />
      <GiveSection openGive={openGive} />
      <Impact />
      <CTABand openGive={openGive} />
      <Footer />

      {giveDetails && <GiveModal details={giveDetails} onClose={() => setGive(null)} />}

      {paymentMsg && (
        <div className={"toast toast-" + paymentMsg.type} role="alert">
          <span>{paymentMsg.text}</span>
          <button onClick={() => setPaymentMsg(null)} aria-label="Dismiss">✕</button>
        </div>
      )}
    </>
  );
}

try {
  ReactDOM.createRoot(document.getElementById("app")).render(<App />);
} catch (err) {
  const el = document.getElementById("__err");
  if (el) {
    el.style.display = "block";
    el.textContent = "RENDER ERROR: " + (err && err.message) + "\n" + (err && err.stack);
  }
  throw err;
}
```

- [ ] **Step 2:** Universal verification. Page renders a transparent nav over… nothing yet (sections are still stubs). Scroll down a few pixels — nav should switch to paper background. Click Donate — nothing visible should happen (GiveModal is still a stub returning `null`), but no error banner.

- [ ] **Step 3:** Commit:

```bash
git add app.jsx && git commit -m "feat: rewrite app.jsx for Homepage2 (Nav scroll state + payment toast)"
```

---

## Task 3: Implement Hero

**Files:**
- Modify: `components.jsx` — replace the `function Hero({ openGive }) { ... }` stub.

- [ ] **Step 1:** Find the Hero stub and replace it with:

```jsx
function Hero({ openGive }) {
  return (
    <section className="hero" id="hero">
      <div className="hero-photo">
        <img src="assets/images/jaylin.jpg" alt="Jaylin Cecelia Nomdo" />
        <div className="hero-photo-grade" />
      </div>
      <div className="hero-inner">
        <div className="container">
          <div className="hero-copy">
            <span className="kicker">Person to person · giving, with proof</span>
            <h1 className="h1">
              Dignified giving. <span className="accent">Real impact.</span>
            </h1>
            <p className="hero-sub">
              Scan a code. Support someone directly. Help restore dignity through essentials that matter.
            </p>
            <div className="hero-actions">
              <button className="btn btn-green btn-lg" onClick={() => openGive()}>
                <Icon.HeartFilled /> Give now <Icon.ArrowRight />
              </button>
              <a className="btn btn-ghost-light btn-lg" href="#story">
                Read Jaylin's story
              </a>
            </div>
            <div className="hero-meta">
              <span>47 supporters</span>
              <span className="dot-sep" />
              <span>R12,800 raised</span>
              <span className="dot-sep" />
              <span>of R40,000 goal</span>
            </div>
            <div className="hero-bar">
              <div className="hero-bar-fill" style={{ width: "32%" }} />
            </div>
          </div>
        </div>
      </div>
      <a className="hero-scroll" href="#story" aria-label="Scroll to story">
        <span />
      </a>
    </section>
  );
}
```

- [ ] **Step 2:** Universal verification. The hero should now show the photo, gradient overlay, headline ("Dignified giving. *Real impact.*" with the second phrase italic green), sub, two buttons, meta line, 32% green progress bar, and a small scroll-hint pill at the bottom centre. Clicking "Give now" still does nothing visible (modal is a stub).

- [ ] **Step 3:** Commit: `git add components.jsx && git commit -m "feat: Hero with photo, meta line, progress bar"`

---

## Task 4: Implement Story

**Files:**
- Modify: `components.jsx` — replace the `function Story() { ... }` stub.

- [ ] **Step 1:** Replace the Story stub with:

```jsx
function Story() {
  return (
    <section className="section tint" id="story">
      <div className="container">
        <div className="story-grid">
          <div className="story-text">
            <span className="micro">Real people. Real possibilities.</span>
            <h2 className="h2">Help someone transform their life.</h2>
            <p className="lede">
              Jaylin is just one of the many kids from the Nectar Road informal settlement community, whose homes were destroyed by the recent storm. Your support helps them rebuild — and restores dignity along the way.
            </p>
            <p className="lede">
              Small acts. Big change. Every gift goes directly to the essentials a recipient needs this week — not a generic fund, not a wishlist.
            </p>
            <a href="#how" className="smallact">
              See how it works <Icon.ArrowRight size={14} />
            </a>
          </div>
          <div className="story-card-wrap">
            <div className="recipient-card" role="group" aria-label="Verified recipient">
              <div className="rc-head">
                <span className="rc-badge"><Icon.Check size={11} stroke="#0A2240" /></span>
                Verified Support Recipient
                <span className="rc-id">GSGD-JAYLIN-001</span>
              </div>
              <div className="rc-body">
                <div className="rc-meta">
                  <h3 className="rc-name">Jaylin Cecelia Nomdo</h3>
                  <div className="rc-loc">Nectar Road · Cape Town</div>
                  <div className="rc-needs">
                    <span>This week</span>
                    Groceries · school transport · jersey
                  </div>
                </div>
                <QR />
              </div>
              <div className="rc-foot">
                <span>ID 4502</span>
                <span className="rc-brand">Give smart. Give direct.</span>
              </div>
            </div>
            <p className="card-caption">
              Tap the QR or scan from a printed card.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2:** Universal verification. Story section should render below the hero on a paper-2 tinted background. Left column has the eyebrow, h2, two ledes, and a "See how it works" link. Right column shows the recipient card slightly rotated; hovering straightens it. The card has the navy header strip with ID, name + location + "This week" needs line + QR, and the footer strip.

- [ ] **Step 3:** Commit: `git add components.jsx && git commit -m "feat: Story section with inline recipient card"`

---

## Task 5: Implement HowItWorks

**Files:**
- Modify: `components.jsx` — replace the `function HowItWorks() { ... }` stub.

- [ ] **Step 1:** Replace the HowItWorks stub with:

```jsx
function HowItWorks() {
  const steps = [
    { n: "01", t: "Scan",    d: "Scan the QR code on the card." },
    { n: "02", t: "Donate",  d: "Choose an amount and donate securely." },
    { n: "03", t: "Support", d: "Your gift funds essentials for them." },
    { n: "04", t: "Redeem",  d: "They shop for what they truly need." },
  ];
  return (
    <section className="section" id="how">
      <div className="container">
        <div className="how-head">
          <span className="micro">How it works</span>
          <h2 className="h2">A trusted handshake, made simple.</h2>
        </div>
        <div className="how-grid">
          {steps.map(s => (
            <div className="step" key={s.n}>
              <span className="step-n">{s.n}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2:** Universal verification. Section renders on paper background with four border-top cards in a row at desktop, 2×2 at tablet, 1-col at mobile. Each step shows a green mono "01"–"04" label, a serif title, and a one-line description.

- [ ] **Step 3:** Commit: `git add components.jsx && git commit -m "feat: HowItWorks 4-step section"`

---

## Task 6: Implement GiveSection + DonationCard

**Files:**
- Modify: `components.jsx` — replace both stubs (`GiveSection` and `DonationCard`).

- [ ] **Step 1:** Replace the `DonationCard` stub with the full controlled component:

```jsx
function DonationCard({ openGive }) {
  const presets = [10, 20, 50];
  const [mode, setMode] = React.useState("monthly");
  const [amount, setAmount] = React.useState(50);
  const [custom, setCustom] = React.useState("");
  const effective = custom ? Number(custom) : amount;

  return (
    <div className="donation-card">
      <div className="don-head">
        <span className="don-eyebrow">Your gift</span>
      </div>
      <div className="seg" role="tablist">
        <button className={mode === "once" ? "active" : ""} onClick={() => setMode("once")}>Give once</button>
        <button className={mode === "monthly" ? "active" : ""} onClick={() => setMode("monthly")}>Monthly</button>
      </div>
      <div className="amounts" style={{ marginTop: 12 }}>
        {presets.map(p => (
          <button
            key={p}
            className={"amount " + (!custom && amount === p ? "active" : "")}
            onClick={() => { setAmount(p); setCustom(""); }}
          >R{p}</button>
        ))}
        <button
          className={"amount " + (custom ? "active" : "")}
          onClick={() => { setCustom(amount + ""); }}
        >Other</button>
      </div>
      <div className="custom-amount" style={{ marginTop: 8 }}>
        <span>R</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Other amount"
          value={custom}
          onChange={e => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
        />
      </div>
      <button
        className="give-btn"
        onClick={() => openGive({ amount: effective || 0, mode })}
      >
        <Icon.Lock /> Continue to payment <Icon.ArrowRight />
      </button>
      <div className="secure-row">
        <span className="b"><Icon.Lock size={12} /> Secure checkout</span>
        <span className="dvd">·</span>
        <span className="b"><Icon.Shield size={12} /> 100% to recipients</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** Replace the `GiveSection` stub with:

```jsx
function GiveSection({ openGive }) {
  const benefits = [
    "100% goes to essentials",
    "Verified recipient",
    "Section 18A tax receipt",
    "Cancel anytime",
  ];
  return (
    <section className="section give-section" id="give">
      <div className="container">
        <div className="give-grid">
          <div>
            <span className="micro">Make it count</span>
            <h2 className="h2" style={{ marginTop: 18 }}>Give to Jaylin.</h2>
            <p className="lede" style={{ marginTop: 22 }}>
              Your gift goes directly to the essentials Jaylin and the Nectar Road community need this week. Verified, transparent, and 100% theirs.
            </p>
            <ul className="give-list">
              {benefits.map(b => (
                <li key={b}><Icon.Check size={16} /> {b}</li>
              ))}
            </ul>
          </div>
          <DonationCard openGive={openGive} />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3:** Universal verification. Dark navy section renders below How it works. Left column has the green dash eyebrow, a Fraunces h2, a lede, and 4 green-check bullets. Right column has the white donation card with monthly preselected, R50 highlighted, four amount buttons + Other + custom input + green Continue button + secure row. Clicking R10/R20/R50 toggles the active state. Clicking Continue should open the GiveModal stub (still renders null) — no error banner.

- [ ] **Step 4:** Commit: `git add components.jsx && git commit -m "feat: GiveSection with donation card and benefits list"`

---

## Task 7: Implement Impact

**Files:**
- Modify: `components.jsx` — replace the `function Impact() { ... }` stub.

- [ ] **Step 1:** Replace the Impact stub with:

```jsx
function Impact() {
  const pillars = [
    { ic: <Icon.Users size={32} />,  t: "100% to essentials",     d: "Every rand goes to the essentials a recipient needs this week." },
    { ic: <Icon.Shield size={32} />, t: "Verified recipients",     d: "Every recipient is verified through a community partner." },
    { ic: <Icon.Heart size={32} />,  t: "Dignity, by design",      d: "Recipients choose what they need. We don't choose for them." },
    { ic: <Icon.Chart size={32} />,  t: "Trackable impact",        d: "Follow your gift from card to checkout to receipt." },
  ];
  return (
    <section className="section dark" id="impact">
      <div className="container">
        <div className="impact-head">
          <span className="micro">Together, we create impact</span>
          <h2 className="h2">Real change, transparent and trackable.</h2>
        </div>
        <div className="impact-grid">
          {pillars.map(p => (
            <div className="pillar" key={p.t}>
              <div className="pillar-ic">{p.ic}</div>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2:** Universal verification. Dark navy section with four green-icon pillars in a row at desktop, 2×2 at tablet, 1-col at mobile. Each pillar has a thin top border, a 32-px green icon, a serif white h3, and a muted-white description.

- [ ] **Step 3:** Commit: `git add components.jsx && git commit -m "feat: Impact section with 4 pillars"`

---

## Task 8: Implement CTABand

**Files:**
- Modify: `components.jsx` — replace the `function CTABand({ openGive }) { ... }` stub.

- [ ] **Step 1:** Replace the CTABand stub with:

```jsx
function CTABand({ openGive }) {
  return (
    <section className="cta-band">
      <div className="container">
        <div className="cta-inner">
          <div>
            <h2>Be part of the next R40,000.</h2>
            <p>
              Jaylin and the Nectar Road kids are rebuilding. Help them get there.
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="btn btn-green btn-lg" onClick={() => openGive()}>
              <Icon.HeartFilled /> Give now
            </button>
            <a className="btn btn-ghost btn-lg" href="mailto:hello@givesmartgivedirect.co.za">
              Apply as recipient
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2:** Universal verification. Paper-background banner between Impact and Footer with the headline + paragraph on the left and two buttons on the right; stacks vertically below 760px.

- [ ] **Step 3:** Commit: `git add components.jsx && git commit -m "feat: CTABand"`

---

## Task 9: Implement Footer

**Files:**
- Modify: `components.jsx` — replace the `function Footer() { ... }` stub.

- [ ] **Step 1:** Replace the Footer stub with:

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
            <h4>Trust</h4>
            <a href="#how">Verification</a>
            <a href="#impact">Our impact</a>
          </div>
          <div className="foot-col">
            <h4>Contact</h4>
            <a href="mailto:hello@givesmartgivedirect.co.za">hello@givesmartgivedirect.co.za</a>
            <a href="mailto:hello@givesmartgivedirect.co.za?subject=Apply%20as%20recipient">Apply as recipient</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Give Smart. Give Direct.</span>
          <span>givesmartgivedirect.co.za · Section 18A receipts available</span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2:** Universal verification. Navy footer with brand column + 3 link columns at desktop, 2×2 at 760px, 1-col below 480px. Bottom strip has copyright on the left and domain + receipts line on the right.

- [ ] **Step 3:** Commit: `git add components.jsx && git commit -m "feat: Footer with 4-col grid"`

---

## Task 10: Implement GiveModal

**Files:**
- Modify: `components.jsx` — replace the `function GiveModal({ details, onClose }) { ... }` stub.

- [ ] **Step 1:** Replace the GiveModal stub with:

```jsx
function GiveModal({ details, onClose }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  if (!details) return null;

  const handlePay = async () => {
    setLoading(true);
    try {
      const url = await buildOzowUrl({ amount: details.amount || 50, mode: details.mode });
      window.location.href = url;
    } catch (e) {
      alert("Could not start payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-back"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <button className="x" onClick={onClose} aria-label="Close">
          <Icon.Close size={16} />
        </button>
        <h3>Confirm your gift</h3>
        <p>You're giving to Jaylin and the Nectar Road community.</p>
        <div className="summary">
          <span className="lbl">{details.mode === "monthly" ? "Monthly gift" : "One-time gift"}</span>
          <span className="amt">
            R{Number(details.amount || 0).toLocaleString()}
            {details.mode === "monthly" ? " /mo" : ""}
          </span>
        </div>
        <div className="field">
          <label>Your name</label>
          <input
            placeholder="So Jaylin can thank you"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Email for receipt</label>
          <input
            placeholder="you@email.co.za"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <button className="give-btn" onClick={handlePay} disabled={loading}>
          {loading ? "Redirecting…" : <><Icon.Lock /> Continue to payment <Icon.ArrowRight /></>}
        </button>
        <p className="modal-fine">
          Sandbox mode · placeholder credentials. No real card charged.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2:** Universal verification.
  - Click Donate in the nav → modal opens with "Monthly gift" / "R50 /mo".
  - Type a name + email.
  - Click Continue → page redirects to a `https://pay.ozow.com/?…&HashCheck=…` URL with `SiteCode=YOUR_OZOW_SITE_CODE`, `Amount=50.00`, etc. (Ozow will show a sandbox error — that's expected.)
  - Hit browser back to return; modal state should be gone.
  - Visit `http://localhost:3333/Homepage.html?payment=success` → green-ish toast appears at bottom centre with the success message; X dismisses it.

- [ ] **Step 3:** Commit: `git add components.jsx && git commit -m "feat: GiveModal wired to Ozow redirect"`

---

## Task 11: Final verification pass

**Files:** none modified — read-only verification.

- [ ] **Step 1:** Run the curly-quote scan over all JSX in one go. Must return nothing:

```bash
cd "/Users/ez/Documents/My_apps/Give Smart"
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' app.jsx components.jsx icons.jsx
```

- [ ] **Step 2:** Confirm there's no dead code:

```bash
test ! -f tweaks-panel.jsx && echo "OK: tweaks-panel.jsx is gone"
test ! -f Homepage2.html && echo "OK: Homepage2.html is gone"
grep -n "LiveFeed\|Gratitude\|Recipients\b\|useTweaks\|TWEAK_DEFAULTS" components.jsx app.jsx || echo "OK: no stale references"
```

If `grep` returns matches in JSX files, remove them. (Homepage.html may still reference `window.__TWEAK_DEFAULTS`; that's fine — leave it as a no-op global. Or strip it; see Step 3.)

- [ ] **Step 3 (optional cleanup):** Remove the no-longer-used `__TWEAK_DEFAULTS` block from `Homepage.html` if present (it was a Homepage1 artifact carried into Homepage2). Search for `__TWEAK_DEFAULTS` in `Homepage.html`; if found, delete the surrounding `window.__TWEAK_DEFAULTS = {...}` assignment (keep `window.GATEWAY_CONFIG`).

- [ ] **Step 4:** Walk the rendered page top to bottom at desktop width, then narrow the window to ~375px:

  - Nav transitions from transparent (over photo) to paper background after scrolling 12px+.
  - Hero photo + gradient + headline + sub + two buttons + meta + 32% bar + scroll hint.
  - Story has the rotated recipient card on the right.
  - 4-step How it works.
  - Dark navy Give section with donation card on the right.
  - Dark navy Impact pillars.
  - Paper CTA band.
  - Navy footer with 4 columns.
  - Modal opens from Nav Donate, Hero Give now, Donation Card Continue, CTA Band Give now.
  - At 375px the page is single-column throughout with no horizontal scroll.

- [ ] **Step 5:** Commit any optional cleanup from Step 3:

```bash
git add -A && git commit -m "chore: final cleanup after Homepage2 redesign" || echo "nothing to commit"
```

---

## Out of scope (follow-ups)

- Move `buildOzowUrl` server-side and use real Ozow credentials before going live.
- Real recipient ID + needs feed (currently hardcoded to Jaylin).
- Real `hero-meta` numbers from a backend (currently hardcoded 47 / R12,800 / R40,000).
- Remove the `#__err` overlay and `try/catch` around `ReactDOM.createRoot` once stable.
- Replace Babel-standalone with a build step (Vite) — drops ~600KB of CDN JS.
