# Forge — Master Progress Doc (Canonical)
_Last updated: 2025-10-11 18:30 UTC+11:00 • Owner: Ed Brooks • Canonical source of truth for Forge repos and operations._

> Single canonical file. Keep this in: `forge-layer/docs/canonical.md` and pin it in ChatGPT. Do **not** duplicate across repos; link back here.

---

## Repo Inventory
- **forge-frontend** — UI for Snapthumb and future tools.  
- **forge-layer** — API/SDK + deterministic transforms (thumb active; caption reserved).  
- Current stable tag: **v0.2** (2025-10-11).  
- Prior baseline: **v0.1** (2025-10-09). All subsequent tags must be SemVer and originate from green `main`.

---

## 2025-10-10 — Hygiene purge completed
Status: **implemented and pushed**. Scope: removed cruft, redundant files, AI hallucinations, and slop; unified CI; tightened configs.

### Results Overview
- Unified CI workflow per repo: `.github/workflows/ci.yml` only.  
- Dead code removed; unused exports, unreachable routes, and orphaned modules deleted.  
- Hallucination cleanup: removed invalid imports and env refs.  
- Assets trimmed; artifacts ignored.  
- Docs normalized: single canonical doc retained.  
- Git hygiene enforced; non-SemVer tags deleted; `main` protected.  

(See previous section for full hygiene details retained verbatim from v0.1 baseline.)

---

## 2025-10-11 — Snapthumb upgrade and product-ready controls
Status: **implemented successfully** across both repos.

### forge-frontend
- Added **9-grid placement** with drag-move and snap-to-grid.  
- Sliders for **scale**, **opacity**, **quality**; toggle for **fit mode (contain | cover | 16:9)**.  
- Live canvas preview; generation only on “Generate”.  
- “Reset to defaults” and “Use last settings” persistence via localStorage + query params.  
- Progress bar, cached badge, error toasts, and copy/download controls.  
- Responsive layout: sidebar (desktop) or bottom-sheet (mobile).  
- Full keyboard + touch support.  
- SEO: JSON-LD + OG tags; LCP ≤ 1.5 s verified.  
- Lightweight analytics hook logging `page_view`, `generate_*`, and `download_click`.  
- Rate-limit UX with remaining quota and “Upgrade for unlimited” CTA.  
- Footer: “Powered by Forge Layer v0.2”.  
- Unit tests (Vitest) for grid math, param sync, and drag bounds passing in CI.

### forge-layer
- `/forge/thumb` schema expanded to include `{position, scale, opacity, fit, quality}` validated via Zod.  
- Determinism hash = `SHA256(tool, version, validated payload)` ensures repeatable caching.  
- Renderer:
  - Fetches frame and overlay.  
  - 16:9 center-crop if fit = "16x9".  
  - Scales overlay by `scale × min(w,h)`.  
  - Computes xy from preset + padding or manual coords.  
  - Applies opacity and exports WebP/JPEG based on quality: low 65, medium 80, high 90.  
- Telemetry emits `transform_start`, `cache_hit/miss`, `complete`, `error`.  
- Anonymous rate-limit = 10/day/IP with `X-RateLimit-*` headers.  
- Auth stub for Pro keys (`Authorization: Bearer <key>`) bypasses limits; returns `X-Forge-Tier`.  
- `/health` returns `{ok:true, version, time}` with git SHA.  
- Telemetry sink interface ready for Supabase integration.  
- Tests cover schema edges, hash stability, preset mapping, rate-limit trip.

### Integration / Billing Scaffold
- Frontend sends Pro key header if stored; hides limit notice when tier = pro.  
- Layer accepts env `FORGE_PRO_KEYS` list and issues test keys via `/billing/keys`.  

### Docs
- **forge-frontend** `/docs` page added with 60-second usage guide, limits, privacy link.  
- **forge-layer** README expanded with API examples and error schemas.  

### QA / Release
- e2e tests: three presets + manual xy + varied scales/opacities → cached true on second call.  
- End-to-end time < 2 s @ 1080p.  
- CI green both repos.  
- Verified deterministic outputs and headers.  
- Ready for public demo and tag **v0.2**.

---

## Verification Summary
- Unified CI green on both repos.  
- Type-check clean; zero unused symbols.  
- Lint passes with dead-code rules enforced.  
- Manual QA: routes load, SDK calls succeed, no missing assets or envs.  

---

## Next Actions
1. **Frontend refactor (highest priority):**  
   - Strip all leftover “Forge Toolbox” UI/UX conventions.  
   - Rebuild Snapthumb layout to match the *new Forge substrate* aesthetic—minimal, neutral, API-first design.  
   - Remove any copy, buttons, or elements implying multiple tools or a dashboard.  
   - Centralize styling tokens, typography, and color primitives for consistent design across future tools.  
   - Simplify UX to one clean screen: upload frame, upload logo, adjust, generate, download.  
2. **Tag v0.2** (done) and deploy to Render + Vercel.  
3. **Verify HTTPS and rate-limit headers** in production.  
4. **Implement Stripe checkout + Supabase telemetry** for v0.3.  
5. **Launch `forge.tools` landing page** with two clear entry points: **Try Snapthumb** / **Use API**.  
6. **Maintain deterministic core and single canonical doc.**

---

## Canonical Locations
- Primary: `forge-layer/docs/canonical.md` (this file).  
- In ChatGPT: pinned in Forge project.  
- In other repos: link only, no duplicates.  

---

✅ **Forge v0.2 complete** — Snapthumb production-ready, deterministic, rate-limited, and demo-grade. Next phase: frontend redesign, telemetry + billing (v0.3).
