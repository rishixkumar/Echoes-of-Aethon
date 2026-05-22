# Iteration 2 — Player interactions, world state, and readable atmosphere

**Project:** Echoes of Aethon  
**Client stack:** React 19, TypeScript 5.9, Vite 7, Three.js **r181**, React Three Fiber 9, Drei 10, Zustand 5.0.13  
**Scope (this iteration):** Turn the Iteration 1 sandbox into a **small vertical slice of gameplay UX**: proximity interaction, multi-object registry, persistent toggles, a minimal objective + gate, lightweight collision, and **presentation** (labels, scene atmosphere, player-carried lighting) without shipping inventory, dialogue trees, save/load, or a physics engine.

Granular dated notes (commands, file lists, QA checklists) live under [`changes.md/Iteration 2 - Player Interactions/`](../changes.md/Iteration%202%20-%20Player%20Interactions/). This document is the **consolidated engineering narrative**: what changed, why, and the quantitative models behind it.

---

## Repository tree (tracked layout, `apps/web` emphasis)

Below is the **logical** tree of what Iteration 2 actually touches (plus sibling scaffolding). Paths are relative to the repo root.

```text
EchoesOfAethon/
├── apps/
│   ├── server/                    # Express shell (unchanged this iteration)
│   └── web/
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           ├── app/App.tsx
│           ├── main.tsx
│           ├── index.css
│           ├── components/
│           │   └── world-labels/WorldLabel.tsx
│           ├── rendering/
│           │   ├── Atmosphere.tsx
│           │   └── atmosphereConfig.ts
│           ├── scenes/
│           │   ├── PrototypeScene.tsx
│           │   └── prototypeSceneConfig.ts
│           └── features/
│               ├── collision/     # XZ circle colliders + gate gating
│               ├── interaction/   # registry, renderer, HUD store, TestInteractable
│               ├── objectives/    # registry, Zustand, ObjectiveHud
│               ├── player/        # movement, store, keyboard, PlayerAura
│               ├── ui/GameHud.tsx
│               ├── world-objects/EchoGate.tsx
│               └── world-state/worldStateStore.ts
├── changes.md/
│   ├── README.md
│   └── Iteration 2 - Player Interactions/
│       ├── README.md
│       ├── 2026-05-22-interaction-foundation.md
│       ├── 2026-05-22-persistent-interaction-state.md
│       └── 2026-05-22-atmosphere-world-labels.md
├── docs/
│   ├── architecture-rules.md
│   ├── iteration-01-summary.md
│   └── iteration-02-summary.md   # (this file)
└── packages/shared/
```

**Reasoning:** Feature code stays under `features/*`; scene assembly stays thin in `scenes/*`; shared Three presentation that is not tied to one gameplay feature (`Atmosphere`) sits in `rendering/*`; DOM HUD pieces stay in `features/ui` and `features/objectives`.

---

## What Iteration 2 delivered (narrative)

Iteration 1 proved **camera-relative locomotion** on a bounded slab. Iteration 2 adds the first **interaction loop**: the engine knows where the player is each frame, which interactable disk they stand inside, and which single object “owns” focus when disks overlap. Pressing **E** mutates **persistent** world state (not a one-shot animation), which in turn can **complete objectives idempotently** and **remove a blocking gate** from both rendering and collision.

On top of that, the prototype gained **readability**: HTML labels billboards in world space, a centralized atmosphere (background + linear fog + layered lights), and a **dual point-light “lantern”** rig with a tiny emissive mesh—so local illumination reads as light transport, not as a flat UI decal on the floor.

Out of scope (explicitly deferred): inventory, dialogue, full physics, particles, shaders, day/night, backend persistence.

---

## Algorithms and mathematical models

These expressions use **plain `text` fences and Unicode** so they stay readable in *any* Markdown preview (Cursor, GitHub without math, etc.). Optional: GitHub web and VS Code with **Markdown › Math** can also render LaTeX if you paste equivalent `$…$` / `$$…$$` elsewhere.

### 1. Camera-relative steering on the XZ plane

Each frame the controller reads the camera world direction `v_c`, **projects** it onto the horizontal plane (zero the Y component, then normalize):

```text
v_xz = normalize( [ v_c.x, 0, v_c.z ] )
```

(with a fallback axis if ‖v_xz‖ is below a numerical epsilon). **Right** is `r = v_xz × u` with world up `u = (0, 1, 0)`, normalized. Input axes combine into a **desired horizontal velocity** `v_d` capped at configured `speed` (4 m/s in `PLAYER_MOVEMENT_CONFIG`).

**Reasoning:** With `OrbitControls`, world-fixed WASD feels wrong; camera-relative steering matches exploration mental models and keeps controls stable as the inspection camera orbits.

### 2. Frame-rate–stable exponential smoothing (velocity)

Instead of snapping velocity to the input vector, horizontal velocity `v` **lerps** toward `v_d` each frame with smoothing factor

```text
k(Δt) = 1 - exp( -λ · Δt )
```

where λ = `PLAYER_MOVEMENT_CONFIG.response` (10 s⁻¹) and Δt is R3F’s frame delta. Implementation: `velocity.current.lerp(desired, k)`.

**Reasoning:** This is a **first-order low-pass** on velocity; k scales automatically with Δt, so response is stable at 60 Hz vs 120 Hz unlike naive `lerp(a, b, fixedAlpha)`.

### 3. Axis-aligned slab bounds with capsule inset

Let floor half-extent be H = 6 (12 m floor). Capsule foot radius r = 0.35. Valid center positions satisfy:

```text
x ∈ [ -H + r ,  H - r ]     z ∈ [ -H + r ,  H - r ]
```

If a clamp fires on an axis, that axis’s velocity is zeroed (inelastic contact with invisible walls).

**Reasoning:** Prevents the mesh from visually intersecting the slab edge while keeping math O(1).

### 4. Proximity selection — horizontal disk + argmin distance

For interactable i at (x_i, z_i) with radius R_i, planar distance:

```text
d_i = sqrt( (p_x - x_i)² + (p_z - z_i)² )
```

Eligible set **{ i | d_i ≤ R_i }**. If multiple disks overlap, the engine picks

```text
i* = argmin over { i : d_i ≤ R_i } of d_i
```

(`pickNearestInteractable` in `interactableRegistry.ts`).

**Reasoning:** Overlapping interaction radii are deterministic; nearest wins, which matches player expectation when two prompts could otherwise fight.

### 5. Static collision — circle–circle overlap on XZ

Player treated as circle radius r_p at (p_x, p_z); static collider j radius r_j at (x_j, z_j). Overlap predicate:

```text
sqrt( (p_x - x_j)² + (p_z - z_j)² )  <  r_p + r_j
```

If true after proposing a move, **revert** to previous (x, z) and zero horizontal velocity (hard rejection, no penetration resolution).

**Reasoning:** No physics engine yet; circle–circle is cheap, stable, and good enough for prototype pillars and gate blocking. The collider list is **dynamic**: the gate’s circle is omitted once `unlocksWhen` interactable is activated (`getCollidersForPlayer`).

### 6. Linear depth fog (Three.js `Fog`)

Linear fog mixes the fragment toward fog color based on eye-space depth z:

```text
f = clamp( (z_far - z) / (z_far - z_near) , 0 , 1 )
```

Current tuned endpoints: `near = 4`, `far = 16` (see `atmosphereConfig.ts`).

**Reasoning:** Hides mid-distance emptiness and reinforces depth without custom shaders; pairs with non-black **albedo** so lit regions still respond to point lights.

### 7. Player lantern flicker — quasi-periodic intensity modulation

Two incommensurate angular frequencies ω₁ = 9 rad/s, ω₂ = 17 rad/s on elapsed time t:

```text
F(t) = 1 + 0.08·sin(ω₁·t) + 0.04·sin(ω₂·t)
```

Core and fill point-light intensities scale as I_core = 4.5 · F(t), I_fill = 1.4 · F(t).

**Reasoning:** A single sine reads as mechanical breathing; two terms approximate **non-repeating flame/lamp shimmer** while staying bounded (≈ [0.88, 1.12] on the multiplicative factor before clamping by engine).

### 8. Billboard DOM labels (Drei `<Html sprite />`)

World labels use Drei’s `Html` with `sprite` so the attached CSS plane **always faces the active camera**, while anchor positions remain in world space. Per-variant `distanceFactor` maps screen size vs camera distance (empirically tuned 10–12 in `WorldLabel.tsx`).

**Reasoning:** Cheap, readable prompts without custom shader billboards; acceptable tradeoff: DOM cost per label, not for thousands of instances.

---

## Configuration numbers worth remembering

| Quantity | Typical value | Where |
|----------|----------------|--------|
| Floor size | 12 m (`size`), half-extent 6 | `prototypeSceneConfig.ts` |
| Move speed | 4 | `playerMovementConfig.ts` |
| Velocity smoothing λ | 10 | `playerMovementConfig.ts` |
| Capsule radius r, cylinder length | 0.35, 0.9 | `playerMovementConfig.ts` |
| Interactable default horizontal radius | 1.5 | `interactableRegistry.ts` entries |
| Collider radius (XZ) | 0.75 | same |
| Gate collider radius | 1.3 | `prototypeSceneConfig.gate` |
| Core lantern (warm) | distance 5.5, decay 1.35 | `PlayerAura.tsx` |
| Fill (magenta) | distance 8, decay 1.8 | `PlayerAura.tsx` |

---

## Issues, pitfalls, and design corrections encountered

1. **Wrong relative import depth** — `playerMovementConfig.ts` must import `PROTOTYPE_SCENE_CONFIG` via `../../scenes/...` from `features/player/`, not `../scenes/...` (one `..` short resolves outside `src`). Documented in Iteration 2 README.

2. **Atmosphere vs albedo** — A vivid `scene.background` plus fog does not tint large fills of near-black `meshStandardMaterial`; iteration moved albedo off pitch-black and increased hemisphere / fill lighting so **diffuse response** carries the palette when the camera zooms in.

3. **“Decal” vs light** — An early ground `meshBasicMaterial` disk read as a **texture sticker** with weak physical correlation to shading. Replaced by **real point lights** + small emissive lantern mesh so brightness on floor/walls follows inverse falloff and surface BRDF parameters.

4. **Build hygiene** — `npm run build -w web` succeeds; Vite may warn that the JS chunk exceeds **500 KB** after minification (Three + R3F bundle mass). Informational only until code-splitting.

5. **Documentation drift** — One early persistent-state note referred to gate unlock wiring vs orb id; the repo’s source of truth is `prototypeSceneConfig.gate.unlocksWhen` aligned with `GATE_ORB_ID` in the registry. Always trust TypeScript + config over stale prose.

---

## Verification

```bash
npm install
npm run build -w web
npm run dev -w web
```

Manual: WASD + bounds; overlap gate until objective orb activated; **E** toggles persistent interactables; nearest interactable owns HUD + labels; orbit camera preserves label readability; player lantern pool visibly lights nearby `meshStandardMaterial` surfaces.

---

## Where to read next

| Document | Role |
|----------|------|
| [`changes.md/Iteration 2 - Player Interactions/README.md`](../changes.md/Iteration%202%20-%20Player%20Interactions/) | Chronological handoff index + file table |
| [`docs/architecture-rules.md`](./architecture-rules.md) | Where new systems should live |
| [`docs/iteration-01-summary.md`](./iteration-01-summary.md) | Movement + repo bootstrap predecessor |

---

*Iteration 2 is a living milestone: gameplay systems remain prototype-grade; Iteration 3+ is expected to harden contracts (save format, richer interaction graph, content pipeline).*
