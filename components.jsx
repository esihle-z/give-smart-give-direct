// Silhouettes used as tasteful placeholders for portrait photography.
// Drawn in a flat, dignified style — meant to be replaced with real imagery.
function PortraitSilhouette({ tone = "#6DBE3F" }) {
  return (
    <svg viewBox="0 0 200 240" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="sil-g" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.35" />
          <stop offset="60%" stopColor={tone} stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0C1E18" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* shoulders */}
      <path d="M0 240 C 20 200, 60 180, 100 180 C 140 180, 180 200, 200 240 Z" fill="url(#sil-g)" />
      {/* neck */}
      <rect x="86" y="148" width="28" height="40" rx="14" fill="url(#sil-g)" />
      {/* head */}
      <ellipse cx="100" cy="120" rx="44" ry="50" fill="url(#sil-g)" />
      {/* head wrap subtle highlight */}
      <path d="M58 110 Q 100 60 142 110 Q 130 80 100 76 Q 70 80 58 110 Z" fill={tone} fillOpacity="0.25" />
    </svg>
  );
}

function StoryPortrait() {
  return (
    <svg viewBox="0 0 220 260" preserveAspectRatio="xMidYMax meet">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6DBE3F" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#84CC55" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0A1E2F" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      {/* child shoulders */}
      <path d="M0 260 C 30 220, 80 200, 110 200 C 140 200, 190 220, 220 260 Z" fill="url(#sg)" />
      {/* head smaller, slightly tilted */}
      <ellipse cx="108" cy="140" rx="40" ry="46" fill="url(#sg)" transform="rotate(-4 108 140)" />
      {/* neck */}
      <rect x="96" y="170" width="24" height="32" rx="12" fill="url(#sg)" />
      {/* hair top */}
      <path d="M68 130 Q 108 80 148 130 Q 138 100 108 96 Q 80 100 68 130 Z" fill="#6DBE3F" fillOpacity="0.18" />
    </svg>
  );
}

// QR code — visually convincing pattern, not a real code.
function QR() {
  // 13x13 grid; 0 = off, 1 = navy
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
  ].map(row => row.replace(/\s/g, ""));
  const cells = [];
  for (let r = 0; r < 13; r++) {
    for (let c = 0; c < 13; c++) {
      const on = pattern[r] && pattern[r][c] === "1";
      cells.push(<div key={r+"-"+c} className={"cell " + (on ? "" : "off")} />);
    }
  }
  return <div className="qr" aria-label="QR code">{cells}</div>;
}

// Donation widget — controlled component
function DonationWidget({ accent, set = "standard", onGive }) {
  const presets = [10, 20, 50];

  const [mode, setMode] = React.useState("monthly"); // once | monthly
  const [amount, setAmount] = React.useState(presets[2]);
  const [custom, setCustom] = React.useState("");

  React.useEffect(() => { setAmount(presets[2]); setCustom(""); }, [set]);

  const effectiveAmount = custom ? Number(custom) : amount;

  return (
    <div className="donation-card">
      <div className="seg" role="tablist">
        <button className={mode === "once" ? "active" : ""} onClick={() => setMode("once")}>Give once</button>
        <button className={mode === "monthly" ? "active" : ""} onClick={() => setMode("monthly")}>
          Monthly · save lives
        </button>
      </div>
      <div className="amounts">
        {presets.map(p => (
          <button
            key={p}
            className={"amount " + (!custom && amount === p ? "active" : "")}
            onClick={() => { setAmount(p); setCustom(""); }}
          >
            R{p}
          </button>
        ))}
      </div>
      <div className="custom-amount">
        <span>R</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Other amount"
          value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, ""))}
        />
      </div>
      <button className="give-btn" onClick={() => onGive({ amount: effectiveAmount || 0, mode })}>
        <Icon.HeartFilled />
        Give R{(effectiveAmount || 0).toLocaleString()} {mode === "monthly" ? "/ month" : "today"}
        <Icon.ArrowRight />
      </button>
      <div className="secure-row">
        <span className="b"><Icon.Lock /> Secure checkout</span>
        <span className="b"><Icon.Shield size={14} /> 100% to recipients</span>
      </div>
    </div>
  );
}

// Live giving feed — scrolls horizontally, infinite
function LiveFeed() {
  const items = [
    { who: "Thandi K.", verb: "gave", amt: "R 150", to: "Nomsa M.", what: "for groceries", ago: "2m ago" },
    { who: "James W.",  verb: "gave", amt: "R 500", to: "Bongani K.", what: "for school transport", ago: "6m ago" },
    { who: "Anonymous", verb: "gave", amt: "R 80",  to: "Aisha R.", what: "for airtime", ago: "11m ago" },
    { who: "Lerato D.", verb: "gave", amt: "R 300", to: "Mama Joyce", what: "for a week of food", ago: "18m ago" },
    { who: "Pieter S.", verb: "gave", amt: "R 250", to: "Sipho N.", what: "for clinic transport", ago: "24m ago" },
    { who: "Naledi M.", verb: "set up monthly", amt: "R 100", to: "Ayanda L.", what: "for school shoes", ago: "31m ago" },
    { who: "David O.",  verb: "gave", amt: "R 1,000", to: "The Tshabalala family", what: "for groceries", ago: "44m ago" },
    { who: "Anonymous", verb: "gave", amt: "R 50",  to: "Nomsa M.", what: "for airtime", ago: "1h ago" },
  ];
  const row = [...items, ...items]; // duplicate for seamless loop
  return (
    <div className="live-strip" aria-label="Live giving feed">
      <div className="live-strip-inner">
        <span className="live-label"><span className="pulse" /> Live · giving now</span>
        <div className="live-track">
          <div className="live-row">
            {row.map((it, i) => (
              <span className="live-item" key={i}>
                <Icon.HeartFilled size={14} className="heart" style={{ color: "var(--accent)" }} />
                <span className="who">{it.who}</span>
                <span>{it.verb}</span>
                <span className="amt">{it.amt}</span>
                <span>to</span>
                <span className="who">{it.to}</span>
                <span>{it.what}</span>
                <span className="ago">· {it.ago}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Decorative mini QR
function MiniQR({ seed = 0 }) {
  // Deterministic pseudo-pattern per seed, 7x7
  const cells = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      const corner = (r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2);
      const on = corner || (((r * 7 + c) * 13 + seed * 7) % 5 < 2);
      cells.push(<div key={r+'-'+c} className={"c " + (on ? "" : "off")} />);
    }
  }
  return <div className="qr-tag" aria-hidden="true">{cells}</div>;
}

// Recipients gallery
function Recipients({ openGive }) {
  const people = [
    {
      name: "Nomsa M.", where: "Khayelitsha · Cape Town",
      need: "A week of groceries for three children — R600 left to fund this week.",
      raised: 1820, goal: 2400, tone: "#84CC55",
    },
    {
      name: "Bongani K.", where: "Soweto · Johannesburg",
      need: "School transport for a 7-year-old — funded for this term.",
      raised: 980, goal: 1200, tone: "#6DBE3F",
    },
    {
      name: "Aisha R.", where: "Mitchells Plain · Cape Town",
      need: "Airtime + data so she can keep her remote job.",
      raised: 220, goal: 400, tone: "#A8D87A",
    },
    {
      name: "Mama Joyce", where: "Mamelodi · Pretoria",
      need: "Meals for her grandchildren while she recovers from surgery.",
      raised: 3450, goal: 4000, tone: "#5BA82F",
    },
  ];
  return (
    <section className="section" id="recipients">
      <div className="container">
        <div className="recip-head">
          <div>
            <span className="micro">Verified recipients</span>
            <h2 className="h2">Real people. Real needs. Pick one.</h2>
          </div>
          <p className="lede">
            Every person here is identity-verified by a community partner and tells us, in
            their own words, what they need this week. Your gift buys exactly that.
          </p>
        </div>
        <div className="recip-grid">
          {people.map((p, i) => {
            const pct = Math.min(100, Math.round((p.raised / p.goal) * 100));
            return (
              <article className="recip-card" key={p.name}>
                <div className="recip-photo">
                  <span className="tag"><span className="ck"><Icon.Check size={9} /></span> Verified</span>
                  <div className="silh"><PortraitSilhouette tone={p.tone} /></div>
                  <MiniQR seed={i+1} />
                </div>
                <div className="recip-body">
                  <h3 className="name">{p.name}</h3>
                  <div className="meta">{p.where}</div>
                  <p className="need">{p.need}</p>
                  <div className="recip-progress">
                    <div className="bar"><div className="fill" style={{ width: pct + "%" }} /></div>
                    <div className="nums">
                      <span><b>R{p.raised.toLocaleString()}</b> raised</span>
                      <span>of R{p.goal.toLocaleString()}</span>
                    </div>
                  </div>
                  <button className="recip-give" onClick={() => openGive({ amount: 100, mode: "once" })}>
                    <Icon.HeartFilled size={14} /> Give to {p.name.split(" ")[0]}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Gratitude wall
function Gratitude() {
  const notes = [
    {
      q: "I bought groceries this Saturday with my children. They didn't ask why — just smiled. Thank you, friend I haven't met.",
      who: "Nomsa M.", where: "Khayelitsha", initials: "NM", tag: "Groceries",
    },
    {
      q: "My son got to school every day this month. The taxi driver knows him by name now. We are so grateful.",
      who: "Lindiwe T.", where: "Soweto", initials: "LT", tag: "Transport",
    },
    {
      q: "I could call my daughter at university for the first time in weeks. Such a small thing, but it kept me whole.",
      who: "Mama Joyce", where: "Mamelodi", initials: "MJ", tag: "Airtime",
    },
  ];
  return (
    <section className="section tint">
      <div className="container">
        <div className="grat-head">
          <span className="micro">Notes from recipients</span>
          <h2 className="h2">Dignity, in their words.</h2>
          <p className="lede" style={{ margin: "18px auto 0", textAlign: "left" }}>
            After every gift, recipients can send a short, optional message to whoever helped.
            No pressure. No performance. Just the human bit.
          </p>
        </div>
        <div className="grat-grid">
          {notes.map((n, i) => (
            <article className="grat-card" key={i}>
              <span className="ribbon">{n.tag}</span>
              <p className="q">"{n.q}"</p>
              <div className="from">
                <div className="av">{n.initials}</div>
                <div>
                  <div className="who">{n.who}</div>
                  <div className="where">{n.where}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

window.LiveFeed = LiveFeed;
window.Recipients = Recipients;
window.Gratitude = Gratitude;
window.MiniQR = MiniQR;

// Hero
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

// Story section
function Story() {
  return (
    <section className=”section tint” id=”story”>
      <div className=”container”>
        <div className=”story-grid”>
          <div>
            <span className=”micro”>Real people. Real possibilities.</span>
            <h2 className=”h2”>Help someone transform their life.</h2>
            <p className=”lede”>
              Jaylin is just one of the many kids from Nectar Road informal settlement
              community, whose homes were destroyed by the recent storm. Your support
              helps them rebuild their homes and restore dignity.
            </p>
            <p className=”smallact” style={{color:”var(--accent-strong)”,fontWeight:700,marginTop:20}}>
              Small acts. Big change.
            </p>
            <a href=”#how” className=”btn btn-primary btn-lg” style={{marginTop:24,display:”inline-flex”,gap:10}}>
              See how it works <Icon.ArrowRight />
            </a>
          </div>
          <div className=”story-photo”>
            <img src=”assets/images/jaylin.jpg” alt=”Jaylin Cecelia Nomdo” />
            <div className=”story-quote-pill”>
              <span style={{color:”var(--accent)”,fontWeight:800,fontSize:28,lineHeight:.6,marginTop:6}}>”</span>
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

// How it works
function HowItWorks() {
  const steps = [
    { ic: <Icon.Users />, n: 1, t: "Scan",    d: "Scan the QR code on the card." },
    { ic: <Icon.Heart />, n: 2, t: "Donate",  d: "Choose an amount and donate securely." },
    { ic: <Icon.Bag />,   n: 3, t: "Support", d: "Your donation funds essentials for them." },
    { ic: <Icon.Shield />,n: 4, t: "Redeem",  d: "They shop for what they truly need." },
  ];
  return (
    <section className="section" id="how">
      <div className="container">
        <div className="how-head">
          <span className="micro">How it works</span>
          <h2 className="h2">Direct giving, in four steps.</h2>
        </div>
        <div className="how-grid">
          {steps.map(s => (
            <article className="step" key={s.n}>
              <span className="num">{s.n}</span>
              <div className="ic">{s.ic}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// Animated counter
function Counter({ to, prefix = "", suffix = "" }) {
  const [n, setN] = React.useState(0);
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const start = performance.now();
        const dur = 1400;
        const step = (t) => {
          const k = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - k, 3);
          setN(Math.floor(to * eased));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

function Impact() {
  const pillars = [
    { ic: <Icon.Users />,  n: "100%",      l: "of donations go to essentials" },
    { ic: <Icon.Shield />, n: "Verified",  l: "recipients through trusted partners" },
    { ic: <Icon.Heart />,  n: "Dignity",   l: "preserved through choice, not charity" },
    { ic: <Icon.Chart />,  n: "Real Impact", l: "transparent, trackable and accountable" },
  ];
  return (
    <section className="section dark" id="impact">
      <div className="container">
        <span className="micro" style={{color:"var(--accent)"}}>Together, we create impact</span>
        <div className="impact-grid">
          {pillars.map(p => (
            <div className="impact-item" key={p.n}>
              <div className="impact-ic">{p.ic}</div>
              <div className="n" style={p.n.length > 4 ? {fontSize:28} : {}}>{p.n}</div>
              <div className="l">{p.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTABand({ open }) {
  return (
    <section className="cta-band">
      <div className="container">
        <div className="cta-inner">
          <div>
            <h2>Generosity, with proof.</h2>
            <p>Set up a monthly gift to a verified recipient and watch every Rand land. Cancel any time — no platform fees, ever.</p>
          </div>
          <div>
            <button className="btn btn-primary btn-lg" onClick={open}>
              <Icon.HeartFilled /> Start giving directly <Icon.ArrowRight />
            </button>
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
          <div>
            <div className="brand" style={{ marginBottom: 14 }}>
              <BrandLogo size={40} green="#6DBE3F" navy="#FFFFFF" />
              <div className="brand-text">
                <span className="t1" style={{ color: "#FFFFFF" }}>Give Smart.</span>
                <span className="t2" style={{ color: "#6DBE3F" }}>Give Direct.</span>
              </div>
            </div>
            <p style={{ fontSize: 14, maxWidth: 320, lineHeight: 1.55, margin: 0, color: "rgba(255,255,255,.6)" }}>
              A direct-giving platform connecting people who want to help with people who need it — verified, transparent, on-chain.
            </p>
          </div>
          <div>
            <h4>Give</h4>
            <a href="#">Browse recipients</a>
            <a href="#">Monthly giving</a>
            <a href="#">Gift cards</a>
            <a href="#">Corporate</a>
          </div>
          <div>
            <h4>Trust</h4>
            <a href="#">How verification works</a>
            <a href="#">On-chain receipts</a>
            <a href="#">Annual report</a>
            <a href="#">Press</a>
          </div>
          <div>
            <h4>Contact</h4>
            <a href="#">Get in touch</a>
            <a href="#">Apply as recipient</a>
            <a href="#">Help center</a>
            <a href="#">+27 21 000 0000</a>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Give Smart, NPC · Cape Town, South Africa</span>
          <span><span className="hh">PBO 930-xxxx-xx</span> · Section 18A receipts available</span>
        </div>
      </div>
    </footer>
  );
}

// Modal for the give flow
function GiveModal({ details, onClose }) {
  const [step, setStep] = React.useState(1);
  if (!details) return null;

  return (
    <div className="modal-back" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true">
        <button className="x" onClick={onClose}><Icon.Close /></button>
        {step === 1 && (
          <>
            <h3>Confirm your gift</h3>
            <p>You're giving to Nomsa M. and her family.</p>
            <div className="summary">
              <span className="lbl">{details.mode === "monthly" ? "Monthly gift" : "One-time gift"}</span>
              <span className="amt">R{Number(details.amount || 0).toLocaleString()}{details.mode === "monthly" ? " /mo" : ""}</span>
            </div>
            <div className="field"><label>Your name</label><input placeholder="So Nomsa can thank you" defaultValue="" /></div>
            <div className="field"><label>Email for receipt</label><input placeholder="you@email.co.za" /></div>
            <button className="give-btn" onClick={() => setStep(2)}>
              <Icon.Lock /> Continue to payment <Icon.ArrowRight />
            </button>
          </>
        )}
        {step === 2 && (
          <div className="modal-success">
            <div className="ok-ic"><Icon.Check size={36} /></div>
            <h3>Thank you.</h3>
            <p style={{ textAlign: "center" }}>
              Your gift of <strong>R{Number(details.amount || 0).toLocaleString()}{details.mode === "monthly" ? " /month" : ""}</strong> is on its way to Nomsa.
              We'll email a receipt and a check-in within 7 days.
            </p>
            <button className="give-btn" onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  Hero, Story, HowItWorks, Impact, CTABand, Footer, GiveModal, DonationWidget, QR, PortraitSilhouette, StoryPortrait
});
