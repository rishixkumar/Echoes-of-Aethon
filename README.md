# Echoes of Aethon

Browser-first exploration and puzzle adventure built with **React**, **TypeScript**, **Vite**, and **React Three Fiber** (Three.js).

## Change log & agent handoff

This repository keeps **human-readable session notes** under [`changes.md/`](changes.md/) for documentation and for handoff to other contributors or LLMs.

- **Iteration 1 closeout (narrative):** [`docs/iteration-01-summary.md`](docs/iteration-01-summary.md)
- **Iteration 2 closeout (narrative):** [`docs/iteration-02-summary.md`](docs/iteration-02-summary.md)
- **Granular dated entries:** [`changes.md/Iteration 1 - Init Project & Map/`](changes.md/Iteration%201%20-%20Init%20Project%20&%20Map/) · [`changes.md/Iteration 2 - Player Interactions/`](changes.md/Iteration%202%20-%20Player%20Interactions/) · [`changes.md/Iteration 3 - Map Creation/`](changes.md/Iteration%203%20-%20Map%20Creation/)

### Conventions

- One file per meaningful session or batch of work, named `YYYY-MM-DD-short-title.md`.
- Prefer **facts over opinions**: commands run, paths added, dependency versions, known follow-ups.
- If a change is risky or incomplete, add a **Follow-ups** section at the bottom of the entry.

### Latest entry

- [`changes.md/Iteration 3 - Map Creation/cameraSystemMilestone-20260522.md`](changes.md/Iteration%203%20-%20Map%20Creation/cameraSystemMilestone-20260522.md) — gameplay camera (FP/TP, zoom, transitions, wall collision, top-down fallback).
- [`changes.md/Iteration 3 - Map Creation/prototypeRoomMapSlice-20260522.md`](changes.md/Iteration%203%20-%20Map%20Creation/prototypeRoomMapSlice-20260522.md) — hand-built prototype room, rect wall collision, exit zone, **Area Complete**.

Earlier: [`docs/iteration-02-summary.md`](docs/iteration-02-summary.md) — Iteration 2 engineering narrative. [`changes.md/Iteration 1 - Init Project & Map/readmeGithubSync-20260522.md`](changes.md/Iteration%201%20-%20Init%20Project%20&%20Map/readmeGithubSync-20260522.md) — README / `changes.md` cross-linking.

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

Monorepo scaffolding, Vite + R3F prototype, **camera-relative** movement, **gameplay-driven camera** (FP/TP, zoom, smooth mode transitions, segment wall collision, severe-obstruction top-down blend), **proximity interactables**, **objectives + Echo Gate**, **hand-built 14×18 prototype room** with **rect + circle XZ collision**, **exit zone + Area Complete HUD** (Iteration 3). Iteration 2 systems (atmosphere, labels, lantern) preserved. Echo Dive, save/load, and full physics remain future work.

| Iteration | Summary / logs |
|-----------|----------------|
| 1 | [`docs/iteration-01-summary.md`](docs/iteration-01-summary.md) |
| 2 | [`docs/iteration-02-summary.md`](docs/iteration-02-summary.md) |
| 3 (in progress) | [`changes.md/Iteration 3 - Map Creation/`](changes.md/Iteration%203%20-%20Map%20Creation/) |

**Granular logs:** [`changes.md/`](changes.md/)
