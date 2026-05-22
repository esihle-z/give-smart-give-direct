# PayFast Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the client-side Ozow redirect in `GiveModal` with a PayFast redirect whose signature is computed by a Netlify Function, so the merchant passphrase never reaches the browser. Donation events are logged to a Google Sheet via a Google Apps Script web app.

**Architecture:** The static site stays on GitHub Pages. A *separate* repo deployed to Netlify hosts two functions: `sign-payfast` (browser POSTs donor info, gets back signed PayFast form fields) and `payfast-itn` (PayFast posts server-to-server; we run the 4-check verification and append a row to a Google Sheet). The browser auto-submits a hidden form to PayFast with the signed fields. Cross-origin calls between GH Pages and Netlify are handled with a single `Access-Control-Allow-Origin` header.

**Tech Stack:** Netlify Functions (Node 20), `crypto` for MD5, native `fetch` for postback + Sheets webhook, Google Apps Script web app for sheet append. Sandbox PayFast credentials (`merchant_id=10000100`, `merchant_key=46f0cd694581a`, no passphrase) used throughout development; swapped for live creds at Task 9.

**Companion docs:**
- `docs/plans/2026-05-19-payfast-research.md` — full research findings and citations.
- `docs/plans/2026-05-19-compliance-docs-plan.md` — Phase 3 (compliance docs, shipped).
- `CLAUDE.md:62, 66` — current Ozow architecture notes (will be updated in Task 8).

---

## File Structure

**Existing project (`/Users/ez/Documents/My_apps/Give Smart/`)** — main site:

- Modify: `components.jsx` — replace `buildOzowUrl()` call site in `GiveModal.handlePay()` with a call to the Netlify endpoint + hidden-form auto-submit. Delete `buildOzowUrl()` entirely in Task 8.
- Modify: `<entry-html-file>` — replace `window.GATEWAY_CONFIG` (Ozow shape) with `window.PAYFAST_CONFIG` (PayFast shape, public values only). Task 0 will determine whether this lives in `Homepage.html`, `index.html`, or both — the codebase audit and CLAUDE.md disagree.
- Modify: `CLAUDE.md` — update the payment-flow paragraph at line 62 and 66 to describe PayFast + Netlify Function.

**New project (separate repo, e.g. `~/Documents/My_apps/give-smart-functions/`):**

- Create: `netlify/functions/sign-payfast.mjs` — POST handler, returns signed PayFast form fields.
- Create: `netlify/functions/payfast-itn.mjs` — POST handler, 4-check verification + Sheets append.
- Create: `lib/payfast-signature.mjs` — pure signature builder (no I/O). Imported by both functions.
- Create: `lib/payfast-config.mjs` — reads env vars, exposes typed config object.
- Create: `lib/sheets.mjs` — thin wrapper around the Apps Script webhook.
- Create: `tests/payfast-signature.test.mjs` — node:test unit tests for the signer.
- Create: `tests/itn-verify.test.mjs` — node:test unit tests for the ITN verifier.
- Create: `netlify.toml` — Functions config + CORS headers.
- Create: `package.json` — `type: module`, node test runner script.
- Create: `.env.example` — documents required env vars.
- Create: `README.md` — minimal setup/deploy instructions.

**Google Apps Script (in user's Google account):**

- Create: A new Apps Script project bound to a Google Sheet titled "Give Smart Donations". One function `doPost(e)` that appends a row.

---

## Task 0: Reconnaissance & decisions

**Files:** none modified.

- [ ] **Step 0.1: Confirm current hosting**

Run from `/Users/ez/Documents/My_apps/Give Smart/`:

```bash
git remote -v
ls -la .github/workflows/ 2>/dev/null
ls netlify.toml vercel.json 2>/dev/null
```

Expected: a GitHub remote, possibly a `pages.yml` workflow, no `netlify.toml`. If a `netlify.toml` is present, stop and flag — the hosting picture is different from what we assumed.

- [ ] **Step 0.2: Identify the actual entry HTML file**

The codebase audit (Task 4 of research) reported `GATEWAY_CONFIG` at `index.html:978-988`. `CLAUDE.md` describes `Homepage.html` as the entry. Run:

```bash
ls -la Homepage.html index.html 2>/dev/null
grep -n "GATEWAY_CONFIG" Homepage.html index.html 2>/dev/null
```

Note which file actually contains `GATEWAY_CONFIG`. All future edits to "the entry HTML file" target that file.

- [ ] **Step 0.3: Capture the production origin**

Note the GitHub Pages origin (e.g. `https://givesmartgivedirect.co.za` or `https://<user>.github.io/...`). This origin string is needed for the CORS header in Task 1 and for `return_url` / `cancel_url` / `notify_url` building in Task 2.

- [ ] **Step 0.4: Create the Google Sheet**

In Google Drive, create a sheet titled "Give Smart Donations". Add header row in row 1, columns A–L:

```
Timestamp | pf_payment_id | m_payment_id | payment_status | amount_gross | amount_fee | amount_net | name_first | name_last | email_address | newsletter_optin | raw_payload_json
```

Note the spreadsheet ID from the URL (`docs.google.com/spreadsheets/d/<ID>/edit`).

No commit — this task is reconnaissance only.

---

## Task 1: Bootstrap the Netlify Functions project

**Files:**

- Create: `~/Documents/My_apps/give-smart-functions/package.json`
- Create: `~/Documents/My_apps/give-smart-functions/netlify.toml`
- Create: `~/Documents/My_apps/give-smart-functions/.env.example`
- Create: `~/Documents/My_apps/give-smart-functions/.gitignore`
- Create: `~/Documents/My_apps/give-smart-functions/README.md`
- Create: `~/Documents/My_apps/give-smart-functions/netlify/functions/health.mjs`

- [ ] **Step 1.1: Initialise the directory**

```bash
mkdir -p ~/Documents/My_apps/give-smart-functions/{netlify/functions,lib,tests}
cd ~/Documents/My_apps/give-smart-functions
git init
```

- [ ] **Step 1.2: Write `package.json`**

```json
{
  "name": "give-smart-functions",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "node --test tests/",
    "dev": "netlify dev"
  }
}
```

- [ ] **Step 1.3: Write `.gitignore`**

```
node_modules/
.netlify/
.env
.env.local
*.log
.DS_Store
```

- [ ] **Step 1.4: Write `.env.example`**

```
# PayFast — sandbox values are public and safe to commit as defaults
PAYFAST_MERCHANT_ID=10000100
PAYFAST_MERCHANT_KEY=46f0cd694581a
PAYFAST_PASSPHRASE=
PAYFAST_PROCESS_URL=https://sandbox.payfast.co.za/eng/process
PAYFAST_VALIDATE_URL=https://sandbox.payfast.co.za/eng/query/validate

# Site origin allowed to call sign-payfast (CORS)
ALLOWED_ORIGIN=https://givesmartgivedirect.co.za

# Public site URLs PayFast redirects donors back to
RETURN_URL=https://givesmartgivedirect.co.za/?payment=success
CANCEL_URL=https://givesmartgivedirect.co.za/?payment=cancelled
NOTIFY_URL=https://<this-netlify-site>.netlify.app/.netlify/functions/payfast-itn

# Google Apps Script web app URL that appends a donation row
SHEETS_WEBHOOK_URL=
SHEETS_WEBHOOK_SECRET=
```

- [ ] **Step 1.5: Write `netlify.toml`**

```toml
[build]
  functions = "netlify/functions"
  publish = "."

[functions]
  node_bundler = "esbuild"

[[headers]]
  for = "/.netlify/functions/*"
  [headers.values]
    Access-Control-Allow-Origin = "https://givesmartgivedirect.co.za"
    Access-Control-Allow-Methods = "POST, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type"
    Access-Control-Max-Age = "86400"
```

If Task 0.3 produced a different production origin, substitute it on the `Access-Control-Allow-Origin` line.

- [ ] **Step 1.6: Write the health-check function**

`netlify/functions/health.mjs`:

```js
export default async () =>
  new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
```

- [ ] **Step 1.7: Write a minimal `README.md`**

```markdown
# give-smart-functions

Netlify Functions for the Give Smart donation flow.

## Local dev

    npm i -g netlify-cli
    cp .env.example .env   # fill in real values
    netlify dev

## Endpoints

- POST `/.netlify/functions/sign-payfast` — returns signed PayFast form fields
- POST `/.netlify/functions/payfast-itn` — PayFast ITN webhook
- GET  `/.netlify/functions/health` — health check
```

- [ ] **Step 1.8: First commit**

```bash
git add .
git commit -m "chore: scaffold give-smart-functions netlify project"
```

- [ ] **Step 1.9: Deploy to Netlify and verify health endpoint**

```bash
netlify login
netlify init   # create a new site, link this repo
netlify deploy --prod
curl https://<site>.netlify.app/.netlify/functions/health
```

Expected: `{"ok":true,"ts":...}`. Note the Netlify site URL — use it for `NOTIFY_URL` going forward.

---

## Task 2: PayFast signature library (TDD)

**Files:**

- Create: `lib/payfast-signature.mjs`
- Create: `tests/payfast-signature.test.mjs`

- [ ] **Step 2.1: Write the failing test**

`tests/payfast-signature.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPayfastSignature, buildPayfastSignedFields } from "../lib/payfast-signature.mjs";

test("buildPayfastSignature: known PayFast docs example without passphrase", () => {
  const fields = {
    merchant_id: "10000100",
    merchant_key: "46f0cd694581a",
    amount: "100.00",
    item_name: "Test Product",
  };
  const sig = buildPayfastSignature(fields, "");
  assert.equal(typeof sig, "string");
  assert.equal(sig.length, 32);
  assert.match(sig, /^[0-9a-f]{32}$/);
});

test("buildPayfastSignature: signature changes when passphrase added", () => {
  const fields = { merchant_id: "10000100", amount: "50.00" };
  const a = buildPayfastSignature(fields, "");
  const b = buildPayfastSignature(fields, "secret");
  assert.notEqual(a, b);
});

test("buildPayfastSignature: empty fields are omitted from signing string", () => {
  const a = buildPayfastSignature({ a: "1", b: "", c: "3" }, "");
  const b = buildPayfastSignature({ a: "1", c: "3" }, "");
  assert.equal(a, b);
});

test("buildPayfastSignature: preserves submission order, not alphabetical", () => {
  const a = buildPayfastSignature({ b: "1", a: "2" }, "");
  const b = buildPayfastSignature({ a: "2", b: "1" }, "");
  assert.notEqual(a, b);
});

test("buildPayfastSignature: spaces in values encode as '+' not '%20'", () => {
  const fields = { item_name: "Test Product" };
  const sig = buildPayfastSignature(fields, "");
  // Reference: MD5 of "item_name=Test+Product"
  assert.equal(sig, "1781d0f5f0d61a96f08e89a90ff96a4f");
});

test("buildPayfastSignedFields: returns fields + signature key in order", () => {
  const out = buildPayfastSignedFields(
    {
      merchant_id: "10000100",
      merchant_key: "46f0cd694581a",
      amount: "50.00",
      item_name: "Donation",
    },
    "",
  );
  const keys = Object.keys(out);
  assert.equal(keys[keys.length - 1], "signature");
  assert.equal(out.amount, "50.00");
});
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `lib/payfast-signature.mjs` doesn't exist.

- [ ] **Step 2.3: Implement the signer**

`lib/payfast-signature.mjs`:

```js
import { createHash } from "node:crypto";

function encodeValue(v) {
  return encodeURIComponent(String(v).trim()).replace(/%20/g, "+");
}

export function buildPayfastSignature(fields, passphrase) {
  const pairs = [];
  for (const [key, value] of Object.entries(fields)) {
    if (value === "" || value === null || value === undefined) continue;
    if (key === "signature") continue;
    pairs.push(`${key}=${encodeValue(value)}`);
  }
  let queryString = pairs.join("&");
  if (passphrase && passphrase.length > 0) {
    queryString += `&passphrase=${encodeValue(passphrase)}`;
  }
  return createHash("md5").update(queryString).digest("hex");
}

export function buildPayfastSignedFields(fields, passphrase) {
  const signature = buildPayfastSignature(fields, passphrase);
  return { ...fields, signature };
}
```

- [ ] **Step 2.4: Run tests to verify they pass**

```bash
npm test
```

Expected: 6 tests pass. If the spaces-encoding test fails with a different hash, the reference value in Step 2.1 was computed manually — recompute it once via:

```bash
node -e "console.log(require('crypto').createHash('md5').update('item_name=Test+Product').digest('hex'))"
```

Update the assertion to whatever that prints.

- [ ] **Step 2.5: Commit**

```bash
git add lib/ tests/
git commit -m "feat: payfast signature builder with unit tests"
```

---

## Task 3: `sign-payfast` endpoint

**Files:**

- Create: `lib/payfast-config.mjs`
- Create: `netlify/functions/sign-payfast.mjs`
- Create: `tests/sign-payfast.test.mjs`

- [ ] **Step 3.1: Write the config loader**

`lib/payfast-config.mjs`:

```js
function required(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function loadConfig() {
  return {
    merchantId: required("PAYFAST_MERCHANT_ID"),
    merchantKey: required("PAYFAST_MERCHANT_KEY"),
    passphrase: process.env.PAYFAST_PASSPHRASE ?? "",
    processUrl: required("PAYFAST_PROCESS_URL"),
    validateUrl: required("PAYFAST_VALIDATE_URL"),
    returnUrl: required("RETURN_URL"),
    cancelUrl: required("CANCEL_URL"),
    notifyUrl: required("NOTIFY_URL"),
    allowedOrigin: required("ALLOWED_ORIGIN"),
    sheetsWebhookUrl: process.env.SHEETS_WEBHOOK_URL ?? "",
    sheetsWebhookSecret: process.env.SHEETS_WEBHOOK_SECRET ?? "",
  };
}
```

- [ ] **Step 3.2: Write the failing test for the handler**

`tests/sign-payfast.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";

process.env.PAYFAST_MERCHANT_ID = "10000100";
process.env.PAYFAST_MERCHANT_KEY = "46f0cd694581a";
process.env.PAYFAST_PASSPHRASE = "";
process.env.PAYFAST_PROCESS_URL = "https://sandbox.payfast.co.za/eng/process";
process.env.PAYFAST_VALIDATE_URL = "https://sandbox.payfast.co.za/eng/query/validate";
process.env.RETURN_URL = "https://example.test/?payment=success";
process.env.CANCEL_URL = "https://example.test/?payment=cancelled";
process.env.NOTIFY_URL = "https://example.test/.netlify/functions/payfast-itn";
process.env.ALLOWED_ORIGIN = "https://example.test";

const { default: handler } = await import("../netlify/functions/sign-payfast.mjs");

function makeRequest(body) {
  return new Request("https://example.test/.netlify/functions/sign-payfast", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("sign-payfast: rejects non-POST", async () => {
  const res = await handler(
    new Request("https://example.test/.netlify/functions/sign-payfast", { method: "GET" }),
  );
  assert.equal(res.status, 405);
});

test("sign-payfast: rejects missing amount", async () => {
  const res = await handler(makeRequest({ name: "Test", email: "t@t.com" }));
  assert.equal(res.status, 400);
});

test("sign-payfast: rejects amount below R5", async () => {
  const res = await handler(
    makeRequest({ amount: 2, name: "Test", email: "t@t.com" }),
  );
  assert.equal(res.status, 400);
});

test("sign-payfast: rejects invalid email", async () => {
  const res = await handler(
    makeRequest({ amount: 50, name: "Test", email: "not-an-email" }),
  );
  assert.equal(res.status, 400);
});

test("sign-payfast: returns signed fields and process URL for valid request", async () => {
  const res = await handler(
    makeRequest({
      amount: 50,
      name: "Jane Donor",
      email: "jane@example.test",
      newsletterOptIn: true,
    }),
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.processUrl, "https://sandbox.payfast.co.za/eng/process");
  assert.equal(body.fields.merchant_id, "10000100");
  assert.equal(body.fields.amount, "50.00");
  assert.equal(body.fields.name_first, "Jane");
  assert.equal(body.fields.name_last, "Donor");
  assert.equal(body.fields.email_address, "jane@example.test");
  assert.equal(body.fields.custom_str1, "newsletter:yes");
  assert.match(body.fields.m_payment_id, /^gs-\d+-[a-z0-9]+$/);
  assert.match(body.fields.signature, /^[0-9a-f]{32}$/);
});

test("sign-payfast: single-word name leaves name_last empty (omitted)", async () => {
  const res = await handler(
    makeRequest({ amount: 50, name: "Madonna", email: "m@example.test" }),
  );
  const body = await res.json();
  assert.equal(body.fields.name_first, "Madonna");
  assert.equal(body.fields.name_last, undefined);
});
```

- [ ] **Step 3.3: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — handler doesn't exist yet.

- [ ] **Step 3.4: Implement the handler**

`netlify/functions/sign-payfast.mjs`:

```js
import { loadConfig } from "../../lib/payfast-config.mjs";
import { buildPayfastSignedFields } from "../../lib/payfast-signature.mjs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function splitName(full) {
  const trimmed = (full ?? "").trim();
  if (!trimmed) return { first: "", last: "" };
  const parts = trimmed.split(/\s+/);
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function newPaymentId() {
  return `gs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req) {
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });

  let payload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const amountNum = Number(payload.amount);
  if (!Number.isFinite(amountNum) || amountNum < 5) {
    return json(400, { error: "amount_invalid", detail: "Minimum R5.00" });
  }
  if (!payload.name || typeof payload.name !== "string") {
    return json(400, { error: "name_required" });
  }
  if (!payload.email || !EMAIL_RE.test(payload.email)) {
    return json(400, { error: "email_invalid" });
  }

  const cfg = loadConfig();
  const { first, last } = splitName(payload.name);

  const fields = {
    merchant_id: cfg.merchantId,
    merchant_key: cfg.merchantKey,
    return_url: cfg.returnUrl,
    cancel_url: cfg.cancelUrl,
    notify_url: cfg.notifyUrl,
    name_first: first,
    ...(last ? { name_last: last } : {}),
    email_address: payload.email,
    m_payment_id: newPaymentId(),
    amount: amountNum.toFixed(2),
    item_name: "Donation to Give Smart NPO partner",
    item_description: "Direct donation",
    custom_str1: payload.newsletterOptIn ? "newsletter:yes" : "newsletter:no",
  };

  const signed = buildPayfastSignedFields(fields, cfg.passphrase);
  return json(200, { processUrl: cfg.processUrl, fields: signed });
}
```

- [ ] **Step 3.5: Run tests to verify they pass**

```bash
npm test
```

Expected: all sign-payfast + signature tests pass (12+).

- [ ] **Step 3.6: Commit**

```bash
git add lib/payfast-config.mjs netlify/functions/sign-payfast.mjs tests/sign-payfast.test.mjs
git commit -m "feat: sign-payfast endpoint with input validation"
```

---

## Task 4: ITN verifier library (TDD)

**Files:**

- Create: `lib/itn-verify.mjs`
- Create: `tests/itn-verify.test.mjs`

- [ ] **Step 4.1: Write the failing test**

`tests/itn-verify.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPayfastSignature } from "../lib/payfast-signature.mjs";
import { verifySignature, isPayfastHost } from "../lib/itn-verify.mjs";

test("verifySignature: returns true for a correctly-signed payload", () => {
  const fields = {
    m_payment_id: "gs-1",
    pf_payment_id: "1000",
    payment_status: "COMPLETE",
    amount_gross: "50.00",
    amount_fee: "-3.60",
    amount_net: "46.40",
  };
  const signature = buildPayfastSignature(fields, "");
  assert.equal(verifySignature({ ...fields, signature }, ""), true);
});

test("verifySignature: returns false for a tampered amount", () => {
  const fields = { m_payment_id: "gs-1", amount_gross: "50.00" };
  const signature = buildPayfastSignature(fields, "");
  assert.equal(
    verifySignature({ ...fields, amount_gross: "5000.00", signature }, ""),
    false,
  );
});

test("verifySignature: passphrase mismatch fails", () => {
  const fields = { m_payment_id: "gs-1", amount_gross: "50.00" };
  const signature = buildPayfastSignature(fields, "right");
  assert.equal(verifySignature({ ...fields, signature }, "wrong"), false);
});

test("isPayfastHost: accepts payfast.co.za subdomains", () => {
  assert.equal(isPayfastHost("notify.payfast.co.za"), true);
  assert.equal(isPayfastHost("w1w.payfast.co.za"), true);
  assert.equal(isPayfastHost("sandbox.payfast.co.za"), true);
});

test("isPayfastHost: rejects unrelated hosts", () => {
  assert.equal(isPayfastHost("evil.com"), false);
  assert.equal(isPayfastHost("payfast.co.za.evil.com"), false);
  assert.equal(isPayfastHost(""), false);
});
```

- [ ] **Step 4.2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — `lib/itn-verify.mjs` doesn't exist.

- [ ] **Step 4.3: Implement the verifier**

`lib/itn-verify.mjs`:

```js
import { buildPayfastSignature } from "./payfast-signature.mjs";

export function verifySignature(fields, passphrase) {
  const { signature, ...rest } = fields;
  if (!signature) return false;
  const expected = buildPayfastSignature(rest, passphrase);
  return expected === signature;
}

export function isPayfastHost(hostname) {
  if (!hostname || typeof hostname !== "string") return false;
  return /(^|\.)payfast\.co\.za$/i.test(hostname);
}

export async function postbackValidate(validateUrl, rawBody) {
  const res = await fetch(validateUrl, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: rawBody,
  });
  const text = (await res.text()).trim();
  return text === "VALID";
}

export function parseFormBody(rawBody) {
  const params = new URLSearchParams(rawBody);
  const out = {};
  for (const [k, v] of params) out[k] = v;
  return out;
}
```

- [ ] **Step 4.4: Run tests to verify they pass**

```bash
npm test
```

Expected: all verifier + earlier tests pass.

- [ ] **Step 4.5: Commit**

```bash
git add lib/itn-verify.mjs tests/itn-verify.test.mjs
git commit -m "feat: payfast ITN signature + host verification"
```

---

## Task 5: Google Apps Script webhook + Sheets logger

**Files:**

- Create: Apps Script project (in browser, not local).
- Create: `lib/sheets.mjs`

- [ ] **Step 5.1: Create the Apps Script web app**

In the Google Sheet from Task 0.4, open **Extensions → Apps Script**. Replace the default code with:

```js
const SECRET = 'CHANGE_ME_TO_A_LONG_RANDOM_STRING';
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.secret !== SECRET) {
      return ContentService.createTextOutput(JSON.stringify({ ok: false, error: 'unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    sheet.appendRow([
      new Date().toISOString(),
      body.pf_payment_id || '',
      body.m_payment_id || '',
      body.payment_status || '',
      body.amount_gross || '',
      body.amount_fee || '',
      body.amount_net || '',
      body.name_first || '',
      body.name_last || '',
      body.email_address || '',
      body.newsletter_optin || '',
      JSON.stringify(body.raw || {}),
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

Replace `CHANGE_ME_TO_A_LONG_RANDOM_STRING` with a generated value:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save. Click **Deploy → New deployment → Type: Web app**, set **Execute as: Me**, **Who has access: Anyone**, deploy, and copy the web app URL. This is `SHEETS_WEBHOOK_URL`. The random string is `SHEETS_WEBHOOK_SECRET`. Put both in your local `.env`.

- [ ] **Step 5.2: Smoke-test the webhook**

```bash
curl -s -X POST "$SHEETS_WEBHOOK_URL" \
  -H "content-type: application/json" \
  -d "{\"secret\":\"$SHEETS_WEBHOOK_SECRET\",\"pf_payment_id\":\"test\",\"payment_status\":\"COMPLETE\",\"amount_gross\":\"5.00\"}"
```

Expected: `{"ok":true}` and a new row in the sheet. Delete the test row.

- [ ] **Step 5.3: Write the client library**

`lib/sheets.mjs`:

```js
export async function appendDonation(webhookUrl, secret, donation) {
  if (!webhookUrl) {
    console.warn("SHEETS_WEBHOOK_URL not set — skipping append");
    return { ok: false, skipped: true };
  }
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret, ...donation }),
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { ok: false, error: "non_json_response", body: text };
  }
}
```

- [ ] **Step 5.4: Commit**

```bash
git add lib/sheets.mjs
git commit -m "feat: google sheets append-donation client"
```

---

## Task 6: `payfast-itn` endpoint

**Files:**

- Create: `netlify/functions/payfast-itn.mjs`
- Create: `tests/payfast-itn.test.mjs`

- [ ] **Step 6.1: Write the failing test**

`tests/payfast-itn.test.mjs`:

```js
import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { buildPayfastSignature } from "../lib/payfast-signature.mjs";

process.env.PAYFAST_MERCHANT_ID = "10000100";
process.env.PAYFAST_MERCHANT_KEY = "46f0cd694581a";
process.env.PAYFAST_PASSPHRASE = "";
process.env.PAYFAST_PROCESS_URL = "https://sandbox.payfast.co.za/eng/process";
process.env.PAYFAST_VALIDATE_URL = "https://sandbox.payfast.co.za/eng/query/validate";
process.env.RETURN_URL = "https://example.test/?payment=success";
process.env.CANCEL_URL = "https://example.test/?payment=cancelled";
process.env.NOTIFY_URL = "https://example.test/.netlify/functions/payfast-itn";
process.env.ALLOWED_ORIGIN = "https://example.test";
process.env.SHEETS_WEBHOOK_URL = "https://script.google.test/exec";
process.env.SHEETS_WEBHOOK_SECRET = "test-secret";

const { default: handler } = await import("../netlify/functions/payfast-itn.mjs");

function fields(overrides = {}) {
  const base = {
    m_payment_id: "gs-test",
    pf_payment_id: "1000",
    payment_status: "COMPLETE",
    amount_gross: "50.00",
    amount_fee: "-3.60",
    amount_net: "46.40",
    name_first: "Jane",
    name_last: "Donor",
    email_address: "jane@example.test",
    custom_str1: "newsletter:yes",
    ...overrides,
  };
  base.signature = buildPayfastSignature(base, "");
  return base;
}

function bodyOf(f) {
  return new URLSearchParams(f).toString();
}

function makeReq(body, opts = {}) {
  return new Request("https://example.test/.netlify/functions/payfast-itn", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", ...opts.headers },
    body,
  });
}

test("payfast-itn: rejects non-POST", async () => {
  const res = await handler(
    new Request("https://example.test/.netlify/functions/payfast-itn", { method: "GET" }),
  );
  assert.equal(res.status, 405);
});

test("payfast-itn: rejects bad signature", async () => {
  const f = fields();
  f.signature = "0".repeat(32);
  const res = await handler(makeReq(bodyOf(f)));
  assert.equal(res.status, 400);
});

test("payfast-itn: accepts valid payload, calls postback + sheets", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async (url) => {
    const u = String(url);
    if (u.includes("/eng/query/validate")) {
      return new Response("VALID", { status: 200 });
    }
    if (u.includes("script.google.test")) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }
    return new Response("nope", { status: 500 });
  });

  const res = await handler(makeReq(bodyOf(fields())));
  assert.equal(res.status, 200);
  const calls = fetchMock.mock.calls.map((c) => String(c.arguments[0]));
  assert.ok(calls.some((u) => u.includes("/eng/query/validate")));
  assert.ok(calls.some((u) => u.includes("script.google.test")));
  fetchMock.mock.restore();
});

test("payfast-itn: returns 400 when postback says INVALID", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () =>
    new Response("INVALID", { status: 200 }),
  );
  const res = await handler(makeReq(bodyOf(fields())));
  assert.equal(res.status, 400);
  fetchMock.mock.restore();
});
```

- [ ] **Step 6.2: Run test to verify it fails**

```bash
npm test
```

Expected: FAIL — handler doesn't exist.

- [ ] **Step 6.3: Implement the handler**

`netlify/functions/payfast-itn.mjs`:

```js
import { loadConfig } from "../../lib/payfast-config.mjs";
import {
  verifySignature,
  postbackValidate,
  parseFormBody,
} from "../../lib/itn-verify.mjs";
import { appendDonation } from "../../lib/sheets.mjs";

function txt(status, body = "") {
  return new Response(body, { status, headers: { "content-type": "text/plain" } });
}

export default async function handler(req) {
  if (req.method !== "POST") return txt(405);

  const rawBody = await req.text();
  const fields = parseFormBody(rawBody);
  const cfg = loadConfig();

  if (!verifySignature(fields, cfg.passphrase)) {
    return txt(400, "bad signature");
  }

  const valid = await postbackValidate(cfg.validateUrl, rawBody);
  if (!valid) return txt(400, "postback failed");

  if (fields.payment_status === "COMPLETE") {
    await appendDonation(cfg.sheetsWebhookUrl, cfg.sheetsWebhookSecret, {
      pf_payment_id: fields.pf_payment_id,
      m_payment_id: fields.m_payment_id,
      payment_status: fields.payment_status,
      amount_gross: fields.amount_gross,
      amount_fee: fields.amount_fee,
      amount_net: fields.amount_net,
      name_first: fields.name_first,
      name_last: fields.name_last,
      email_address: fields.email_address,
      newsletter_optin: fields.custom_str1 === "newsletter:yes" ? "yes" : "no",
      raw: fields,
    });
  }

  return txt(200);
}
```

Note on idempotency: Apps Script appends a new row per call. If PayFast retries on transient failure, we'll get duplicate rows. Acceptable for the pilot — we de-dupe by `pf_payment_id` when reporting. Revisit in Phase 2+ if volume increases.

Note on rDNS: production deployments behind Netlify lose the original client IP at the function layer in a way that makes rDNS impractical without Netlify's IP-pass-through. We are deferring rDNS to a follow-up; signature + postback are PayFast's two cryptographically meaningful checks, and rDNS is defense-in-depth. Documented in `README.md` in Step 6.5.

- [ ] **Step 6.4: Run tests to verify they pass**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 6.5: Append a note to `README.md`**

Add to `README.md`:

```markdown
## ITN verification scope

`payfast-itn` enforces two of PayFast's four recommended checks:

1. Signature recompute against the posted body (with passphrase).
2. Server-to-server postback to `PAYFAST_VALIDATE_URL` (must reply `VALID`).

It does **not** enforce source-IP / rDNS or amount-match (no stored expected amount in the pilot). Both are deferred to Phase 2; signature + postback are PayFast's cryptographically meaningful checks.
```

- [ ] **Step 6.6: Commit and deploy**

```bash
git add netlify/functions/payfast-itn.mjs tests/payfast-itn.test.mjs README.md
git commit -m "feat: payfast-itn endpoint with signature + postback verification"
netlify env:set PAYFAST_MERCHANT_ID "10000100"
netlify env:set PAYFAST_MERCHANT_KEY "46f0cd694581a"
netlify env:set PAYFAST_PASSPHRASE ""
netlify env:set PAYFAST_PROCESS_URL "https://sandbox.payfast.co.za/eng/process"
netlify env:set PAYFAST_VALIDATE_URL "https://sandbox.payfast.co.za/eng/query/validate"
netlify env:set RETURN_URL "<from Task 0.3>/?payment=success"
netlify env:set CANCEL_URL "<from Task 0.3>/?payment=cancelled"
netlify env:set NOTIFY_URL "<netlify site url>/.netlify/functions/payfast-itn"
netlify env:set ALLOWED_ORIGIN "<from Task 0.3>"
netlify env:set SHEETS_WEBHOOK_URL "<from Task 5.1>"
netlify env:set SHEETS_WEBHOOK_SECRET "<from Task 5.1>"
netlify deploy --prod
```

---

## Task 7: Replace Ozow in the donation modal

**Files:**

- Modify: `/Users/ez/Documents/My_apps/Give Smart/<entry-html-file>` (determined in Task 0.2): lines 978-988
- Modify: `/Users/ez/Documents/My_apps/Give Smart/components.jsx`: lines 351-421

- [ ] **Step 7.1: Replace `GATEWAY_CONFIG` with `PAYFAST_CONFIG`**

In the entry HTML file, replace the block at lines 978-988:

```html
<script>
  window.PAYFAST_CONFIG = {
    signEndpoint: "https://<netlify-site>.netlify.app/.netlify/functions/sign-payfast",
  };
</script>
```

(Substitute the real Netlify URL from Task 1.9.)

The site has only a single config value to ship now — everything else (merchant ID, passphrase, return URLs) lives server-side in Netlify env vars.

- [ ] **Step 7.2: Update `GiveModal.handlePay` in `components.jsx`**

Open `components.jsx`. Replace the `handlePay` function inside `GiveModal` (current location around line 358-367) with:

```jsx
const handlePay = async () => {
  setError("");
  if (!name.trim()) return setError("Please enter your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email.");

  setSubmitting(true);
  try {
    const res = await fetch(window.PAYFAST_CONFIG.signEndpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        amount: details.amount || 50,
        name,
        email,
        newsletterOptIn: optIn,
      }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Sign failed (${res.status})`);
    }
    const { processUrl, fields } = await res.json();

    const form = document.createElement("form");
    form.method = "POST";
    form.action = processUrl;
    for (const [k, v] of Object.entries(fields)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = k;
      input.value = v;
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  } catch (err) {
    setSubmitting(false);
    setError(err.message || "Could not start payment. Please try again.");
  }
};
```

- [ ] **Step 7.3: Add `submitting` + `error` state to `GiveModal`**

In `GiveModal` near the other `useState` declarations (around line 352-354), add:

```jsx
const [submitting, setSubmitting] = React.useState(false);
const [error, setError] = React.useState("");
```

In the JSX, near the existing "Continue to payment" button, replace the button with:

```jsx
{error && <div className="text-red-600 text-sm mb-2" role="alert">{error}</div>}
<button
  onClick={handlePay}
  disabled={submitting}
  className="w-full rounded-lg bg-[var(--accent)] text-white font-semibold py-3 disabled:opacity-50"
>
  {submitting ? "Redirecting to PayFast…" : "Continue to payment"}
</button>
```

(If the existing button is styled differently, preserve its class names and only add `disabled`, the disabled label, and the `error` div above it.)

- [ ] **Step 7.4: Smoke-test locally**

From `/Users/ez/Documents/My_apps/Give Smart/`:

```bash
python3 -m http.server 3333
```

Open `http://localhost:3333/<entry-html-file>`. Hard-reload. Click Donate → fill in name + email + amount → submit. Expected: the browser briefly auto-submits and lands on `sandbox.payfast.co.za`. If you see "Generated signature does not match", recheck `PAYFAST_PASSPHRASE` (sandbox should have an empty string).

Run the curly-quote / non-ASCII smart-punctuation check from `CLAUDE.md`:

```bash
grep -nP '[\x{201C}\x{201D}\x{2018}\x{2019}]' app.jsx components.jsx icons.jsx tweaks-panel.jsx
```

Expected: no matches.

- [ ] **Step 7.5: Commit**

```bash
cd "/Users/ez/Documents/My_apps/Give Smart"
git add components.jsx <entry-html-file>
git commit -m "feat: wire GiveModal to PayFast via Netlify sign endpoint"
```

---

## Task 8: Delete Ozow code and update CLAUDE.md

**Files:**

- Modify: `components.jsx` — delete `buildOzowUrl()` at lines 1-23
- Modify: `CLAUDE.md` — update lines 62 and 66

- [ ] **Step 8.1: Delete `buildOzowUrl`**

In `components.jsx`, delete lines 1-23 (the header comment + entire `buildOzowUrl` function). The file should now start at the next existing section.

- [ ] **Step 8.2: Verify nothing else references it**

```bash
grep -nE "buildOzowUrl|GATEWAY_CONFIG|ozow|OZOW" \
  app.jsx components.jsx icons.jsx tweaks-panel.jsx Homepage.html index.html 2>/dev/null
```

Expected: zero matches. If anything remains, remove or update it.

- [ ] **Step 8.3: Update `CLAUDE.md`**

Replace the two paragraphs in `CLAUDE.md` that describe Ozow.

At line 62, replace:

```
- `window.GATEWAY_CONFIG` — Ozow payment config (siteCode, privateKey, isTest flag, redirect URLs)
```

with:

```
- `window.PAYFAST_CONFIG` — public PayFast client config; the only field is `signEndpoint`, the Netlify Function URL that signs requests server-side
```

At line 66, replace the entire "Payment flow" section with:

```
### Payment flow

`GiveModal.handlePay` in `components.jsx` POSTs `{ amount, name, email, newsletterOptIn }` to the Netlify Function at `window.PAYFAST_CONFIG.signEndpoint`. The function returns `{ processUrl, fields }` where `fields` already includes a server-computed `signature`. The browser builds a hidden form and POSTs it to `processUrl` (PayFast hosted page). PayFast posts the result server-to-server to a second Netlify Function (`payfast-itn`), which verifies the signature, validates via PayFast's `/eng/query/validate` postback, and appends a row to a Google Sheet via an Apps Script webhook. The merchant passphrase never reaches the browser.
```

- [ ] **Step 8.4: Smoke-test again**

Run the same flow from Task 7.4 and confirm everything still works end-to-end.

- [ ] **Step 8.5: Commit**

```bash
git add components.jsx CLAUDE.md
git commit -m "refactor: remove buildOzowUrl and update CLAUDE.md for PayFast"
```

---

## Task 9: Sandbox end-to-end verification

**Files:** none modified.

- [ ] **Step 9.1: Full sandbox donation**

From `http://localhost:3333/<entry-html-file>`:

1. Open Donate modal.
2. Pick amount = R5 (PayFast minimum), name = "Sandbox Test", email = your real email, newsletter = checked.
3. Continue to payment → PayFast sandbox page → click the green "Complete Payment" button.

Expected:
- Browser redirects back to `RETURN_URL`.
- Within ~30s, the Google Sheet has a new row with `payment_status=COMPLETE`, `amount_gross=5.00`, `name_first=Sandbox`, `name_last=Test`, `email_address=<your-email>`, `newsletter_optin=yes`.
- `netlify logs` for `payfast-itn` shows a single 200 response.

- [ ] **Step 9.2: Cancellation path**

Repeat but click "Cancel" on the PayFast page. Expected: browser lands on `CANCEL_URL` and no row is appended.

- [ ] **Step 9.3: Tampered-signature smoke test (negative case)**

```bash
curl -i -X POST "https://<netlify-site>.netlify.app/.netlify/functions/payfast-itn" \
  -H "content-type: application/x-www-form-urlencoded" \
  --data "m_payment_id=fake&amount_gross=1000000&signature=00000000000000000000000000000000"
```

Expected: HTTP 400. No row added.

- [ ] **Step 9.4: Commit the verification log**

Append a one-line dated entry to a new file `docs/plans/2026-05-19-payfast-phase1-verification.md` summarising the three checks above (which donations were sent, sheet row IDs, response codes). Commit.

---

## Task 10: Production cut-over (gated on partner NPO creds arriving)

**Files:** none modified — Netlify env-var changes only.

- [ ] **Step 10.1: Receive live PayFast creds from NPO partner**

Required from partner: `merchant_id`, `merchant_key`, and the passphrase they configured on the PayFast dashboard. Confirm via PayFast dashboard login that the account is fully verified and capable of receiving funds.

- [ ] **Step 10.2: Swap Netlify env vars to live**

```bash
netlify env:set PAYFAST_MERCHANT_ID "<live>"
netlify env:set PAYFAST_MERCHANT_KEY "<live>"
netlify env:set PAYFAST_PASSPHRASE "<live>"
netlify env:set PAYFAST_PROCESS_URL "https://www.payfast.co.za/eng/process"
netlify env:set PAYFAST_VALIDATE_URL "https://www.payfast.co.za/eng/query/validate"
netlify deploy --prod
```

- [ ] **Step 10.3: Live smoke test — one R5 donation**

Use a real card / EFT to send R5. Confirm:
- Sheet row appears with `payment_status=COMPLETE`.
- Funds appear in NPO's PayFast dashboard wallet within minutes.
- (Optional, requires 1-2 business days) NPO's bank account receives the payout at next scheduled run.

- [ ] **Step 10.4: Refund the test donation**

NPO refunds the R5 from the PayFast dashboard. Confirm refund flow works before opening the firehose.

- [ ] **Step 10.5: Announce**

Site is live on PayFast. Tag the release in git:

```bash
cd "/Users/ez/Documents/My_apps/Give Smart"
git tag -a payfast-phase1-live -m "PayFast live on production $(date -I)"
git push origin payfast-phase1-live
```

---

## Open items deferred to Phase 2+

- rDNS / source-IP check on ITN (defense-in-depth).
- Amount-match check on ITN (requires storing the expected amount per `m_payment_id` — needs a small DB or another Sheet).
- Onsite Payments (no-redirect inline checkout) if conversion data shows the redirect hurts.
- Recurring/monthly donations via PayFast Subscriptions.
- POPIA Operator Agreement signed with PayFast (legal, parallel to this work).
- Decision on whether to keep Ozow as a secondary "EFT-only, no card fee" option.
