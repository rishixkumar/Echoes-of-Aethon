# 2026-05-22 — Iteration 3 Step 9: Branching map generation + north/south corridor postmortem

> **Audience:** future contributors and agents touching `generateBranchingMap`, `mapRoomConnectors`, `GeneratedConnectionBridge`, or `getConnectionCorridorColliders`.  
> **Scope:** first **branching** procedural `MapDefinition` (main path east/west, optional north/south branches), scene wiring, and a **geometry bug** that silently dropped all north/south corridor shells until fixed.

---

## Table of contents

1. [Goal of Step 9](#1-goal-of-step-9)
2. [What shipped](#2-what-shipped)
3. [Symptoms — “I can see the whole map through the corridor”](#3-symptoms--i-can-see-the-whole-map-through-the-corridor)
4. [Root cause — swapped `minZ` / `maxZ` in `buildNorthSouthCorridor`](#4-root-cause--swapped-minz--maxz-in-buildnorthsouthcorridor)
5. [Why east/west looked fine](#5-why-eastwest-looked-fine)
6. [Fix](#6-fix)
7. [Secondary observation — console logs from two maps](#7-secondary-observation--console-logs-from-two-maps)
8. [Verification checklist](#8-verification-checklist)
9. [Related files](#9-related-files)

---

## 1. Goal of Step 9

Expand beyond a single **linear** chain:

```text
Start → Connector → … → Objective → Exit
```

into layouts where **optional** side rooms attach **north or south** from eligible main-path connectors, while:

- the **main path stays solvable** (start → objective → exit);
- **no room overlaps** (grid occupancy set);
- **no disconnected rooms** (every branch is a tree edge off the main spine);
- **no duplicate use of the same wall** for two different connections (direction reservation before branching);
- **corridors** between any two connected rooms still get **floor + side barrier walls + colliders** (same contract as the east/west corridor postmortem).

**Explicitly out of scope for Step 9:** locked doors, keys, combat, minimap, biomes, decoration generators, maze algorithms (Kruskal/Prim), A\*, intentional loops.

---

## 2. What shipped

| Area | Detail |
|------|--------|
| **Generator** | `apps/web/src/features/map-generation/data/generateBranchingMap.ts` — `GenerateBranchingMapOptions`, `generateBranchingMap()`. |
| **Templates** | `BRANCH_ROOM_TEMPLATE_IDS` in `roomTemplates.ts` (reuses connector templates for now). |
| **Scene** | `mapSceneUtils.ts`: `PROTOTYPE_BRANCHING_MAP_OPTIONS`, `FIXED_PROTOTYPE_MAP = generateBranchingMap(...)`. `FIXED_LINEAR_MAP` kept for comparison. |
| **Exports** | `index.ts` re-exports `generateBranchingMap`. |
| **Corridor fix** | `geometry/mapRoomConnectors.ts` — correct Z interval for north/south links (see below). |

Determinism: same `seed` + same numeric options → same room graph and template picks (Mulberry32 PRNG in `seededRandom.ts`).

---

## 3. Symptoms — “I can see the whole map through the corridor”

After branching landed:

- Walking toward a **branch** connector felt like a **void** or a **huge gap** with **no floor slab** and **no east/west barrier walls** along the run.
- The player could **step off** into black space and **see other rooms** “floating” at their true world offsets — not a lighting bug, but **missing inter-room corridor geometry**.
- **East/west** corridors along the main spine still looked **sealed** (those code paths had been exercised since the linear generator).

Console output from `generateBranchingMap` showed a coherent graph (e.g. `south→room-branch-001-001`), but the **rendered world** did not show the expected corridor volume between parent and child.

---

## 4. Root cause — swapped `minZ` / `maxZ` in `buildNorthSouthCorridor`

`buildConnectionCorridors` dispatches on connection direction pairs. For:

```text
fromDirection === 'south' && toDirection === 'north'
```

it calls `buildNorthSouthCorridor(..., fromDir: 'south')`.

**World convention in this codebase:** “north” means **decreasing Z**; “south” means **increasing Z** (see `getOuterWallZ` in `mapDoorwayPlacement.ts` and `stepCoord` in `generateBranchingMap.ts`).

Outer skins in world Z:

```text
Z_north(room) = cz - halfDepth - t/2     // smaller Z
Z_south(room) = cz + halfDepth + t/2   // larger Z
```

For a **south** branch, `fromRoom` lies **north** of `toRoom` (smaller `cz`). The corridor volume between them spans **from** the **south outer skin of `fromRoom`** **to** the **north outer skin of `toRoom`**:

```text
minZ = Z_south(fromRoom)
maxZ = Z_north(toRoom)
```

For a **north** branch, `toRoom` lies **north** of `fromRoom` (smaller `cz` on `toRoom`). The facing pair is **`toRoom` south** … **`fromRoom` north**:

```text
minZ = Z_south(toRoom)
maxZ = Z_north(fromRoom)
```

In both cases, valid placement yields **`minZ < maxZ`**.

**Buggy code** swapped the assignments so that **`maxZ <= minZ`** for every valid link. The guard `if (maxZ <= minZ) return null` then fired **always**, `buildNorthSouthCorridor` returned **`null`**, and `buildConnectionCorridors` **never appended** a corridor for north/south connections.

Downstream:

- `GeneratedConnectionBridge` had nothing to render for that edge → **no floor slab, no east/west barriers**.
- `getConnectionCorridorColliders` saw no rects for those edges → **no collision blocking the void**.

The **room graph and validation** could still be correct; only the **corridor builder** refused to instantiate geometry.

---

## 5. Why east/west looked fine

`buildEastWestCorridor` / `buildWestEastCorridor` compute:

```text
minX = outer face of one room
maxX = outer face of the other
```

with ordering already consistent with **min < max** for typical placements. Those paths were written and tested when only **linear** maps existed. **North/south** was added for branching but the Z endpoints were **mirrored**, so the guard clause `if (maxZ <= minZ) return null` tripped **100%** of the time for valid south/north and north/south links.

---

## 6. Fix

In `buildNorthSouthCorridor`, assign **`minZ` / `maxZ`** so that for each `fromDir`:

| `fromDir` | `minZ` (smaller world Z) | `maxZ` (larger world Z) |
|-----------|--------------------------|-------------------------|
| `north` | `getOuterWallZ(toRoom, 'south')` | `getOuterWallZ(fromRoom, 'north')` |
| `south` | `getOuterWallZ(fromRoom, 'south')` | `getOuterWallZ(toRoom, 'north')` |

Then `minX`/`maxX` continue to use the **overlap of room X spans** (same as east/west corridors use Z overlap): `minX = max(fromX.min, toX.min)`, `maxX = min(fromX.max, toX.max)`.

Inline comments were added in source to document the north/negative-Z convention so the next editor does not “fix” it back.

---

## 7. Secondary observation — console logs from two maps

DevTools may show **both**:

```text
[branching-map] ...
[linear-map] ...
```

because `mapSceneUtils.ts` instantiates **`FIXED_PROTOTYPE_MAP`** (branching) and also **`FIXED_LINEAR_MAP`** (linear snapshot for comparison). Both generators run at module load in development. This is **not** a bug in the branching algorithm; trim or lazy-init linear if log noise becomes distracting.

---

## 8. Verification checklist

- [ ] `npm run build -w web` passes.
- [ ] Spawn in start; walk main path to objective and exit.
- [ ] Enter **each** branch; confirm **floor** and **east/west** barriers along the branch connector.
- [ ] No walk-off into void beside those corridors.
- [ ] Change `PROTOTYPE_BRANCHING_MAP_OPTIONS.seed`; layout changes; revert seed → layout reverts.

---

## 9. Related files

| File | Role |
|------|------|
| `data/generateBranchingMap.ts` | Branching procedural `MapDefinition`. |
| `geometry/mapRoomConnectors.ts` | `buildConnectionCorridors`, `buildNorthSouthCorridor` fix. |
| `rendering/GeneratedConnectionBridge.tsx` | Renders corridor floor + side walls. |
| `collision/mapCollision.ts` | `getConnectionCorridorColliders`. |
| [`multiRoomConnectorsCorridorWallsPostmortem-20260522.md`](multiRoomConnectorsCorridorWallsPostmortem-20260522.md) | East/west corridor shell + React key + typing story. |

---

*Step 9 closes the loop: branching topology is only “real” to the player when **every** edge in `MapDefinition.connections` has a consistent **geometry + collision** representation.*
