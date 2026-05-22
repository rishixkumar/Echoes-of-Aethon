# Iteration 1 — Project initialization & prototype playground

**Project:** Echoes of Aethon  
**Scope:** Establish repository, tooling, documentation, and a **minimal 3D sandbox** (ground + lighting + orbit camera + bounded **camera-relative** player).  
**Out of scope for this iteration:** Echo Dive, puzzles, interactions, persistence, multiplayer, physics engines, combat, inventory, backend APIs beyond package scaffolding.

---

## What “done” means for Iteration 1

| Area | Outcome |
|------|---------|
| **Repository** | Isolated Git repo at project root; pushed to GitHub `main`. |
| **Layout** | npm workspaces monorepo: `apps/web`, `apps/server`, `packages/shared`; feature-first `src` tree under the client. |
| **Client boot** | Vite + React + TypeScript runs; production build succeeds. |
| **3D baseline** | R3F canvas: lights, shadows, 12×12 ground, `OrbitControls`. |
| **Character prototype** | Capsule “player,” WASD movement, **camera-relative** XZ motion, **axis-aligned world bounds** aligned to the ground slab. |
| **Process** | Architecture rules for contributors; session logs under `changes.md/`; this iteration summary. |

---

## Workflow (how the work unfolded)

### 1. Structure before behavior

Defined a **monorepo skeleton** so gameplay can grow by feature instead of one flat `src` dump:

- **`apps/web`** — game client (Vite, React, TS, Three.js, React Three Fiber, Drei).
- **`apps/server`** — Express placeholder for later persistence (no runtime entry wired yet).
- **`packages/shared`** — reserved for shared types when client/server actually overlap.

Inside `apps/web/src`, the important buckets are:

- **`features/*`** — gameplay domains (only `player` is implemented so far).
- **`scenes/`** — level assembly (currently `PrototypeScene`).
- **`rendering/`**, **`systems/`**, **`core/`**, etc. — staged for later systems.

Empty leaves were made Git-visible with **`.gitkeep`**, then replaced with real files as folders came alive.

### 2. Prove the render loop

Added the smallest **vertical slice for rendering**: HTML entry, Vite config, TS config, `Canvas`, a static scene (later replaced by the moving player), and **OrbitControls** so the space stays inspectable while systems are stubbed.

**Smoke test:** dev server responds; `npm run build -w web` bundles cleanly (Three bundle size warnings noted for later optimization).

### 3. Version control hygiene

Initialized **`.git` inside the game folder only** so the project does not accidentally attach to a parent user-level repository. Connected **`origin`** to the GitHub remote and pushed with a concise conventional commit message.

### 4. “Map” + character (prototype level)

- **Map:** single **12×12** ground plane, atmospheric lighting, dark backdrop — enough volume to validate movement and bounds.
- **Character:** **capsule** mesh; movement integrated in **`useFrame`**; **WASD** via `KeyboardEvent.code` with **blur / visibility** resets to avoid stuck keys when alt-tabbing.
- **Movement model:** **camera-relative** horizontal steering (W = toward flattened camera view direction), which matches exploration goals better than world-fixed “north forever” while OrbitControls remain the inspection camera.
- **Feel:** target velocity eases in with **frame-rate-stable exponential smoothing** (not raw on/off teleport stepping).

### 5. Playable area without physics

Added **`PLAYER_MOVEMENT_CONFIG`** (`speed`, `response`, `capsule`, **`bounds`**). Each frame: integrate velocity → proposed XZ → **clamp** to bounds → if an axis was clamped, **zero that velocity component**. Bounds match the **prototype floor half-extent (6)** and inset by **capsule radius** so the mesh stays visually on the slab.

---

## Stack (locked in for the client)

- **React** + **TypeScript** + **Vite**
- **three**, **@react-three/fiber**, **@react-three/drei**
- **npm workspaces** at repo root

---

## Where to read more

| Document | Role |
|----------|------|
| [`docs/architecture-rules.md`](./architecture-rules.md) | Where new code should live; early non-goals. |
| [`changes.md/README.md`](../changes.md/README.md) | How session logs are organized (also summarized on the root README). |
| [`changes.md/Iteration 1 - Init Project & Map/`](../changes.md/Iteration%201%20-%20Init%20Project%20&%20Map/) | Timestamped granular notes for Iteration 1 (audit trail). |
| [`docs/iteration-02-summary.md`](./iteration-02-summary.md) | Iteration 2 closeout: interactions, registry, objectives, atmosphere, math models. |
| [`docs/iteration-03-summary.md`](./iteration-03-summary.md) | Iteration 3 closeout: data-driven maps, room graph, procedural generators, corridors. |
| Root [`README.md`](../README.md) | Clone, install, dev/build commands. |

---

## Suggested entry point for Iteration 2

**Implemented:** See the consolidated engineering write-up [`docs/iteration-02-summary.md`](./iteration-02-summary.md) and granular logs under [`changes.md/Iteration 2 - Player Interactions/`](../changes.md/Iteration%202%20-%20Player%20Interactions/).

Original priority sketch (still directionally valid for later work):

1. **Interaction system** (look / use / trigger) — first real “world talks back” loop.
2. Begin separating **inspection camera** from a future **gameplay camera** once interactions need framing.
3. **Echo Dive** prototyping only after input + world feedback loops feel trustworthy.

---

## Commands (reference)

```bash
npm install
npm run dev          # runs the web workspace dev server
npm run build -w web # production build for the client
```

**Remote:** `https://github.com/rishixkumar/Echoes-of-Aethon`

---

*Iteration 1 closeout — consolidates structure, bootstrapping, GitHub setup, prototype scene, player movement, and world bounds. Granular dated notes remain in `changes.md/Iteration 1 - Init Project & Map/`.*
