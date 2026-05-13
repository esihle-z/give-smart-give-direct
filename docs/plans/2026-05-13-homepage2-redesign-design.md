# Give Smart — Homepage2 Redesign

**Date:** 2026-05-13
**Status:** Approved (verbal)
**Replaces:** `docs/plans/2026-05-12-homepage-pilot-design.md`

---

## Goal

Adopt the editorial redesign captured in `Homepage2.html` as the canonical pilot homepage. The visual system shifts from "product launch" to "editorial nonprofit": Fraunces serif headlines, Inter body, JetBrains Mono micro-labels, a fixed nav that transitions over a full-bleed hero photo, and a tighter section list.

The current `app.jsx` + `components.jsx` target the old class names and must be rewritten to match the new CSS.

---

## Scope

**In scope**
- Rename `Homepage2.html` → `Homepage.html` (the old `Homepage.html` is deleted)
- Rewrite `app.jsx` and `components.jsx` for the new class names and section structure
- Delete `tweaks-panel.jsx` (no longer loaded)
- Preserve the Ozow payment integration (sandbox mode) and the `?payment=*` toast
- Preserve the error overlay (`#__err` div + `window.error` listener) for dev visibility

**Out of scope**
- `icons.jsx` — unchanged
- LiveFeed, Recipients gallery, Gratitude wall, tweaks panel — **cut**
- Real Ozow credentials, server-side hash computation, backend, auth, dashboards
- Loader changes — Homepage2.html uses `<script type="text/babel" src="...">` directly. No custom Babel loader.

---

## File structure (after)

```
Homepage.html        ← single self-contained HTML (was Homepage2.html)
app.jsx              ← Nav + App, mounts root
components.jsx       ← Hero, Story, HowItWorks, GiveSection, Impact, CTABand,
                       Footer, GiveModal, DonationWidget, QR, buildOzowUrl
icons.jsx            ← unchanged
docs/plans/…         ← this design + the matching implementation plan
```

---

## Design system (from Homepage2.html — reference only, do not change)

- Fonts: Fraunces (serif headlines), Inter (body), JetBrains Mono (micro/eyebrow)
- Colours: navy `#0A2240`, green accent `#6DBE3F`, paper `#FAF9F5`, paper-2 `#F1F0EA`
- Buttons: `.btn-green` (primary CTA), `.btn-navy` (secondary on light), `.btn-ghost` / `.btn-ghost-light`
- Section variants: `.section` (default), `.section.tint` (paper-2), `.section.dark` (navy)
- Eyebrow pattern: `.micro` (mono caps with leading 24px line) and `.kicker` (mono caps with leading dash)

---

## Sections, top to bottom

### 1. Nav (`<Nav>`)

Fixed top. Two states managed by a scroll listener:
- `.nav.is-top` — transparent background; brand `.t1` and nav-links render white. Active over the hero photo.
- `.nav.is-scrolled` — paper background + blur + bottom border; brand `.t1` reverts to navy. Activated when `window.scrollY > 12`.

Markup:
```
.brand              BrandLogo + .brand-text (.t1 "Give Smart" + .t2 italic "Give Direct.")
.nav-links          a#how "How it works", a#story "Story", a#impact "Impact"   (hidden ≤760px)
button.btn-green    "Donate" → opens GiveModal with default { amount: 50, mode: "monthly" }
```

### 2. Hero (`<Hero>`)

Full-bleed background photo (`assets/images/jaylin.jpg`) with a directional gradient overlay (handled in `Homepage.html` CSS). Hero content sits in a left-aligned column, vertically aligned to the bottom of the viewport.

```
.kicker             "Person to person · giving, with proof"
h1.h1               "Dignified giving."  <span.accent italic>"Real impact."</span>
p.hero-sub          "Scan a code. Support someone directly. Help restore dignity through essentials that matter."
.hero-actions       .btn.btn-green "Give now" (opens modal)
                    .btn.btn-ghost-light "Read Jaylin's story" (href="#story")
.hero-meta          "47 supporters" · dot · "R12,800 raised" · dot · "of R40,000 goal"
.hero-bar           inner .hero-bar-fill width: 32%
.hero-scroll        decorative scroll-down hint
```

### 3. Story (`<Story>`, `.section.tint`, id="story")

Two-column grid. Recipient card lives **inside** the story column (not in the hero anymore).

Left (`.story-text`):
```
.micro              "Real people. Real possibilities."
h2.h2               "Help someone transform their life."
p.lede × 2          paragraph about Jaylin from Nectar Road; second paragraph about the small-acts ethos
a.smallact          "See how it works →" (href="#how")
```

Right (`.story-card-wrap`):
```
.recipient-card     (transforms on hover: rotate(-1.2deg) → rotate(0))
  .rc-head          ✓ badge + "Verified Support Recipient" + .rc-id "GSGD-JAYLIN-001"
  .rc-body          .rc-meta (name "Jaylin Cecelia Nomdo", location "Nectar Road · Cape Town",
                              .rc-needs span "This week" "Groceries · school transport · jersey")
                    QR component (decorative 13×13)
  .rc-foot          left: "ID 4502" / right: ".rc-brand" "Give smart. Give direct."
p.card-caption      italic "Tap the QR or scan from a printed card."
```

### 4. How it works (`<HowItWorks>`, id="how")

```
.how-head           .micro "How it works" / h2 "A trusted handshake, made simple."
.how-grid (4 cols)  for each step (Scan, Donate, Support, Redeem):
                      .step:
                        .step-n "01"–"04" (mono)
                        h3 "Scan" / "Donate" / "Support" / "Redeem"
                        p  one-line description
```

Descriptions:
- Scan — "Scan the QR code on the card."
- Donate — "Choose an amount and donate securely."
- Support — "Your gift funds essentials for them."
- Redeem — "They shop for what they truly need."

### 5. Give section (`<GiveSection>`, `.give-section`, id="give")

Dark navy. Two-column grid.

Left:
```
.micro              "Make it count"
h2                  "Give to Jaylin."
p.lede              short paragraph framing the call
ul.give-list × 4    each li: Icon.Check + label
                      "100% goes to essentials"
                      "Verified recipient"
                      "Section 18A tax receipt"
                      "Cancel anytime"
```

Right: `<DonationCard>` (the rewritten `DonationWidget`):
```
.don-head           .don-eyebrow "Your gift" + small caption "Secure · sandbox mode"
.seg                two buttons: "Give once" / "Monthly"
.amounts            R10 / R20 / R50 / Other        (R50 default, monthly default)
.custom-amount      "R" + numeric input
button.give-btn     "Continue to payment" → opens GiveModal with current state
.secure-row         Lock icon + "Secure checkout" · dvd · Shield icon + "100% to recipients"
```

### 6. Impact pillars (`<Impact>`, `.section.dark`, id="impact")

```
.impact-head        .micro "Together, we create impact" / h2 "Real change, transparent and trackable."
.impact-grid (4)    .pillar:
                      .pillar-ic   icon
                      h3           short statement
                      p            elaboration
```

Pillars:
1. `Icon.Users` — "100% to essentials" — "Every rand goes to the essentials a recipient needs this week."
2. `Icon.Shield` — "Verified recipients" — "Every recipient is verified through a community partner."
3. `Icon.Heart` — "Dignity, by design" — "Recipients choose what they need. We don't choose for them."
4. `Icon.Chart` — "Trackable impact" — "Follow your gift from card to checkout to receipt."

### 7. CTA band (`<CTABand>`, `.cta-band`)

Paper background, top/bottom borders.

```
.cta-inner          left:
                      h2 "Be part of the next R40,000."
                      p  "Jaylin and the Nectar Road kids are rebuilding. Help them get there."
                    right:
                      .btn.btn-green.btn-lg "Give now" → opens modal
                      .btn.btn-ghost      "Apply as recipient" (href="mailto:hello@givesmartgivedirect.co.za")
```

### 8. Footer (`<Footer>`)

```
.foot-top (4-col grid):
  .foot-brand     BrandLogo + .foot-wordmark "Give Smart" + italic accent "Give Direct."
                  .foot-tag "Person to person giving, with proof. Cape Town, South Africa."
  .foot-col       h4 "Give" → Donate now (opens modal) / Meet Jaylin (#story) / How it works (#how)
  .foot-col       h4 "Trust" → Verification (anchors #how) / Our impact (#impact)
  .foot-col       h4 "Contact" → mailto:hello@givesmartgivedirect.co.za / Apply as recipient
.foot-bottom      "© 2026 Give Smart. Give Direct."   "givesmartgivedirect.co.za · Section 18A receipts available"
```

### 9. GiveModal (`<GiveModal>`)

Rebuilt to the new `.modal` styles. Same payment flow as before.

```
.modal
  button.x        close
  h3              "Confirm your gift"
  p               "You're giving to Jaylin and the Nectar Road community."
  .summary        .lbl ("Monthly gift" / "One-time gift")  .amt "R50 /mo"
  .field × 2      Name (optional, "So Jaylin can thank you") + Email (for receipt)
  button.give-btn "Continue to payment →" → calls buildOzowUrl(...) and redirects
  p.modal-fine    "Sandbox mode · placeholder credentials. No real card charged."
```

### 10. Toast

Renders when `?payment=success | error | cancelled` is on the URL. Same three states as today; styled with `.toast.toast-success | .toast-error | .toast-info`.

---

## State and data flow

```
App
├── const [scrolled, setScrolled]   ← scroll listener; window.scrollY > 12
├── const [giveDetails, setGive]    ← opens GiveModal when not null
├── const [paymentMsg, setPaymentMsg]  ← from ?payment= URL param on mount
│
├── <Nav scrolled openGive={...} />
├── <Hero openGive={...} />
├── <Story />
├── <HowItWorks />
├── <GiveSection openGive={...} />
├── <Impact />
├── <CTABand openGive={...} />
├── <Footer />
├── {giveDetails && <GiveModal details onClose />}
└── {paymentMsg && <Toast msg setMsg />}
```

`openGive(details)` is the only cross-cutting prop. Called from:
- Nav Donate button → `openGive({ amount: 50, mode: "monthly" })`
- Hero "Give now" → `openGive({ amount: 50, mode: "monthly" })`
- DonationCard "Continue to payment" → `openGive({ amount: effective, mode })`
- CTABand "Give now" → `openGive({ amount: 50, mode: "monthly" })`

`useTweaks` is gone. No live theming.

---

## Ozow payment (unchanged)

`buildOzowUrl({ amount, mode })` stays at the top of `components.jsx`. Sandbox mode, client-side SHA-512 hash via Web Crypto. Production move (serverless function) remains a known follow-up, not in this scope.

`window.GATEWAY_CONFIG` is already defined in `Homepage2.html`. Keep it.

---

## Verification rules (new — applies during implementation)

Each task in the implementation plan ends with these two checks **before** the task is marked done:

1. `grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' app.jsx components.jsx` — must return nothing.
2. Hard-reload `http://localhost:3333/Homepage.html` and confirm no banner in `#__err`. If the loader was reverted, run `node -e "require('@babel/core').parseSync(require('fs').readFileSync('FILE','utf8'), {presets:['@babel/preset-react']})"` per changed `.jsx`.

This was the missing step that turned Task 5 of the previous plan into a multi-round debug session.

---

## Acceptance criteria

- `Homepage.html` is the only homepage file in the repo. `Homepage2.html` and `tweaks-panel.jsx` are deleted.
- All eight sections render in the order above, with the correct copy.
- Nav transitions between transparent and paper backgrounds on scroll.
- Hero displays 47 supporters / R12,800 / R40,000 goal with the bar at 32%.
- The Donate button (nav, hero, give section, CTA band) opens the modal; pressing "Continue to payment" redirects to a `pay.ozow.com` URL with a `HashCheck` parameter.
- The page renders cleanly with no `#__err` banner and no curly quotes in any `.jsx` file.
- All multi-column grids collapse correctly at 880px, 760px, 480px breakpoints (already in Homepage2.html CSS).
