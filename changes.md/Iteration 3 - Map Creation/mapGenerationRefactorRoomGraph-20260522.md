# 2026-05-22 — Map generation layout + room graph layer

> Short changelog (not a postmortem). For connector/wall issues see the two postmortems in this folder.

## Summary

- **Reorganized** `features/map-generation/` into **`data/`**, **`graph/`**, **`geometry/`**, **`rendering/`**, and **`collision/`**, with a root **`index.ts`** barrel so scenes and systems import from `map-generation` without deep paths.
- **Added a pure TypeScript room graph** on top of `MapDefinition.connections`: nodes = rooms, edges = bidirectional connections with `oppositeRoomId`, plus BFS reachability, shortest room path, and **`validateRoomGraph`** (dev-only logging in `generateFixedMap`; does not block runtime).
- **Wired** `getRoomAdjacency` through **`buildRoomGraph`** so doorway logic stays aligned with the graph (rebuild per call for now).
- **Docs:** `docs/architecture-rules.md` updated for the new layout; connector postmortem §11 file paths updated to match.

## New / moved highlights

| Area | Contents |
|------|-----------|
| `graph/` | `roomGraphTypes`, `roomGraph`, `graphTraversal` (BFS + shortest path), `validateRoomGraph`, `roomAdjacency`; `graphAlgorithms.ts` placeholder for future algorithms. |
| `data/` | Types, config, templates, fixed map, `mapSceneUtils`, `mapConnections`, validation. |
| `geometry/` | Wall slabs, corridors, doorway placement, `localToWorldPosition`. |
| `rendering/` | `GeneratedMap`, `GeneratedRoom`, `GeneratedDoorway`, `GeneratedConnectionBridge`. |
| `collision/` | `mapCollision` (room + corridor rects). |

## Constraints (unchanged behavior)

- Graph modules stay **free of React, Three.js, and Zustand**.
- **Rendering and collision** behavior unchanged from the player’s perspective; this step was architecture + validation + file tree clarity.

## Verification

- `npm run build -w web` — passing when this note was written.
