# Forge — Master Progress Doc (Canonical)
_Last updated: 2025-10-10 15:00 UTC+11:00 • Owner: Ed Brooks • Canonical source of truth for Forge repos and operations._

> Single canonical file. Keep this in: `forge-layer/docs/canonical.md` and pin it in ChatGPT. Do **not** duplicate across repos; link back here.

## Repo inventory
- **forge-frontend** — UI for Snapthumb and future tools.
- **forge-layer** — API/SDK + transforms (thumb today; caption reserved).
- Tag baseline: **v0.1** for both repos (Oct 9, 2025). Subsequent tags must be SemVer and originate from green `main` only.

---

## 2025-10-10 — Hygiene purge completed
Status: **implemented and pushed**. Scope: remove cruft, redundant files, AI hallucinations, and slop; unify CI; tighten configs.

### Results overview
- Single CI workflow per repo: `.github/workflows/ci.yml` only.
- Dead code removed: orphaned modules, unused exports, unreachable routes.
- Hallucination fixes: deleted references to non-existent symbols, routes, env vars, or packages.
- Assets trimmed: oversized or duplicate assets removed; artifacts ignored.
- Docs normalized: canonical doc kept; stale duplicates deleted or linked.
- Env/configs simplified: one `.env.example` per repo with only required keys.
- Package surfaces reduced: minimal public API in Layer; one `lib/api.ts` surface in Frontend.
- Tests pruned and stabilized: removed obsolete snapshots; kept determinism checks.
- Git hygiene: merged/closed stale branches; non-SemVer tags removed; protection rules intact.

---

## Implementation details

### Applied to **both** repos
- **CI unification**
  - Kept `.github/workflows/ci.yml`. Triggers: `push` and `pull_request` to `main` and feature branches.
  - Node 20, pnpm caching, `pnpm -r build`, `pnpm -r test`, type-check, lint.
  - Required check: `ci`. Remove other workflow files and badges.

- **Root hygiene**
  - Keep only: `.editorconfig`, `.gitignore`, `.gitattributes`, `.nvmrc`, `LICENSE`, `README.md`, required configs.
  - Delete: `.idea/`, stray `.vscode/` configs not needed, alternative lockfiles, checked-in build outputs, screenshots/design dumps.

- **Dead-code map**
  - Built export→import graph. Deleted orphaned modules, zero-use components/helpers, unreachable routes.
  - Enabled strict TS flags: `noUnusedLocals`, `noUnusedParameters`. ESLint rule `imports/no-unused-modules` active.

- **Hallucination detector**
  - Removed code paths referencing missing symbols, routes, envs, or packages.
  - Added compile-time guards where needed. Deleted speculative branches.

- **Assets + artifacts**
  - Anything >300 KB reviewed. Non-source moved out of repo or removed. `.gitignore` covers `dist/`, `.next/`, `coverage/`, `*.log`, `*.tmp`.

- **Docs audit**
  - Kept **this** canonical doc at `forge-layer/docs/canonical.md`.
  - Removed stale READMEs or exported chats. Added links back to canonical doc.

- **Git + releases**
  - Stale merged branches deleted. Long-lived unmerged branches moved to `archive/*`.
  - Tags normalized to SemVer only. Latest tag remains **v0.1** until next green release.
  - Protection: main requires PR + green `ci`.

---

### forge-frontend specifics
- **UI cruft pruned**: unused components, demo pages, placeholder routes removed. Barrel exports updated.
- **Tailwind/shadcn cleanup**: removed unused shadcn component files; deduped variants; tightened `global.css` layers.
- **Routing audit**: deleted dead/test routes; verified 404 and error boundaries; ensured route-level lazy loading where helpful.
- **State/hooks**: removed unused custom hooks; simplified trivial wrappers; favored derived props over redundant state.
- **API client**: single surface `lib/api.ts` targeting Forge Layer SDK; deleted ad‑hoc fetchers and mock clients.
- **Validation**: unified on one schema system (zod). Deleted duplicates.
- **Styling**: removed legacy CSS modules/SCSS; migrated to Tailwind or deleted.
- **Images/icons**: deduped SVGs; removed unreferenced assets.

### forge-layer specifics
- **Packages audit**: trimmed exports in `packages/*`; deleted unreferenced internals; merged trivial helpers into callers.
- **Routes**: kept `/forge/thumb`, `/health`, reserved `/forge/caption`; removed experimental or commented routes and mock handlers.
- **Determinism + cache**: centralized `determinismHash = SHA256(JSON.stringify({{ tool, version, input, options }}))`; deleted alternate hashing utils.
- **Telemetry**: single emitter with events `{start, complete, error, cache_hit, cache_miss}`; removed console-noise wrappers.
- **SDK surface**: kept `forgeRequest(tool, payload)` with strict typed I/O; removed deprecated clients and curl snippets from codebase (moved to docs if needed).
- **Config/env**: one `.env.example` with only required keys; removed commented legacy flags and extra `.env.*` samples.
- **FFmpeg/media**: deleted unused filters/presets/experimental flags; compile-time guards on active presets.
- **Tests**: removed obsolete tests tied to removed routes; added minimal golden-file tests for determinism and cache behavior.
- **Build scripts**: one `pnpm -r build`; deleted duplicated scripts; verified `exports` fields in each `package.json`; removed `ts-node` runtime dev shims.

---

## Verification
- CI green on both repos with unified workflow.
- Type-check shows zero unused symbols.
- Lint passes with `imports/no-unused-modules` enforcing dead-code removal.
- Production build successful. Smoke tests pass.
- Manual QA: routes load, SDK calls succeed, no missing asset or env references.

---

## Next actions
1. Tag next stable after additional QA: **v0.2** from `main` when ready.
2. Keep cleanup pressure: reject PRs that add unused deps, duplicate assets, or shadow configs.
3. Extend golden tests around Snapthumb core paths to lock behavior before new features.
4. Maintain single-source docs. All repo READMEs link to this doc.

---

## Canonical locations
- Primary: `forge-layer/docs/canonical.md` (this file).
- In ChatGPT: pinned in the project.
- In other repos: **link only** to avoid divergence.
