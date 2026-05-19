# Compliance Docs — Design

**Date:** 2026-05-19
**Status:** Approved, ready for plan
**Phase:** 3 of payment-gateway rollout (precedes PayFast integration work)

## Context

Give Smart. Give Direct. (`www.givesmartgivedirect.co.za`) is launching a pilot in partnership with a registered South African NPO. Donors visit the site, give via PayFast, and funds settle directly into the NPO's PayFast merchant account. Give Smart is the awareness / referral platform; the NPO is the merchant of record.

Before accepting real donations, the site must satisfy three South African compliance requirements:

- **POPIA** — a privacy policy disclosing what donor data we collect and why
- **ECT Act §43** — operator identification (name, physical address, email, phone) visible on the site
- **Donor-facing terms** — making the referral-only relationship between Give Smart and the NPO unambiguous, plus standard disclaimers

The NPO partnership materially shortens these documents: PCI compliance, FICA/AML, refund handling, and Section 18A tax receipts all sit with the NPO. Give Smart's surface area is narrow — we collect a donor's name and email in `GiveModal` (`components.jsx:340-341`) before redirecting to PayFast.

## Deliverables

| Artifact | Path | Notes |
|---|---|---|
| Privacy Policy | `privacy.html` | Static page. Same `<head>` styling as `index.html` minus all React/Babel scripts. |
| Terms of Service | `terms.html` | Static page. Same styling approach. |
| Footer disclosure block | edit `components.jsx` `Footer` | ECT §43 operator block + NPO partner block + links to `/privacy.html` and `/terms.html`. |
| Newsletter opt-in checkbox | edit `components.jsx` `GiveModal` | New checkbox, default **off**, label "Send me occasional updates about future giving opportunities." Required because POPIA needs explicit opt-in for marketing communications. |

## Privacy Policy — section outline

1. Who we are — Give Smart (referral platform) + NPO partner (merchant of record)
2. What we collect — donor name + email at give-time; basic server-side request logs; no third-party trackers
3. Why we collect it — four declared uses:
   - Pass to PayFast for transaction fulfillment and receipt
   - Send a one-off thank-you / impact update for this donation
   - Share with the partner NPO for their donor relations
   - Add to a future-giving newsletter — only if the donor ticks the opt-in checkbox
4. Who we share it with — PayFast (as processor), the partner NPO, no other third parties
5. Retention — 5 years after the donor's last donation (aligns with SA tax record norms)
6. Donor rights — access, correction, deletion, opt-out of marketing, complaint to the Information Regulator
7. Information Officer — partner's name + email
8. Cookies — one localStorage entry for the dev tweaks-panel state; no tracking cookies
9. Effective date + how we'll notify of changes

## Terms of Service — section outline

1. About Give Smart — referral / awareness platform; the NPO is the actual recipient of funds
2. How donations work — redirect to PayFast; NPO is merchant of record; the donor's card statement shows the NPO's name; receipts come from the NPO
3. **Tax receipts** — donors may request Section 18A receipts directly from the partner NPO at `{{ NPO_CONTACT }}`
4. Donor responsibilities — accurate name/email; lawful payment method
5. No refunds by default — payment disputes are between donor, PayFast, and the NPO; Give Smart cannot reverse a donation
6. Recipient information — we present recipients' stories in good faith but make no warranty about precise allocation of any individual gift
7. Limitation of liability — standard
8. Governing law — South Africa
9. Changes to terms — we may update; donors are bound by the version live at the time of their donation
10. Contact

## Placeholders

All operator and NPO-specific values are placeholders until the partner provides them. Convention: `{{ NAME }}`.

- `{{ OPERATOR_NAME }}` — business partner's full legal name (public-facing operator)
- `{{ OPERATOR_ADDRESS }}` — physical address (ECT Act §43 requirement)
- `{{ OPERATOR_EMAIL }}` — public contact email
- `{{ OPERATOR_PHONE }}` — phone number
- `{{ NPO_NAME }}` — partner NPO's registered name
- `{{ NPO_NUMBER }}` — NPO registration number (XXX-XXX NPO format)
- `{{ NPO_CONTACT }}` — public NPO contact email
- `{{ EFFECTIVE_DATE }}` — the date the policies go live

A single repo-wide find-and-replace will swap them out once details are confirmed.

## Out of scope (YAGNI)

- **Cookie consent banner** — no third-party trackers in use; revisit if analytics are added.
- **Separate refund policy document** — covered in Terms section 5.
- **Information Officer registration walkthrough** — that's a one-time admin task on the Information Regulator eServices portal, performed by the business partner. Doesn't belong on the website.
- **Cross-border data transfer language** — Netlify Functions (planned for Phase 1) host outside SA, but this is the partner-NPO's data-processing relationship to disclose, not a separate policy section.

## Implementation notes

- The new HTML pages should use the same brand fonts and `--accent` / `--navy-900` variables as `index.html`. Simplest: copy the `<style>` block (or extract it to a shared file later — premature for two static pages).
- Footer link order: Privacy → Terms → Contact. ECT §43 disclosure renders as a separate sub-block above or beside the link row, never hidden behind a click.
- The newsletter checkbox in `GiveModal` ships its value through to the future Netlify signing function (Phase 1) as a boolean; for now, it can simply be captured in component state — there's no consumer yet.
- No tests required: the artifacts are static text and one HTML attribute. Manual smoke test (hard-reload, click footer links, confirm both pages render and link back) is sufficient.

## Acceptance criteria

- [ ] `privacy.html` and `terms.html` exist at repo root, render correctly over HTTP, and link back to `/`.
- [ ] Footer block on `index.html` shows operator name, address, email, phone, NPO name + reg, and links to both new pages.
- [ ] `GiveModal` shows a newsletter opt-in checkbox, default unchecked.
- [ ] All `{{ PLACEHOLDER }}` tokens remain visibly bracketed until the partner sends real values — they must not be silently shipped as empty strings.
- [ ] Site still renders end-to-end with no console errors at desktop and at ~375px width.

## Order of operations

1. Commit this spec.
2. Implementation plan (next, via `writing-plans` skill).
3. Draft `privacy.html` and `terms.html` with placeholders.
4. Edit `components.jsx` (footer + newsletter checkbox).
5. Commit, manual smoke test, push.
6. When partner sends real details: repo-wide find-and-replace, commit, push live.
