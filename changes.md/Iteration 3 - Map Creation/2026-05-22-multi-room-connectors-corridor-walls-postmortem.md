# 2026-05-22 — Multi-room connectors, corridor shells, and “missing walls”: postmortem

> **Audience:** future you, collaborators, and agents touching `map-generation`, `GeneratedRoom`, connection bridges/corridors, or `staticColliders`.  
> **Scope:** data-driven multi-room maps, connection-aware wall openings, thin inter-room gaps, React list identity, and TypeScript collider typing — **not** the single-room `PrototypeRoom` wall-gap story (see the sibling postmortem for outer-skin / gate Z).

---

## Table of contents

1. [Symptoms](#1-symptoms)
2. [Architecture we were building toward](#2-architecture-we-were-building-toward)
3. [What looked like one bug but was several](#3-what-looked-like-one-bug-but-was-several)
4. [Bug A — React duplicate keys from `wallFromBounds`](#4-bug-a--react-duplicate-keys-from-wallfrombounds)
5. [Bug B — Inter-room “bridge” was only doorway-wide on Z](#5-bug-b--inter-room-bridge-was-only-doorway-wide-on-z)
6. [Bug C — `GeneratedMapCollider` typed as a union with circles](#6-bug-c--generatedmapcollider-typed-as-a-union-with-circles)
7. [Fixes applied](#7-fixes-applied)
8. [Why it works now](#8-why-it-works-now)
9. [Trade-offs and intentional visuals](#9-trade-offs-and-intentional-visuals)
10. [Lessons & guardrails](#10-lessons--guardrails)
11. [Related files](#11-related-files)

---

## 1. Symptoms

- **Connector room** (and similar linear layouts): player sees **north/south “missing”** or only **corner pillars** on east/west; can **walk off the map** into the void, or the space reads as a broken shell.
- **Corridor between two rooms**: after widening floor overlap, **long north/south strips** appear beside the doorway opening, sometimes with **thin barrier walls** — camera obstruction can spike (“severe” / high top-down blend) because those rects are real geometry.
- **TypeScript** in `staticColliders.ts`:  
  `Type 'GeneratedMapCollider[]' is not assignable to type 'readonly RectCollider[]'` — `size` missing on a branch inferred as **circle**.

These surfaced while moving from a **single authored room** to a **fixed three-room map** (start → connector → objective) with **east/west** connections.

---

## 2. Architecture we were building toward

### 2.1 Connection-aware openings

**Rule:** Every room is a closed box by default. A side is **open** only when the map declares a **connection** on that side (neighbor room). Template `doorways` override width / lock / gate only; they do not invent connectivity.

Implementation sketch:

- `MapDefinition.connections` — edges between `fromRoomId` / `toRoomId` with `fromDirection` / `toDirection`.
- `getRoomAdjacency` — index connections by room.
- `getEffectiveDoorwaysForRoom` — merge **connection-derived doorways** with template overrides → list passed to **`buildWallSlabsForRoom`**.
- `buildWallSlabsForRoom` — same outer-skin philosophy as the prototype (`outerXL` / `outerXR` on north splits, etc.).

So for **Room1 — Connector — Room2**, the connector correctly **should** have:

- **West + east** openings (doorway splits on those walls).
- **North + south** solid slabs (full width), assuming no connections there.

If that logic is correct **but the scene still looks empty**, the failure is likely **not** “connector template forgot walls” — it is **rendering identity**, **geometry outside the room**, or **collision not including the same volumes**.

### 2.2 Inter-room gap

Rooms are placed with a gap between **outer wall skins** (`getOuterWallX` etc.). Something must fill that gap:

- Early approach: **thin floor “bridge”** only in the doorway span → fast to implement, **unsafe** on **Z**: the doorway is narrow in X but the **overlap in Z** between two rectangular rooms is large; the player can stand on the bridge in X but step off in Z into **nothing**.

Later approach: **corridor** = full **Z overlap** (for east/west links) + **north/south barrier walls** along the corridor + matching **collision rects**.

---

## 3. What looked like one bug but was several

| Layer | Wrong intuition | Actual issue |
|--------|-----------------|--------------|
| **Data / rules** | “Connector template has no walls” | Connection-aware doorways were plausible; **slabs existed in data** but did not all mount in React. |
| **React** | “Shader / lighting ate the walls” | **Duplicate `key`** collapsed multiple meshes into one. |
| **Layout** | “One floor strip between doors is enough” | **Doorway width ≠ safe walkable corridor** in the orthogonal axis. |
| **Types** | “Map colliders are rects” | Type said **`StaticCollider & metadata`**, so TS allowed a **circle** branch. |

Treating this as a single “algorithm wrong” problem would miss the **key collision** (dominant for connector **north/south** vanishing) and the **bridge vs corridor** issue (dominant for **void beside** the path).

---

## 4. Bug A — React duplicate keys from `wallFromBounds`

### Symptom

Connector (and any room) could show **only fragments** of the expected shell — e.g. east/west **jamb** segments visible, **north/south** apparently **gone**. Collision might still be wrong or inconsistent depending which mesh “won.”

### Root cause

`buildWallSlabsForRoom` builds entries like:

```ts
{ key: 'north', ...wallFromBounds(...) }
```

If `wallFromBounds` returned an object that included **`key: ''`** *after* the explicit `key` in a spread order that **overwrites** `'north'` with `''`, **every slab** could end up with **`key: ''`**.

In `GeneratedRoom`, slabs are rendered with:

```tsx
{slabs.map(({ key, ... }) => (
  <mesh key={key} ... />
))}
```

React reconciles lists by `key`. **Duplicate keys** mean **only one instance** of that key is reliably kept — the rest are dropped or updated unpredictably. Six walls become “one mesh worth” of updates.

### Why this was subtle

- The bug is **not** in the wall **math**; `tsx` / React give **no compile error**.
- Connection-aware logic **looks** broken in screenshots, so attention goes to adjacency and templates first.

### Fix

- **`wallFromBounds`** returns only **`position`** and **`args`** — **no `key` field** — so callers’ `key: 'north'` etc. are never clobbered.
- Corridor builders assign explicit keys (`north-barrier`, …) when merging `wallFromBounds` results.

---

## 5. Bug B — Inter-room “bridge” was only doorway-wide on Z

### Symptom

Standing in the **link** between rooms: **left/right** (±Z relative to an east-west run) open to **void**; player leaves the map even when **room** walls look fine.

### Root cause

A **minimal floor plane** spanning only the **doorway opening** (narrow in the axis orthogonal to the connection) does not cover the **overlap footprint** of two axis-aligned rectangles. The **safe walkable hull** between two rooms is closer to:

- **X:** gap between **east outer** of room A and **west outer** of room B (already modeled).
- **Z:** **intersection** of the two rooms’ Z extents (for coplanar rows), not the doorway width.

Without **north/south barriers** along that corridor, there is **no wall and often no collider** outside the doorway strip.

### Fix

- **`buildConnectionCorridors`** (evolution of “bridges”):  
  - Floor AABB: full **Z overlap** (and correct X span between outer skins).  
  - **Side walls** along ±Z edges for east-west connections (and the symmetric east/west barriers for north-south connections).
- **`GeneratedConnectionBridge`** renders **floor + side wall meshes**.
- **`getConnectionCorridorColliders`** + **`staticColliders`** include those rects for **player and camera** obstruction so behavior matches visuals.

---

## 6. Bug C — `GeneratedMapCollider` typed as a union with circles

### Symptom

```text
Type 'GeneratedMapCollider[]' is not assignable to type 'readonly RectCollider[]'.
  Property 'size' is missing in type 'CircleCollider & { sourceRoomId: ... }'
```

### Root cause

```ts
// Problematic definition (conceptual)
type GeneratedMapCollider = StaticCollider & { sourceRoomId: string }
```

Here `StaticCollider = RectCollider | CircleCollider`. Intersecting a **union** with extra fields in TypeScript does **not** collapse to “rect only”; the type remains **assignable from either branch**, so consumers requiring **`RectCollider`** (must have `size`) reject the array.

Wall and corridor builders **only** ever produced **`kind: 'rect'`** objects.

### Fix

Define map-derived wall colliders as **rect + metadata** only:

```ts
type GeneratedMapCollider = RectCollider & {
  sourceRoomId: string
  sourceObjectId?: string
}
```

Then `getRoomWallColliders` / `getConnectionCorridorColliders` return types align with **`RectCollider[]`** usage in `staticColliders.ts`.

---

## 7. Fixes applied

| Area | Change |
|------|--------|
| **`mapWallGeometry.ts`** | `wallFromBounds` returns **no** `key`; prevents spread from wiping slab keys. |
| **`mapRoomWallSlabs.ts` / `GeneratedRoom.tsx`** | Unchanged philosophy; benefits once keys are stable. |
| **`mapRoomConnectors.ts`** | Corridors with **full overlap floor** + **side barrier walls**; deprecated bridge type kept as thin alias if needed. |
| **`GeneratedConnectionBridge.tsx` / `GeneratedMap.tsx`** | Render **corridor group** (floor + walls). |
| **`mapCollision.ts` / `staticColliders.ts`** | **Corridor wall rects** in player + camera obstruction paths. |
| **`mapTypes.ts`** | `GeneratedMapCollider` narrowed to **`RectCollider &`** metadata. |

---

## 8. Why it works now

1. **Room shell** — Six (or fewer, if doorways) wall meshes each have a **unique React key**; connection-aware splits all mount.
2. **Inter-room volume** — Floor and walls cover the **overlap prism** between rooms; player cannot drift into an **unbounded strip** beside the doorway.
3. **Collision parity** — `getRoomWallColliders` + `getConnectionCorridorColliders` feed the same **rect** model the player and camera already use.
4. **Types** — `GeneratedMapCollider` matches **actual** runtime shapes; `staticColliders` composes **`RectCollider[]`** without assertions.

---

## 9. Trade-offs and intentional visuals

- **Corridor barrier walls** close the **Z gap** for east-west links. They can read as “**extra**” walls beside a future T-junction stub — that is **deliberate containment** until the map format describes **partial barriers** or **notches** per connection.
- **Camera obstruction** will treat those barriers like any wall (top-down blend may increase in tight geometry). Tuning camera rects vs. mesh extent is a separate polish pass.

---

## 10. Lessons & guardrails

| Lesson | Practice |
|--------|----------|
| **List rendering + spread merges** | Never let a helper return **partial** props (`key`, `id`) that can **override** caller identity. Keep helpers **pure geometry**; caller owns **React `key`**. |
| **Debug “missing mesh”** | Log or temporarily **label** `key` counts; duplicate keys often show `key=""` repeated in React DevTools. |
| **Doorway ≠ corridor hull** | For axis-aligned rooms, compute the **Minkowski-style** safe overlap (here: interval intersection on the orthogonal axis) + **barriers** on the open sides. |
| **Types should follow runtime** | If a function only returns rects, type it as **`RectCollider`**, not **`StaticCollider`**. |

---

## 11. Related files

| File | Role |
|------|------|
| `apps/web/src/features/map-generation/mapWallGeometry.ts` | `wallFromBounds` — **geometry only**, no list keys. |
| `apps/web/src/features/map-generation/mapRoomWallSlabs.ts` | Wall slabs from template + **effective** doorways. |
| `apps/web/src/features/map-generation/mapConnections.ts` | `getEffectiveDoorwaysForRoom` — connections + template merge. |
| `apps/web/src/features/map-generation/roomAdjacency.ts` | Adjacency index for a room id. |
| `apps/web/src/features/map-generation/mapRoomConnectors.ts` | **Corridors** between connected rooms (floor + side walls). |
| `apps/web/src/features/map-generation/GeneratedRoom.tsx` | Room floor + wall meshes; **`key={key}`** on slabs. |
| `apps/web/src/features/map-generation/GeneratedConnectionBridge.tsx` | Corridor floor + barrier meshes. |
| `apps/web/src/features/map-generation/GeneratedMap.tsx` | Rooms + corridors. |
| `apps/web/src/features/map-generation/mapCollision.ts` | `getRoomWallColliders`, `getConnectionCorridorColliders`. |
| `apps/web/src/features/map-generation/mapTypes.ts` | `GeneratedMapCollider` as **rect + metadata**. |
| `apps/web/src/features/collision/staticColliders.ts` | Composes room + corridor **rects** for player / camera. |
| `apps/web/src/features/map-generation/generateFixedMap.ts` | Fixed three-room layout + connections. |

---

## Verification

- `npm run build -w web` — passing at time of this document.
- Manual: traverse **start → connector → objective**; **no** walk-off into void beside connections; connector shows **north/south** closure; Typecheck clean for `staticColliders` / `GeneratedMapCollider`.

---

## Follow-ups (optional)

- **T-junctions / stubs:** represent **which segment** of a corridor edge is open vs. blocked (graph + polyline), instead of one full-length barrier per edge.
- **Single `buildMapColliders(map)`** helper that returns `{ rects, circles }` for any map instance to avoid `FIXED_PROTOTYPE_MAP` duplication as maps multiply.
- **Visual-only overlap** for corridor barriers vs. **collision** rects if camera obstruction needs softening without shrinking gameplay collision.
