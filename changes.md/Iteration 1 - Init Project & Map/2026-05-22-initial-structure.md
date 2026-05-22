# 2026-05-22 — Initial repository structure and dependency install

## Summary

Created an **empty directory tree** for **Echoes of Aethon** using a small **npm workspaces** monorepo layout, then ran **`npm install`** to install frontend and backend dependencies. **No application source files** were added under `apps/web/src/` or `apps/server/src/` (those folders exist only as structure).

## Layout created (directories only)

```
.
apps
apps/server
apps/server/src
apps/server/src/config
apps/server/src/db
apps/server/src/middleware
apps/server/src/routes
apps/web
apps/web/public
apps/web/src
apps/web/src/app
apps/web/src/assets
apps/web/src/assets/audio
apps/web/src/assets/fonts
apps/web/src/assets/models
apps/web/src/assets/textures
apps/web/src/components
apps/web/src/core
apps/web/src/entities
apps/web/src/features
apps/web/src/features/audio
apps/web/src/features/echo-dive
apps/web/src/features/interaction
apps/web/src/features/player
apps/web/src/features/puzzles
apps/web/src/features/ui
apps/web/src/features/world-state
apps/web/src/hooks
apps/web/src/rendering
apps/web/src/rendering/materials
apps/web/src/rendering/shaders
apps/web/src/scenes
apps/web/src/systems
apps/web/src/utils
changes.md
packages
packages/shared
```

### Folder intent (brief)

| Path | Purpose |
|------|---------|
| `apps/web/` | Vite + React + TypeScript client; Three.js / R3F game code will live here. |
| `apps/web/src/app/` | App shell, providers, routing when introduced. |
| `apps/web/src/core/` | Cross-cutting primitives (clock, events, small shared types) — keep gameplay-specific code out. |
| `apps/web/src/systems/` | Orchestration-style systems that span features (thin early on). |
| `apps/web/src/entities/` | Entity definitions / prefab-style composition targets. |
| `apps/web/src/components/` | Shared React / R3F UI and scene building blocks not tied to one feature. |
| `apps/web/src/features/*/` | Feature-first modules (Echo Dive, world state, player, interaction, puzzles, audio, UI). |
| `apps/web/src/rendering/` | Rendering pipeline helpers, materials, shaders (separate from gameplay rules). |
| `apps/web/src/scenes/` | Scene assembly for levels / test scenes. |
| `apps/web/src/hooks/`, `utils/` | Shared hooks and pure utilities. |
| `apps/web/src/assets/*/` | Logical buckets for bundled art references (models, textures, audio, fonts). |
| `apps/web/public/` | Static public assets served as-is. |
| `apps/server/` | Express API host for later persistence and services. |
| `apps/server/src/{routes,middleware,db,config}/` | Typical server layering. |
| `packages/shared/` | Reserved for future shared types between web and server. |
| `changes.md/` | This documentation folder (agent change outcomes). |

## Tooling files added (required for installs)

These are **not** gameplay code, but they are normal repo scaffolding:

- Root `package.json` — npm workspaces for `apps/*` and `packages/*`.
- `apps/web/package.json` — React 19, Vite 7, TypeScript, Three.js, React Three Fiber, Drei.
- `apps/server/package.json` — Express 5 + TypeScript types (no server entry file yet; `scripts` intentionally empty).
- `.gitignore` — ignores `node_modules/`, build output, env files, logs, etc.

## Commands executed

```bash
cd "/Users/rishikumar/Desktop/EchoesOfAethon"
npm install
```

Result: **0 reported vulnerabilities** from `npm audit` at install time.

## Notes / caveats

- **Git does not track empty directories.** Until you add files (even `.gitkeep`) inside empty folders, those folders may disappear in a fresh clone. This is expected.
- **`npm run dev`** at the repo root is wired to `web`, but **Vite entry files were not created yet**, so dev server wiring is still pending.
- **`apps/server`** has **no `src/index` yet** and **no npm `start` script** to avoid referencing missing files.

## Follow-ups (suggested next session)

1. Scaffold Vite React TS template files into `apps/web/` (`index.html`, `vite.config.ts`, `src/main.tsx`, `index.css`, `tsconfig*.json`).
2. Add a minimal R3F canvas in a `scenes/` module to validate the render loop.
3. Add `apps/server/src/index.ts` (or `.js`) plus a `start` script when the API is needed.
4. Decide on package manager lockfile policy (`package-lock.json` is present from npm).
