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
