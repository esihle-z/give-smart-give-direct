# Give Smart. Give Direct. — Pilot Homepage Design

**Date:** 2026-05-12
**Author:** Brainstorming session with Antigravity

---

## Goal

Build and launch the pilot homepage for givesmartgivedirect.co.za — a South African
direct-giving platform connecting donors with verified recipients via physical QR cards.

## Scope (Pilot Only)

Single-page homepage. No backend except a lightweight Ozow payment redirect.
No authentication, no dashboard, no recipient management UI.

---

## Brand

- **Primary font:** Plus Jakarta Sans (800/700/600/500)
- **Accent font:** Caveat (gratitude wall quotes)
- **Mono font:** JetBrains Mono (labels, tags)
- **Navy:** `#0A2240`
- **Green:** `#6DBE3F`
- **Domain:** givesmartgivedirect.co.za

---

## Page Sections

| # | Section | Notes |
|---|---|---|
| 1 | Nav | Logo, Donate CTA, hamburger (mobile) |
| 2 | Hero | Full-bleed Jaylin photo, "Dignified giving. Real impact.", trust icons, donation widget, recipient card |
| 3 | Story | "Help someone transform their life", Jaylin photo, quote overlay |
| 4 | How it works | 4 steps: Scan → Donate → Support → Redeem |
| 5 | Impact | "Together, we create impact" — 4 value pillars |
| 6 | Gratitude wall | 3 thank-you notes from recipients |
| 7 | Footer | Brand, links, PBO number, legal |

---

## Content

### Recipient (Pilot)
- **Name:** Jaylin Cecelia Nomdo
- **Story:** "Jaylin is just one of the many kids from Nectar Road informal settlement
  community, whose homes were destroyed by the recent storm. Your support helps them
  rebuild their homes and restore dignity."
- **Photo:** `assets/images/jaylin.jpg`
- **Quote:** "Thank you for seeing me, not just my situation."

### Donation Amounts
- R10 / R20 / R50 / Other
- Modes: Once / Monthly (default: R50 monthly)

### Trust Icons
- Verified Recipients
- Essentials Only
- Transparent & Trusted

### Impact Pillars
- 100% of donations go to essentials
- Verified recipients through trusted partners
- Dignity preserved through choice, not charity
- Real Impact — transparent, trackable and accountable

### How it Works Steps
1. **Scan** — Scan the QR code on the card
2. **Donate** — Choose an amount and donate securely
3. **Support** — Your donation funds essentials for them
4. **Redeem** — They shop for what they truly need

---

## Payment Architecture

### Gateway: Ozow (pilot)

Ozow is a South African instant-EFT gateway. Flow:
1. Donor selects amount + frequency on page
2. Clicks "Give R50 monthly" → client builds Ozow redirect URL
3. Ozow processes payment
4. Donor returns to success URL

**Security note:** For production, the `HashCheck` must be computed server-side
(private key must never be exposed in client JS). For the pilot sandbox, the hash
is computed client-side using a placeholder key — replace with a Netlify/Vercel
function before going live with real keys.

### Config object (top of file, easy to swap)
```js
const GATEWAY_CONFIG = {
  provider: "ozow",           // swap to "payfast" | "yoco" later
  siteCode: "YOUR_OZOW_SITE_CODE",
  privateKey: "YOUR_OZOW_PRIVATE_KEY",
  isTest: true,               // flip to false for live
  successUrl: "https://givesmartgivedirect.co.za/?payment=success",
  errorUrl:   "https://givesmartgivedirect.co.za/?payment=error",
  cancelUrl:  "https://givesmartgivedirect.co.za/?payment=cancelled",
};
```

### QR Code
Physical card QR links to: `https://givesmartgivedirect.co.za`
Page auto-detects `?ref=JAYLIN_001` param and pre-fills recipient on load.

---

## File Structure

```
Give Smart/
├── Homepage.html          ← rebuilt (single deliverable)
├── assets/
│   └── images/
│       └── jaylin.jpg     ← real recipient photo
├── app.jsx                ← main React app
├── components.jsx         ← all section components
├── icons.jsx              ← icon set (unchanged)
├── tweaks-panel.jsx       ← dev tweaks (unchanged)
└── docs/
    └── plans/
        ├── 2026-05-12-homepage-pilot-design.md  ← this file
        └── 2026-05-12-homepage-pilot.md         ← implementation plan
```
