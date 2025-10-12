# Forge — Master Progress Doc (Canonical)

_Last updated: 2025-10-12 13:00 UTC+11 • Owner: Edward Brooks • Single source of truth for Forge repos, product, and pricing._

> Keep this file in `forge-layer/docs/canonical.md` and `forge-frontend/docs/canonical.md`. All other docs must point here.

---

## Repo Inventory

- **forge-frontend** — Snapthumb web UI. React 19 + Vite + Tailwind + shadcn/ui. Tests: Vitest, Playwright, Lighthouse CI.
- **forge-layer** — API/SDK and deterministic transforms (thumb live; caption reserved). Monorepo with `core`, `server`, `sdk`. v0.2 live.

## Live Deployments

- **Frontend**: Vercel, branch `main`, tag v0.2.
- **Layer**: Render, branch `main`, tag v0.2.
- Perf target: p95 e2e < 2 s @1080p; cache hits < 0.4 s.

---

## Architecture Overview

### Forge Layer (monorepo)

```
forge-layer/
├─ packages/
│  ├─ core/     # types, hashing, telemetry, cache
│  ├─ server/   # Express API (/forge/*)
│  └─ sdk/      # TS client
├─ docs/
└─ examples/
```

- Deterministic hashing `SHA256(JSON.stringify({tool,version,input,options}))`; result returned with every response.
- Rate limits: free 10/day per IP; Pro bypass via bearer key.
- Endpoints: `POST /forge/thumb` (JPEG), `POST /forge/renderer` (WebP), `POST /forge/caption` (reserved), `GET /health`.
- Controls: 9-grid positions, custom `x,y`, `scale`, `opacity`, `fit contain|cover|16x9`, quality presets low/med/high.
- SDK: type-safe, 30 s timeout, CJS+ESM, ≤15 kB.

**Env**
Required: `ALLOWED_ORIGINS`, `PORT`. Optional: `AUTHORIZED_KEYS`, `SUPABASE_URL/_KEY`, `FFMPEG_ENABLED`, `STORAGE_TYPE`, `PUBLIC_BASE`.

### Forge Frontend (Snapthumb UI)

- React 19 + Vite 7 + Tailwind 4 + Zustand; Canvas-based editor.
- Core: upload image/video, frame select, 16:9 crop, overlays, export ≤2 MB with presets.
- Quality gates: Lighthouse Perf ≥90, A11y ≥95, SEO ≥95; bundle budgets enforced.

---

## Screenshots Review → UI Backlog (2025-10-12)

Observed in home, app, API, privacy, terms pages.

**Navigation and footer**

- Header nav renders as a run-on string (“Home App API PrivacyTerms”). Add spacing and hit-targets.  
  Action: three-zone header (brand left, nav center, utility right). Add `gap-x-4`, `px-2`, active state.
- Footer merges links (“PrivacyTerms”). Add separators and spacing.  
  Action: `<footer class="border-t text-xs"><nav class="container mx-auto max-w-[720px] px-4 py-3 space-x-4">…</nav></footer>`.

**Layout and hierarchy**

- Excess whitespace and weak anchors on all pages.  
  Action: cap content width to 640–760 px; left-align body; use 24/18/14 scale with `leading-tight` for dense sections.
- Cards: convert feature blurbs to uniform cards with icons, `rounded-2xl shadow-sm p-4`.

**Home**

- Promote primary CTA “Launch Snapthumb”; secondary “API docs”. Stack on mobile (`space-y-2`).
- Feature trio: Quick Positioning, Live Preview, Export Ready as consistent cards.

**App**

- Uploader card looks sparse.  
  Action: elevate with title + helper text, drop-zone focus state, progress row, “Next steps” as checklist with icons.

**API docs**

- Make base URL env-driven; add code tabs; copy button fixed position.  
  Action: `overflow-x-auto` for code; response block with status line.

**Privacy/Terms**

- Typographic rhythm and bullets need spacing.  
  Action: list spacing `space-y-2`, section titles `mt-8`. Add contact line and mailto.

These are visual polish items only. No feature changes required.

---

## Completed Work

### 2025-10-10 — Hygiene purge

Unified CI, removed dead code, protected `main`, single canonical doc, cleaned assets and envs.

### 2025-10-11 — Snapthumb controls + determinism

Frontend: 9-grid + drag, scale/opacity/quality, fit toggles, restore/reset, keyboard/touch, rate-limit UX, tests.  
Layer: deterministic hashing, Sharp renderer, IP rate limit 10/day, Pro bypass, `/health` with git SHA, 317 tests.

### 2025-10-12 — UI polish round 1 (from screenshots)

Header/footer spacing, content width cap, card framing, API code blocks, privacy/terms rhythm. Status: queued and tracked in `frontend#ui-polish-2025-10-12`.

---

## Quality & Verification

**Layer**: 317 passing tests across 16 suites; p95 < 2 s; cache hits < 0.4 s; headers `X-RateLimit-*`, `X-Forge-Tier`.  
**Frontend**: Vitest + Playwright + Lighthouse CI; bundle size reporting and budgets enforced.

---

## Bundle Remediation Plan (frontend)

1. Split vendors; async-load router/editor panels.
2. Lazy-load modals and secondary panels.
3. Trim utilities and icons; prefer targeted imports.
4. Keep Canvas utilities tree-shaken.
5. Ratchet `size-limit` in stages; publish analyzer artifact on CI.  
   Goal: components/lib within budget by v0.3; vendor within 10% by v0.4.

---

## Pricing and Segments — Rationale

**Segments**

1. **Solo creators** using the UI for repeat thumbnails. Need predictable caps and no setup.
2. **Small studios/agencies** with 2–5 users creating batches. Need seats and higher API caps.
3. **Developers/API buyers** automating bulk jobs. Need usage-based pricing, keys, and SLAs.

**Willingness-to-pay drivers**

- Time saved per video (5–15 min/thumbnail).
- Consistency for brand overlays and 9-grid positioning.
- Deterministic, cacheable outputs for pipelines.

**Plan**

- **Free**: 10 UI generations/day and 50 API calls/month. Purpose: onboarding and SEO traffic conversion. Cost control via IP rate limiting already in place.
- **Pro (Solo)**: USD **$9/mo** target. Unlimited UI, 2k API calls/month. Rationale: ≤$0.005 per automated call at infra ≤$0.30/1k calls gives ≥80% gross margin at typical usage.
- **Team (Studio)**: USD **$39/mo** includes 3 seats and 10k API calls/month; $9/additional seat; overage $2/1k. Rationale: agencies batch 50–300 thumbnails/week; value sits in coordination and predictable caps.
- **Scale/API**: starts **$2/1k** calls with volume discounts at 100k+/mo and optional priority queue. Matches infra and preserves margin.

**Why these tiers work**

- Clear map from UI value (time saved) to API value (throughput).
- Low support load at free. Simple upgrade path.
- Deterministic processing + caching reduces marginal cost as reuse grows.

**Billing mechanics**

- Stripe checkout and Pro key provisioning in v0.3. Usage headers and dashboard in v0.4.

---

## Business Targets

- 5–20k MAU; 2–5% Pro conversion; 100–300 API customers in 12–24 months.
- Infra ≤ $0.30 per 1k API calls; ≥80% gross margin at scale.

---

## Roadmap

- **v0.3 (Next)**: Supabase telemetry, Stripe checkout, Pro key provisioning, public pricing page.
- **v0.4**: Templates/presets, shareable URLs, team seats, usage dashboard.
- **v0.5**: Batch mode (UI/API), webhooks, signed uploads.
- **v0.6**: Caption/overlays package; rate-limit dashboards.

---

## KPIs (monthly)

Acquisition (SEO clicks, app/docs CTR) • Activation (first export, first 10 API calls) • Conversion (free→Pro, trial→paid) • Retention (30/90-day return) • Revenue (MRR, ARPA, NDR) • Reliability (p95 e2e, 4xx/5xx, cache hit %) • Quality (LCP, CLS, a11y, error budget).

---

## Operating Cadence

Weekly release train (cut Wed, deploy Fri). Monthly KPI and price tests. Quarterly roadmap review. Update this canonical after material changes.

---

## Security & Privacy

Keys in vault; rotate quarterly. Audit billing/key events. Local-first analytics; first-party telemetry. <10 env vars per service.

---

## Appendices

**A — Example requests**

```bash
# Renderer (Sharp)
curl -X POST "$LAYER_BASE/forge/renderer" -H "Content-Type: application/json"   -d '{ "tool":"thumb","version":"0.2.0","input":{...},
        "options":{"position":"br","scale":1,"opacity":0.9,"fit":"16x9","quality":"high"} }'
# Pro key (admin)
curl -X POST "$LAYER_BASE/billing/keys" -H "Authorization: Bearer $ADMIN"
```

**B — Frontend scripts**
`pnpm dev|build|preview|typecheck|lint|format|test|test:e2e|test:a11y|lighthouse|size-limit|bundle-analyze`

**C — Test counts**
Layer: 317 Jest tests. Frontend: 20+ Playwright specs plus unit and Lighthouse gates.
