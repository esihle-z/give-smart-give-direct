# PayFast migration — research findings

**Date:** 2026-05-19
**Status:** Research only. No implementation yet.
**Sources:** 5 parallel research subagents (4 web, 1 codebase audit). Citations in §7.

This doc captures the research that informed our decision to replace Ozow with PayFast as Phase 1 of the payment-gateway rollout. Phase 3 (compliance docs) is already shipped (commits `56dd452` → `f899fa4`). Phase 2 was never written down and is currently undefined.

---

## 1. PayFast integration mechanics

**Flow:** hosted-page redirect via HTML form POST.

- Production endpoint: `https://www.payfast.co.za/eng/process`
- Sandbox endpoint: `https://sandbox.payfast.co.za/eng/process`
- Sandbox test creds: `merchant_id=10000100`, `merchant_key=46f0cd694581a`, no passphrase.

**Required form fields:** `merchant_id`, `merchant_key`, `return_url`, `cancel_url`, `notify_url`, `m_payment_id` (our ID), `amount` (decimal, 2 dp), `item_name`, plus optional `name_first`/`email_address`/`custom_str1..5` for donor info and pass-through. Final field is `signature`.

**Signature:** lowercase MD5 hex of fields in **submission order** (not alphabetical), urlencoded as `key=value&key=value`, omitting empty fields. If a passphrase is set on the PayFast account, append `&passphrase=<urlencoded>`. Sandbox has no passphrase. Passphrase mismatch + field-order drift are the #1 cause of signature errors.

**ITN (webhook to `notify_url`)** — the only trusted source of "donation paid". Four required checks:
1. Recompute signature on the POST body and compare.
2. Source IP / reverse DNS check (PayFast publishes the list; use rDNS lookup against `*.payfast.co.za`).
3. Amount match against our stored `m_payment_id`.
4. POST the entire received payload back to `/eng/query/validate` and expect body `VALID`.

Endpoint must return `200 OK` with empty body. Otherwise PayFast retries on an escalating schedule for ~2 days. **Idempotency on `pf_payment_id` is mandatory.**

**Other:** ZAR only, R5 minimum, ~18 payment methods including card, Instant EFT, Apple/Google Pay, SnapScan, Zapper, Capitec Pay. Recurring supported via `subscription_type=1` if we ever want monthly giving.

## 2. Fees, NPO onboarding, money flow

**Standard fees** (NPO/Cause discount exists but rate not published — sales conversation needed):

- Card: **3.2% + R2.00**
- Instant EFT: **2.0%** (min R2.00)
- Apple/Google/Samsung Pay: 3.2% + R2.00
- SnapScan / Scan-to-Pay: 3.5% + R2.00
- Payout fee: **R8.70 ex VAT per payout** (flat); Immediate Payout 0.8% (min R14)
- Refund: R2.00 ex VAT
- No setup or monthly fees

**NPO onboarding documents required:**
1. NPO/PBO/NPC registration certificate (or Trust Deed/IT number)
2. Physical address proof < 3 months, no PO Box
3. Bank account verification — stamped paper statement, bank letter, or cancelled cheque (internet-banking PDFs not accepted)
4. Primary director ID + proof of residential address
5. Second director ID + proof of address if multiple directors exist

Section 18A PBO cert is a SARS matter for receipts, not PayFast onboarding. Account can be created and logged in while pending but can't receive funds until verified. Activation timeline not published (estimate 2-10 business days based on SA FICA norms).

**Payouts:** funds settle to PayFast wallet in ~48-72h, then payout to bank 1-2 further business days. Daily/weekly/monthly automated payouts configurable. Rolling reserve not standard for donations; confirm with sales.

**Refunds & chargebacks:** the NPO (merchant of record) is liable. PayFast notifies, NPO supplies evidence. **Give Smart has zero financial liability** in this model.

**Money flow — decision: stay out of it.** PayFast does offer Split Payments (route a % to a third-party account, e.g. Give Smart), but using it would:
- Put Give Smart in the regulated payment flow (own FICA, tax-on-receipts).
- Compromise Section 18A receipt cleanliness (donor's full amount must reach the PBO).
- Break the "100% to the NPO" trust message.

→ Confirms current architecture: NPO is sole merchant of record.

## 3. Serverless hosting for the signing + ITN endpoints

We need two endpoints:

- `POST /api/sign-payfast` — receives donor name/email/amount/newsletter-consent, returns the signed PayFast form fields. Browser POSTs those to PayFast. Passphrase never reaches the browser.
- `POST /api/payfast-itn` — receives PayFast ITN, runs the four-check verification, logs the donation.

**Recommendation: Netlify Functions.**

| Option | Free tier | Cold start | SA region? | Verdict |
|---|---|---|---|---|
| **Netlify Functions** | 125k/mo, 100h | ~300ms | No (us-east-1, pinning is Enterprise) | **Pick.** Same `git push`, single dashboard. |
| Vercel Functions | Generous Hobby | ~300ms | No (CPT edge POP only, exec is AWS) | No advantage; platform switch. |
| Cloudflare Workers | 100k/day | ~0ms (isolates) | JNB POP but not contractually pinned | Best SA latency + already use `crypto.subtle`, but adds a second deploy target. **Second-best — defer.** |
| Supabase Edge Functions | Deno | Low | **No SA region** (London/Mumbai closest) | Only worth it if we add their DB. |

**POPIA note:** no free/cheap option offers SA function execution. Cross-border transfer is allowed under POPIA s.72 with DPA + SCCs (all four publish these). Disclose in Privacy Policy (already done in Phase 3).

**Caveat to verify before committing:** the site may currently be on GitHub Pages, not Netlify. GH Pages has no functions. If so, migrating to Netlify is ~30 minutes (point DNS, drop a `netlify.toml`).

## 4. Donor UX, conversion, reliability — the risk section

**Default UX:** PayFast redirects to a hosted page with a vertical list of payment methods. Functional but unmistakably a third-party hand-off. Ozow's flow is leaner — bank-logo grid → deep-link into the donor's banking app — a more familiar mental model for SA EFT donors.

**Onsite Payments** is PayFast's inline alternative: renders on our page, no redirect. Limitations:
- Only card + Instant EFT + Masterpass (not the full 18-method set).
- Requires a server-side identifier-generation step (same architectural cost as the signing endpoint).

**Reliability — the headline risk.** StatusGator records **994+ PayFast outages over ~4 years**, including **9 incidents in the last 90 days** (5 major, 4 minor), median duration 1h18m; a 3h24m incident on 28 Feb 2026. Hellopeter complaints cluster on delayed payouts and slow support. We did not run a symmetric outage check on Ozow, so this is one-sided — flag as something to verify before fully committing.

**Payment method coverage:** PayFast clearly wins on breadth (card + Apple/Google Pay + 15 others). Ozow is Instant-EFT-first + recently added PayShap Request (July 2025) for phone-number-based instant transfers. **No card support in Ozow alone** — excludes international/diaspora donors, which is a real SA NPO segment.

**Recurring giving:** PayFast native (Payvault tokenization, PCI DSS L1). Ozow has no native subscriptions. Only matters when/if monthly giving becomes a feature.

**POPIA touchpoints:** PayFast is an Operator under POPIA s.20. Card data lives in their PCI vault — our site never touches PAN. We should get an Operator Agreement in writing before launch. SA hosting/sub-processor list isn't in public docs.

**Switching cost both ways is low** — Ozow and PayFast share the same structural pattern (form POST → hosted page → return URL + ITN). Running both side-by-side as two "Donate" buttons is realistic (a day's work + testing).

## 5. What needs to change in the codebase

Full audit at `file:line` precision:

**Ozow-coupled code (all in `components.jsx` and `index.html`):**
- `components.jsx:1` — header comment
- `components.jsx:2-23` — `buildOzowUrl()` function: reads `window.GATEWAY_CONFIG`, builds SHA-512 hash via `crypto.subtle`, builds redirect URL to `https://pay.ozow.com/?`
- `components.jsx:361` — `GiveModal.handlePay()` calls `buildOzowUrl(...)` and redirects via `window.location.href`
- `index.html:978-988` — `window.GATEWAY_CONFIG` global with `provider`, `siteCode`, `privateKey`, `countryCode`, `currencyCode`, `isTest`, `successUrl`, `errorUrl`, `cancelUrl`. **The `privateKey` is in the browser.** This is the deal-breaker that motivates the serverless move.

**`GiveModal` (`components.jsx:351-421`) captures donor inputs:**
- `name` (state line 352, input 389-393)
- `email` (state line 353, input 397-401)
- `optIn` newsletter consent (state line 354, checkbox 404-411) — **captured but currently unconsumed**; the new `/api/sign-payfast` will be its first consumer.
- `amount`, `mode` passed in via `details` prop.

**Docs already mentioning PayFast** (compliance docs landed in Phase 3 referenced PayFast, not Ozow):
- `docs/plans/2026-05-19-compliance-docs-plan.md:5, 129, 145, 291-294, 569`

**Tests:** none touch the payment flow. `.agent/tests/` only verifies skill YAML and tool refs.

**`CLAUDE.md`** also needs updating once Phase 1 lands — lines 62 and 66 describe `GATEWAY_CONFIG` and `buildOzowUrl()` as the payment mechanism. Note: CLAUDE.md line 66 already flags the exact reason for this migration ("for production, move hash computation to a Netlify/Vercel serverless function so the private key is never exposed in client JS").

## 6. Open questions to resolve before Phase 1 starts

1. **Hosting today** — is the site on Netlify, GitHub Pages, or something else? (`git remote -v`, look for `netlify.toml`, check DNS.) Decides whether Phase 1 is "add a function" or "migrate hosting then add a function."
2. **PayFast Cause-account discount %** — sales conversation with PayFast. Affects fee modelling.
3. **NPO documents in hand** — does our partner NPO already have all 5 onboarding docs ready, or do we need to chase any?
4. **Ozow vs PayFast outage symmetry** — is PayFast's 994-outage record actually worse than Ozow's, or is Ozow just less measured? Worth ~30 minutes of checking before committing.
5. **Redirect vs Onsite Payments** — start with the simpler redirect flow, or skip straight to Onsite for better conversion? Recommend **redirect first** (matches current Ozow architecture; lowest delta).
6. **Recurring giving in Phase 1 or later?** Recommend **later** — keep Phase 1 scoped to one-off donations to ship faster.
7. **Should we keep Ozow as a secondary "EFT-only, no card fee" option?** Decision is partly product, partly NPO preference. Cost ≈ 1 day of dual-integration work.

## 7. Sources

PayFast technical:
- PayFast developer docs: https://developers.payfast.co.za/documentation/
- ITN security checks KB: https://support.payfast.help/portal/en/kb/articles/what-causes-the-itn-security-check-errors-20-9-2022
- Sandbox testing KB: https://support.payfast.help/portal/en/kb/articles/how-do-i-make-test-payments-in-sandbox-mode-20-9-2022
- Subscriptions: https://payfast.io/features/subscriptions/
- Tokenization: https://payfast.io/features/tokenization/
- On-Site Payments: https://payfast.io/features/on-site-payments/

Fees, NPO onboarding:
- Fees: https://www.payfast.io/fees/
- NPO verification: https://support.payfast.help/portal/en/kb/articles/verify-a-non-profit-account
- Charities blog: https://payfast.io/blog/empowering-south-african-charities-with-seamless-secure-donations/
- Split Payments: https://payfast.io/features/split-payments/
- Immediate Payout: https://payfast.io/features/immediate-payout/

Compliance / POPIA:
- PayFast POPIA explainer: https://payfast.io/blog/what-is-popia-and-how-does-it-affect-your-online-business/

Reliability / reputation:
- StatusGator PayFast: https://statusgator.com/services/payfast
- Official status: https://status.payfast.io/
- Hellopeter complaints: https://www.hellopeter.com/PayFast/complaints

Comparison vs Ozow:
- Slashdot Ozow vs PayFast: https://slashdot.org/software/comparison/Ozow-vs-PayFast/
- Ozow Pay-by-Bank: https://ozow.com/pay-by-bank
- Ozow PayShap launch: https://techafricanews.com/2025/07/31/ozow-launches-payshap-request-for-instant-mobile-payments/
- SA gateways 2025: https://romanosboraine.co.za/resources/best-payment-gateways-south-africa

Hosting:
- Netlify pricing: https://www.netlify.com/pricing/
- Netlify Functions overview: https://docs.netlify.com/build/functions/overview/
- Vercel Functions limits: https://vercel.com/docs/functions/limitations
- Vercel Cape Town POP: https://vercel.com/changelog/cape-town-south-africa-is-now-available-on-the-edge-network
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
- Cloudflare regional services: https://developers.cloudflare.com/data-localization/region-support/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase regions: https://supabase.com/docs/guides/platform/regions
