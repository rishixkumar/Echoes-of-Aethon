# 2026-05-22 — Map validation, seeded RNG, linear generation, and template variety (Steps 5–8)

> Short changelog covering Iteration 3 foundation steps before branching procedural generation.

## Summary

| Step | Focus | Player-visible change |
|------|--------|------------------------|
| **5** | Strong map validation | None (safety net) |
| **6** | Seeded random utility | None (determinism foundation) |
| **7** | Linear map generator | **Yes** — scene now uses a 5-room east/west chain |
| **8** | Template variety pools | **Yes** — connector/objective sizes vary by seed |

Steps 5–6 intentionally kept gameplay looking the same. Steps 7–8 are where visual variety appears.

---

## Step 5 — Map validation

**Files:** `data/validateMapDefinition.ts`, `graph/validateRoomGraph.ts`

- **`MapValidationResult`** now uses `valid / errors / warnings` plus **`createValidationResult`** helper.
- **Data validation** checks templates, duplicate room IDs, connection integrity, self-connections, doorway override mismatches, room AABB overlap, start/objective/exit requirements, gate/objective ID references, and merges graph validation at the end.
- **Graph validation** owns opposite directions, one connection per side, BFS reachability, and shortest start → objective path.
- **`assertValidMapDefinition`** throws on errors; logs warnings in dev only.

---

## Step 6 — Seeded random

**File:** `data/seededRandom.ts`

- **`createSeededRandom(seed)`** — mulberry32 PRNG with `next`, `range`, `int`, `bool`, `pick`, `shuffle`.
- **`assertSeededRandomDeterminism()`** — dev self-test (same seed → same sequence).
- No `Math.random()` inside `features/map-generation/`.

---

## Step 7 — Linear map generation

**File:** `data/generateLinearMap.ts`

- **`generateLinearMap({ seed, roomCount })`** builds: **Start → Connector(s) → Objective → Exit**.
- `roomCount` = total rooms (minimum **3** = Start → Objective → Exit).
- Default prototype: **`seed: "dev-seed"`, `roomCount: 5`** via `PROTOTYPE_LINEAR_MAP_OPTIONS` in `mapSceneUtils.ts`.
- Positions computed with **`getEastNeighborX`** + `MAP_CONFIG.connection.defaultCorridorLength` (3 m).
- Template picks use seeded RNG; room/connection IDs are deterministic.
- Runs **`assertValidMapDefinition`** before return; dev logs `[linear-map]` + room graph.

**Scene wiring**

- `FIXED_PROTOTYPE_MAP` now comes from **`generateLinearMap`** (name kept for minimal churn).
- `prototypeSceneConfig`, `interactableRegistry`, collision, and `PrototypeScene` read from the generated map.
- Gate is **optional** (linear templates have no gate); exit zone lives in the **exit room**.

---

## Step 8 — Room template variety

**File:** `data/roomTemplates.ts`

| Pool | Template IDs |
|------|----------------|
| Start | `start-room-basic` |
| Connector | `small-connector-room`, `wide-connector-room`, `long-hall-room` |
| Objective | `objective-room-a`, `objective-room-b` |
| Exit | `exit-room-basic` |

- Connector templates use **`doorways: []`** — openings come from graph connections only.
- Start room includes **`regular-echo-orb`**; objective rooms include **`ancient-echo-orb`**; exit room includes **`prototype-exit-zone`**.
- Legacy **`prototype-*`** templates retained for `generateFixedPrototypeMap()`.
- TODO noted: namespace object IDs when templates repeat across rooms.

---

## Manual QA checklist

1. Dev console shows `[linear-map] seed=dev-seed, roomCount=5` and 5-room graph.
2. Walk Start → connectors → objective → exit; no void walk-off.
3. Ancient Echo Orb in objective room; regular Echo Orb in start room; exit zone in exit room.
4. Refresh — same layout with `dev-seed`.
5. Change `PROTOTYPE_LINEAR_MAP_OPTIONS.seed` to `dev-seed-002` — template/spacing may change.
6. Restore `dev-seed` — original layout returns.

---

## Verification

- `npm run build -w web` — passing when this note was written.
- Linear map validation passes for `dev-seed` / `roomCount: 5`.

---

## Not implemented yet

Branching maps, weighted pools, lock DAGs, Kruskal/Prim, A*, enemy/loot placement, `GeneratedRoomObjects`, or server-side generation.
