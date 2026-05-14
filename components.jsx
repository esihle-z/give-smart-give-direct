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

Object.assign(window, {
  Hero, Story, HowItWorks, GiveSection, Impact, CTABand, Footer,
  DonationCard, GiveModal, QR
});
