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
