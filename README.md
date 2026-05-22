# Echoes of Aethon

Browser-first exploration and puzzle adventure built with **React**, **TypeScript**, **Vite**, and **React Three Fiber** (Three.js).

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

Early scaffolding: monorepo structure, Vite bootstrapping, and a minimal R3F prototype scene. Gameplay systems (Echo Dive, puzzles, persistence) are not implemented yet.
