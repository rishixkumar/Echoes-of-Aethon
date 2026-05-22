# Architecture rules (Echoes of Aethon)

These rules exist so contributors (human or agent) **do not flatten the repo** into random catch-all folders. When in doubt, prefer **feature boundaries** over “misc”.

## High-level layout

- **`apps/web`**: Browser client (Vite + React + TypeScript + React Three Fiber).
- **`apps/server`**: HTTP API and future persistence (Express). **Stay empty until a vertical slice needs it.**
- **`packages/*`**: Shared code between client and server (types, validators). **Avoid premature extraction.**
- **`docs/`**: Human-facing architecture and process documentation.
- **`changes.md/`**: Session / batch change logs for auditability and LLM handoff.

## Web client (`apps/web/src`)

### `features/`

Put **gameplay and product behavior** that belongs to a specific system or player-facing capability:

- `features/map-generation/` — Map pipeline split by concern: **`data/`** (templates, `MapDefinition`, fixed maps), **`graph/`** (pure room graph + validation + traversal), **`geometry/`** (walls, corridors, placement math), **`rendering/`** (R3F `GeneratedMap` / `GeneratedRoom`), **`collision/`** (map-derived rects). Import the public surface from `features/map-generation` (`index.ts`).
- `features/echo-dive/` — Echo transitions, swap orchestration, tuning, player-facing echo UX hooks.
- `features/world-state/` — Present vs echo world bookkeeping, group visibility rules, synchronization helpers (prototype: **activated interactables** store).
- `features/objectives/` — Objective definitions, completion store, HUD wiring.
- `features/world-objects/` — Level props that react to world state (e.g. **Echo Gate**).
- `features/collision/` — Lightweight non-physics collision helpers (prototype: **XZ circles**).
- `features/player/` — Movement, input, camera contracts (gameplay side, not raw rendering).
- `features/camera/` — Gameplay camera rig (modes, zoom, yaw), driven from player/world state.
- `features/interaction/` — Interactables, prompts, triggers, puzzle input wiring.
- `features/puzzles/` — Puzzle graphs, sequencing, completion signaling.
- `features/audio/` — Audio behavior: buses, transitions, gameplay-triggered cues (not raw asset bytes).
- `features/ui/` — DOM / React UI: HUD, menus, onboarding.

**Rule:** If removing the feature would delete this code, it belongs in `features/<name>/`.

### `components/`

Small **React** building blocks shared across features (e.g. **world-space labels**), not full gameplay systems.

### `scenes/`

Scene **composition only**: how a level is assembled from features and rendering primitives.

**Rule:** Scenes should mostly **import and arrange**; avoid embedding deep gameplay logic here.

### `rendering/`

Shared **Three.js / R3F presentation** helpers that are not tied to one feature:

- `rendering/materials/` — material factories, shared stylization.
- `rendering/shaders/` — shader chunks, post-processing experiments (keep performance-first).
- `rendering/mist/` — **ground fog sheets** (`GroundFogLayer`), **vertical haze curtains** (`VolumetricFogCurtains`), and secondary **particle grain** (`MistParticles`), tuned with scene fog and minimum fog near the player/lantern.
- Root-level files such as **`Atmosphere.tsx`** — scene-wide lighting / fog / background setup driven by config.

**Rule:** If it is about “how it looks” and reused across scenes, it probably belongs in `rendering/`.

### `systems/`

Cross-cutting orchestration that coordinates multiple features (thin early on). Prefer small modules with explicit interfaces.

**Rule:** If it is not a feature and not purely rendering, but still “engine glue,” `systems/` is the default.

### `entities/`

Reusable entity definitions / prefab-style composition (props, default state, grouping conventions).

### `components/`

Reusable React / R3F building blocks that are **generic** (not owned by a single feature).

### `core/`

Stable primitives with **no gameplay meaning**: clocks, typed events, small utilities that should not depend on Three/React when possible.

**Rule:** `core/` should remain boring and dependency-light.

### `hooks/` and `utils/`

- `hooks/`: reusable React hooks.
- `utils/`: pure functions (math, formatting). **No Three imports** unless unavoidable.

### `assets/`

Logical buckets for **referenced art** (paths, manifests). Actual binary files may live here or in `public/` depending on loading strategy.

## Server (`apps/server/src`)

- `routes/` — HTTP route handlers.
- `middleware/` — cross-cutting HTTP concerns.
- `db/` — database access and migrations (when added).
- `config/` — environment and service configuration.

**Rule:** Do not add database logic until a frontend vertical slice requires persistence.

## Explicit non-goals (for early milestones)

Do **not** add early unless the milestone demands it:

- Multiplayer / replication
- Authentication
- Inventory / crafting / skill trees
- Quest engines / dialogue trees
- Save/load cloud sync
- Combat frameworks
- Heavy ECS frameworks

## Success check for “clean growth”

A change is well-placed if:

1. A reviewer can predict the folder from the feature name.
2. Deleting one feature folder does not orphan unrelated gameplay.
3. `scenes/` stays thin and readable.
