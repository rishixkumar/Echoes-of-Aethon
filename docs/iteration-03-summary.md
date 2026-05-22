# Iteration 3 — Data-driven maps, room graph, procedural generation, and sealed corridors

**Project:** Echoes of Aethon  
**Client stack:** React 19, TypeScript 5.9, Vite 7, Three.js **r181**, React Three Fiber 9, Drei 10, Zustand 5.0.13  
**Scope (this iteration):** Replace the single authored slab with a **data-driven** multi-room **`MapDefinition`**: connection-aware wall shells, **outer-skin** wall math, **full-depth connection corridors** (floor + side barriers + colliders), a **pure TypeScript room graph** (build, validate, BFS/shortest path), **deterministic seeded RNG**, **linear** and **branching** procedural generators, and scene wiring so the prototype **spawns, objectives, gates, and exit** track generated room positions. **Not** shipped: locked doors as a design system, combat, minimap, maze algorithms (Prim/Kruskal), save/load, physics engine.

Granular dated notes and postmortems live under [`changes.md/Iteration 3 - Map Creation/`](../changes.md/Iteration%203%20-%20Map%20Creation/). This document is the **consolidated engineering narrative**: architecture, quantitative geometry, failure modes, and verification.

---

## Repository tree (tracked layout, `apps/web` emphasis)

Logical tree for Iteration 3 work (plus unchanged siblings). Paths relative to repo root.

```text
EchoesOfAethon/
├── apps/web/src/
│   ├── features/
│   │   ├── map-generation/
│   │   │   ├── index.ts                 # public barrel
│   │   │   ├── data/                    # MapDefinition, templates, RNG, generators, validation
│   │   │   ├── graph/                   # room graph, traversal, graph validation
│   │   │   ├── geometry/                # walls, doorways, corridors, placement
│   │   │   ├── rendering/               # GeneratedMap, Room, Doorway, ConnectionBridge
│   │   │   └── collision/               # map-derived wall rects
│   │   ├── collision/staticColliders.ts # merges map rects + gameplay circles
│   │   ├── interaction/interactableRegistry.ts
│   │   └── … (player, camera, objectives unchanged in role)
│   └── scenes/
│       ├── PrototypeScene.tsx
│       └── prototypeSceneConfig.ts      # derives positions from FIXED_PROTOTYPE_MAP
├── changes.md/Iteration 3 - Map Creation/
├── docs/
│   ├── architecture-rules.md
│   ├── iteration-01-summary.md
│   ├── iteration-02-summary.md
│   └── iteration-03-summary.md          # (this file)
└── packages/shared/
```

**Reasoning:** Map authoring, graph reasoning, mesh/collider math, and R3F mounting stay **separate** so agents can change layout algorithms without breaking React keys or collision contracts.

---

## What Iteration 3 delivered (narrative)

Iteration 1 proved **movement** on a bounded floor; Iteration 2 proved **interaction + objectives + atmosphere**. Iteration 3 proves that **levels can be data**: multiple `PlacedRoom` instances, each from a **`RoomTemplate`**, connected by **`RoomConnection`** edges. Walls are not hand-placed cubes per level; they are **synthesized** from template dimensions and **effective doorways** (connections plus optional template overrides for width/lock/gate).

Between rooms, the engine does not rely on a **narrow doorway slab** alone. It builds a **corridor** volume: **floor** spanning the gap in the primary axis, **barrier walls** on the orthogonal axis (north/south barriers for east/west links; west/east barriers for north/south links), and the **same rects** fed into **static collision** and camera obstruction so the player cannot **walk off into the void**.

On top of layout **data**, Iteration 3 adds a **graph layer** (`buildRoomGraph`, `validateRoomGraph`, reachability helpers) so validation can assert **one connection per side**, **opposite directions on an edge**, **connectivity**, and **no overlapping room AABBs** in world space.

Finally, **procedural** maps are introduced with **determinism**: `createSeededRandom(seed)` drives template picks and branch choices. **`generateLinearMap`** keeps a strict **east/west spine** for baseline QA; **`generateBranchingMap`** adds **north/south** optional branches from main-path **connector** rooms while preserving solvability of the main line.

---

## Algorithms and mathematical models

Expressions use **plain `text` fences** so they render everywhere (Cursor, GitHub without math).

### 1. Room outer skins in world space (axis-aligned, rotation Y = 0)

Templates store **`width`**, **`depth`**, **`wallThickness` `t`**. For a room with center **`(cx, cy, cz)`**:

```text
East outer X  = cx + width/2 + t/2
West outer X  = cx - width/2 - t/2
South outer Z = cz + depth/2 + t/2
North outer Z = cz - depth/2 - t/2
```

Implemented as `getOuterWallX`, `getOuterWallZ` in `geometry/mapDoorwayPlacement.ts`.

**Reasoning:** Corridors must span **outer skins** so the floor and barriers meet the rendered wall volumes without leaving a seam into void.

### 2. East/west corridor interval (full Z overlap)

For an edge **from west → east** (from’s east face connects to to’s west face):

```text
minX = EastOuterX(from)
maxX = WestOuterX(to)
```

Require **`maxX > minX`**. Across the corridor’s length, Z is bounded by the **overlap** of the two rooms’ Z spans (each room: **`[cz - depth/2, cz + depth/2]`**):

```text
minZ = max(Zmin(from), Zmin(to))
maxZ = min(Zmax(from), Zmax(to))
```

Require **`maxZ > minZ`**. Barrier walls are thin slabs on the **north** and **south** edges of that floor rectangle (expanded by **`visualOverlap`** for clean joins).

**Reasoning:** Using **Z overlap** prevents a “bridge” that is wide in X but **paper thin** in Z (the dominant failure mode for walk-off beside doorways).

### 3. North/south corridor interval (full X overlap)

For a **south** step from **`fromRoom`** to **`toRoom`** (`to` has larger **`cz`**), the corridor spans Z from **`SouthOuterZ(from)`** to **`NorthOuterZ(to)`**:

```text
minZ = SouthOuterZ(from)
maxZ = NorthOuterZ(to)
```

For a **north** step (`to` has smaller **`cz`**):

```text
minZ = SouthOuterZ(to)
maxZ = NorthOuterZ(from)
```

Always require **`maxZ > minZ`**. X bounds use **overlap** of the two rooms’ X spans:

```text
minX = max(Xmin(from), Xmin(to))
maxX = min(Xmax(from), Xmax(to))
```

Barrier walls sit on **west** and **east** edges of the floor patch.

**Reasoning:** This is symmetric to (2) with axes swapped. A **bug in Iteration 3 Step 9** swapped **`minZ`/`maxZ`** once, causing **`maxZ <= minZ`** always → **`null`** corridor → **missing floor and barriers** for all north/south links (see postmortem in `changes.md`).

### 4. Linear map room centers (algorithmic spacing, not grid)

`generateLinearMap` places the start at **`x = 0`** and each next room to the **east** so the **gap between outer skins** equals a configured **`corridorLength`**:

```text
nextCx = prevCx + prevWidth/2 + nextWidth/2 + corridorLength
```

**Reasoning:** Rooms have **different widths**; equal **grid** spacing would either overlap or waste space. The linear generator uses **closed-form** neighbor placement.

### 5. Branching map — grid placement and world spacing

`generateBranchingMap` places the **main path** on **`gz = 0`**, **`gx = 0 … mainPathRoomCount-1`**. Branch steps move **`gz ± 1`** (north/south only). World position:

```text
worldX = gx · spacing.x
worldZ = gz · spacing.z
spacing.x = spacing.z = defaultCorridorLength + 20   (conservative early constant)
```

**Occupancy:** a **`Set`** keyed by **`"gx,gz"`** rejects overlapping rooms.

**Reasoning:** Branches are **sparse** and **orthogonal** to the spine; a coarse grid avoids intersection tests until templates are sized per-edge.

### 6. Seeded RNG (reproducibility)

`createSeededRandom` uses a string hash → **Mulberry32** state; consumers call **`pick`**, **`shuffle`**, **`int`**, etc.

**Reasoning:** Same **`seed`** + same options ⇒ same graph for **QA bisect**, **screenshot tests**, and **LLM handoff**.

### 7. Wall slabs and doorway subtraction

`buildWallSlabsForRoom` computes axis-aligned **outer skin** segments and subtracts **doorway intervals** where connections (or template overrides) open the shell.

**Reasoning:** Keeps **one source of truth**: if the graph says there is a door to the east, both **mesh** and **collision** agree.

---

## Configuration numbers worth remembering

| Quantity | Typical / default | Where |
|----------|-------------------|--------|
| Default corridor length (linear gap) | `MAP_CONFIG.connection.defaultCorridorLength` | `data/mapConfig.ts` |
| Branch grid spacing | `defaultCorridorLength + 20` (both axes) | `generateBranchingMap.ts` |
| Wall height / thickness / overlap | Template `roomShell` + `MAP_CONFIG.wall` | `roomTemplates.ts`, `mapConfig.ts` |

---

## Issues, pitfalls, and design corrections (cross-reference)

| Topic | Where to read |
|--------|----------------|
| Connector “missing walls,” thin bridges, React **`key`** overwrite, `GeneratedMapCollider` typing | [`changes.md/…/multiRoomConnectorsCorridorWallsPostmortem-20260522.md`](../changes.md/Iteration%203%20-%20Map%20Creation/multiRoomConnectorsCorridorWallsPostmortem-20260522.md) |
| Single-room gate / outer-skin seam | [`changes.md/…/prototypeRoomWallGapPostmortem-20260522.md`](../changes.md/Iteration%203%20-%20Map%20Creation/prototypeRoomWallGapPostmortem-20260522.md) |
| Refactor + room graph + validation + linear/templates | [`changes.md/…/steps5Through8ValidationLinearMapTemplates-20260522.md`](../changes.md/Iteration%203%20-%20Map%20Creation/steps5Through8ValidationLinearMapTemplates-20260522.md) |
| **Step 9** branching + **north/south corridor null** fix | [`changes.md/…/step9BranchingMapGenerationPostmortem-20260522.md`](../changes.md/Iteration%203%20-%20Map%20Creation/step9BranchingMapGenerationPostmortem-20260522.md) |

**Design stance:** Optional branches must not break **main-path solvability**; **loops**, **keys**, and **combat** are explicitly deferred.

---

## Verification

```bash
npm install
npm run build -w web
npm run dev -w web
```

**Manual:** Spawn in start; follow east/west chain to objective and exit; enter each north/south branch; confirm **corridor floors and side barriers**; confirm **no void walk-off**; change branching **seed** and confirm layout changes then reverts when restored.

---

## Where to read next

| Document | Role |
|----------|------|
| [`changes.md/Iteration 3 - Map Creation/README.md`](../changes.md/Iteration%203%20-%20Map%20Creation/README.md) | Index of Iteration 3 logs |
| [`docs/architecture-rules.md`](./architecture-rules.md) | Folder boundaries (`map-generation` split) |
| [`docs/iteration-02-summary.md`](./iteration-02-summary.md) | Prior iteration: interactions, objectives, atmosphere |

---

*Iteration 3 establishes the map pipeline contract; Iteration 4+ is expected to tighten content tooling (namespaced object ids per room), richer locking, and tighter spacing from template bounds instead of fixed grid constants.*
