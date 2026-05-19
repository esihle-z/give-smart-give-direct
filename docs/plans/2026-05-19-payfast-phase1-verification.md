# PayFast Phase 1 — Sandbox verification log

**Date:** 2026-05-19
**Tester:** Esihle (manual browser flow)
**Sandbox merchant:** `10000100` / `46f0cd694581a` / passphrase `jt7NOE43FZPn`

## Happy path

- **m_payment_id:** `gs-1779218101387-7k3kik`
- **pf_payment_id:** `3166036`
- **amount_gross:** R5.00 / fee R0.12 / net R4.88
- **newsletter_optin:** `yes` (captured in `custom_str1`)
- **Flow:** `http://localhost:3333/index.html` → `sign-payfast` (200) → form auto-submit → PayFast sandbox checkout → "Complete Payment" → redirect to `https://givesmartgivedirect.co.za/` → ITN to `payfast-itn` (200) → donation logged at `2026-05-19T19:15:20.xxxZ`
- **ITN log entry:** `{"event":"donation","pf_payment_id":"3166036","m_payment_id":"gs-1779218101387-7k3kik","payment_status":"COMPLETE","amount_gross":"5.00","amount_fee":"-0.12","amount_net":"4.88","name_first":"Esihle","name_last":"","email_address":"esihlezungula@gmail.com","newsletter_optin":"yes","raw":{...}}`

## Negative case — tampered/bad signature

Direct curl probe with garbage signature:

```
curl -X POST .../payfast-itn -d "m_payment_id=fake&amount_gross=1000000&signature=00000000000000000000000000000000"
→ HTTP 400 "bad signature"
```

WARN log captured at `21:09:29` confirming signature rejection.

## Issues discovered & fixes shipped

1. **CORS allowlist missing localhost.** First donation attempt produced "Load failed" in browser because `ALLOWED_ORIGINS` only included production domain. Fixed by adding `http://localhost:3333` to allowlist + redeploy.

2. **PayFast sandbox passphrase is non-empty.** Documentation says sandbox `10000100` has no passphrase, but PayFast has since added one: `jt7NOE43FZPn`. Discovered by direct curl probing the sandbox process URL with different passphrase candidates. Set as `PAYFAST_PASSPHRASE` env var.

3. **ITN signature uses different rules than outbound signing.** PayFast's outbound documentation says "omit empty fields" — and that's what we did. But the *inbound* ITN includes empty `custom_str2..5`, `custom_int1..5`, and `name_last` in the signed body. Fixed by switching `verifySignature` to operate on the raw POST body bytes directly (strip `&signature=...` suffix, append `&passphrase=...`, MD5) rather than re-encoding from parsed fields. Regression test added with the captured real ITN payload.

## Outstanding for Task 10 (live cutover)

- Live PayFast `merchant_id`, `merchant_key`, and passphrase from NPO partner.
- Confirm NPO PayFast account fully verified in dashboard.
- Update `RETURN_URL` / `CANCEL_URL` to whichever pages the partner wants donors to land on post-payment (currently both → `https://givesmartgivedirect.co.za/`).
- Switch `PAYFAST_PROCESS_URL` from `sandbox.payfast.co.za` → `www.payfast.co.za` and `PAYFAST_VALIDATE_URL` similarly.
- Remove `http://localhost:3333` from `ALLOWED_ORIGINS` for production hardening.
