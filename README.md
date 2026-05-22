# Echoes of Aethon

Browser-first exploration and puzzle adventure built with **React**, **TypeScript**, **Vite**, and **React Three Fiber** (Three.js).

## Change log & agent handoff

This repository keeps **human-readable session notes** under [`changes.md/`](changes.md/) for documentation and for handoff to other contributors or LLMs.

- **Iteration 1 closeout (narrative):** [`docs/iteration-01-summary.md`](docs/iteration-01-summary.md)
- **Granular dated entries:** [`changes.md/Iteration 1 - Init Project & Map/`](changes.md/Iteration%201%20-%20Init%20Project%20&%20Map/)

### Conventions

- One file per meaningful session or batch of work, named `YYYY-MM-DD-short-title.md`.
- Prefer **facts over opinions**: commands run, paths added, dependency versions, known follow-ups.
- If a change is risky or incomplete, add a **Follow-ups** section at the bottom of the entry.

### Latest entry

[`changes.md/Iteration 1 - Init Project & Map/2026-05-22-readme-github-sync.md`](changes.md/Iteration%201%20-%20Init%20Project%20&%20Map/2026-05-22-readme-github-sync.md) — root README / `changes.md` cross-linking and push to GitHub.

Browsing the **`changes.md`** folder on GitHub also renders [`changes.md/README.md`](changes.md/README.md) above the file list (same purpose as this section).

---

## Repository layout

- **`apps/web`** — game client
- **`apps/server`** — API shell (Express) for future persistence
- **`packages/shared`** — reserved for shared types/utilities
- **`docs/`** — architecture notes for contributors
- **`changes.md/`** — structured change log for sessions and handoff

## Quick start

```bash
npm install
npm run dev
```

Then open the URL printed by Vite (typically `http://localhost:5173`).

```bash
npm run build
```

Builds the web client for production.

## Status

Early scaffolding: monorepo structure, Vite bootstrapping, a minimal R3F prototype scene, **camera-relative** player movement on a bounded ground slab. Gameplay systems (Echo Dive, puzzles, persistence) are not implemented yet.

**Iteration 1 summary:** [`docs/iteration-01-summary.md`](docs/iteration-01-summary.md)
