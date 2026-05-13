// Minimal icon set used across the page. Stroke icons in the brand style: 1.75px, rounded.
const Icon = {
  Heart: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 20s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 21 10c0 5.65-7 10-7 10z" fill={p.fill || "none"} />
    </svg>
  ),
  HeartFilled: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="currentColor" {...p}>
      <path d="M12 20s-7-4.35-7-10a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 21 10c0 5.65-7 10-7 10z"/>
    </svg>
  ),
  Shield: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M12 3l8 3v6c0 4.5-3.5 8.4-8 9-4.5-.6-8-4.5-8-9V6l8-3z"/>
      <path d="M9 12l2 2 4-4"/>
    </svg>
  ),
  Cart: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="20" r="1.4"/>
      <circle cx="18" cy="20" r="1.4"/>
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6"/>
    </svg>
  ),
  Phone: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/>
      <path d="M11 19h2"/>
      <rect x="9" y="6" width="6" height="6" rx="1"/>
      <path d="M10 8h1M13 8h1M10 10h4"/>
    </svg>
  ),
  Bag: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 8h14l-1 12.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 20.5L5 8z"/>
      <path d="M9 11V7a3 3 0 0 1 6 0v4"/>
    </svg>
  ),
  Users: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <circle cx="9" cy="9" r="3.2"/>
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0"/>
      <circle cx="17" cy="8" r="2.6"/>
      <path d="M16 20a5 5 0 0 1 5.5-4.9"/>
    </svg>
  ),
  Hands: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 14c0-3 2-4 4-3 0-3 2-4 4-3 0-3 2-4 4-3 2 1 4 4 4 7 0 4-3 8-8 8H8a4 4 0 0 1-4-4v-2z"/>
      <path d="M12 8v6"/>
    </svg>
  ),
  Chart: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M3 20h18"/>
      <path d="M6 17V11"/>
      <path d="M11 17V7"/>
      <path d="M16 17v-4"/>
      <path d="M21 9l-3 3-4-4-5 5"/>
      <path d="M21 9h-3"/>
      <path d="M21 9v3"/>
    </svg>
  ),
  Lock: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 14} height={p.size || 14} fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/>
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M4 12l5 5L20 6"/>
    </svg>
  ),
  ArrowRight: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" {...p}>
      <path d="M5 12h14"/>
      <path d="M13 6l6 6-6 6"/>
    </svg>
  ),
  Menu: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 22} height={p.size || 22} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M4 7h16M4 12h16M4 17h16"/>
    </svg>
  ),
  Close: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}>
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  Sparkle: (p) => (
    <svg viewBox="0 0 24 24" width={p.size || 18} height={p.size || 18} fill="currentColor" {...p}>
      <path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z"/>
    </svg>
  ),
};

// The Give Smart logo: hands cradling a heart that contains a QR pattern.
function BrandLogo({ size = 40, navy = "#0A2240", green = "#6DBE3F" }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-label="Give Smart, Give Direct logo">
      {/* Hands cradling */}
      <path d="M10 36c0-4 4-6 7-4 0-4 4-6 7-4M54 36c0-4-4-6-7-4 0-4-4-6-7-4"
        fill="none" stroke={navy} strokeWidth="3" strokeLinecap="round" />
      <path d="M8 36c0 8 10 14 24 14s24-6 24-14"
        fill="none" stroke={navy} strokeWidth="3" strokeLinecap="round" />
      {/* Heart outline */}
      <path d="M32 50s-18-10-18-22a9 9 0 0 1 18-5 9 9 0 0 1 18 5c0 12-18 22-18 22z"
        fill="none" stroke={green} strokeWidth="3" strokeLinejoin="round" />
      {/* QR inside heart */}
      <g transform="translate(20 18)" fill={navy}>
        {/* corner finder TL */}
        <rect x="0" y="0" width="6" height="6" rx="1" />
        <rect x="2" y="2" width="2" height="2" fill={green} />
        {/* corner TR */}
        <rect x="18" y="0" width="6" height="6" rx="1" />
        <rect x="20" y="2" width="2" height="2" fill={green} />
        {/* corner BL */}
        <rect x="0" y="18" width="6" height="6" rx="1" />
        <rect x="2" y="20" width="2" height="2" fill={green} />
        {/* speckles */}
        <rect x="9" y="2" width="2" height="2" />
        <rect x="13" y="3" width="2" height="2" />
        <rect x="3" y="9" width="2" height="2" />
        <rect x="7" y="9" width="2" height="2" />
        <rect x="11" y="9" width="2" height="2" />
        <rect x="15" y="9" width="2" height="2" />
        <rect x="19" y="9" width="2" height="2" />
        <rect x="9" y="12" width="2" height="2" />
        <rect x="13" y="13" width="2" height="2" />
        <rect x="9" y="18" width="2" height="2" />
        <rect x="13" y="19" width="2" height="2" />
        <rect x="18" y="13" width="2" height="2" />
      </g>
    </svg>
  );
}

window.Icon = Icon;
window.BrandLogo = BrandLogo;
