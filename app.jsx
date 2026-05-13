const { useState, useEffect } = React;

function Nav({ openGive }) {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <div className="brand">
          <BrandLogo size={42} />
          <div className="brand-text">
            <span className="t1">Give Smart.</span>
            <span className="t2">Give Direct.</span>
            <span className="t3">Verified · Transparent · On-chain</span>
          </div>
        </div>
        <nav className="nav-links">
          <a className="active" href="#">Home</a>
          <a href="#recipients">Recipients</a>
          <a href="#how">How it works</a>
          <a href="#">Our story</a>
          <a href="#">Contact</a>
        </nav>
        <div className="nav-cta">
          <button className="btn btn-ghost">Sign in</button>
          <button className="btn btn-green" onClick={openGive}>
            <Icon.HeartFilled size={16} /> Give now
          </button>
        </div>
      </div>
    </header>
  );
}

function App() {
  const { TweaksPanel, useTweaks, TweakSection, TweakColor, TweakRadio, TweakToggle } = window;

  const [tw, setTweak] = useTweaks(window.__TWEAK_DEFAULTS);
  const [giveDetails, setGiveDetails] = useState(null);

  // Apply tweakable accent + navy
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", tw.accent);
    document.documentElement.style.setProperty("--navy-900", tw.navy);
  }, [tw.accent, tw.navy]);

  // Hero variant: change layout slightly
  useEffect(() => {
    document.body.classList.toggle("hero-stacked", tw.heroVariant === "stacked");
  }, [tw.heroVariant]);

  const openGive = (details) => {
    if (details && typeof details === "object" && details.amount != null) {
      setGiveDetails(details);
    } else {
      // From nav: open with default monthly R100
      setGiveDetails({ amount: 100, mode: "monthly" });
    }
  };

  return (
    <>
      <Nav openGive={() => openGive()} />
      <Hero tw={tw} openGive={openGive} />
      <LiveFeed />
      <Recipients openGive={openGive} />
      <Story />
      <HowItWorks />
      <Gratitude />
      <Impact />
      <CTABand open={() => openGive()} />
      <Footer />

      {giveDetails && <GiveModal details={giveDetails} onClose={() => setGiveDetails(null)} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand">
          <TweakColor
            label="Accent (green)"
            value={tw.accent}
            options={["#6DBE3F", "#0E9F6E", "#F2A540", "#D9476A"]}
            onChange={(v) => setTweak("accent", v)}
          />
          <TweakColor
            label="Primary (navy)"
            value={tw.navy}
            options={["#0A2240", "#0C1F36", "#173A52", "#1A2B4A"]}
            onChange={(v) => setTweak("navy", v)}
          />
        </TweakSection>
        <TweakSection label="Donation widget">
          <TweakRadio
            label="Amounts"
            value={tw.amountSet}
            options={[
              { value: "small", label: "Small" },
              { value: "standard", label: "Std" },
              { value: "high", label: "High" },
            ]}
            onChange={(v) => setTweak("amountSet", v)}
          />
          <TweakToggle
            label="Hero trust pills"
            value={tw.showTrust}
            onChange={(v) => setTweak("showTrust", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("app")).render(<App />);
