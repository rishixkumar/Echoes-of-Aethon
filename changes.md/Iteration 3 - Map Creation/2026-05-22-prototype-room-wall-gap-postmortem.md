# 2026-05-22 — Prototype room wall gaps: postmortem

> **Audience:** future you, collaborators, and agents touching `PrototypeRoom`, `EchoGate`, or collision.  
> **Scope:** visual seams at room boundaries and the doorway — not map generation pipelines.

---

## Table of contents

1. [Symptoms](#1-symptoms)
2. [What was *not* broken](#2-what-was-not-broken)
3. [Attempt 1 — `visualOverlap` on mesh length](#3-attempt-1--visualoverlap-on-mesh-length)
4. [Attempt 2 — bounds-based walls (without fixing the gate)](#4-attempt-2--bounds-based-walls-without-fixing-the-gate)
5. [Root causes (two separate bugs)](#5-root-causes-two-separate-bugs)
6. [Fixes applied](#6-fixes-applied)
7. [Why it works now](#7-why-it-works-now)
8. [Lessons & guardrails](#8-lessons--guardrails)
9. [Related files](#9-related-files)

---

## 1. Symptoms

- **Vertical slit / black void** visible where wall pieces should meet (corners, doorway, or gate).
- **Collision still blocked** the player from leaving the room — gameplay felt “invisible wall,” visuals looked broken.
- **Third-person camera** (especially top-down fallback) made seams easier to notice.
- **Objective orb** could appear “through” a gap, reinforcing that the hole was *geometric*, not only lighting.

These issues showed up early in Iteration 3 as one of the first polish blockers.

---

## 2. What was *not* broken

- **XZ collision math** for rects (`staticColliders.ts`, `xzOverlapsAnyStaticCollider`) behaved as designed: the player capsule could not exit the playable slab.
- The problem was almost always **visual mesh placement/size** vs. **intended room boundary**, not the overlap test itself.

---

## 3. Attempt 1 — `visualOverlap` on mesh length

### Idea

Add `walls.visualOverlap` (e.g. `0.08` m) and lengthen each wall `boxGeometry` along its **long** axis by `2 × visualOverlap`, keeping **collision rectangles unchanged**.

### Why we tried it

Tiny cracks often come from:

- floating-point grid alignment,
- coplanar faces,
- or sub-pixel rasterization.

Slightly **over-long** meshes are a standard cheap seal for that class of bug.

### Why it *didn’t* solve the main gap

The dominant seams were **not** float noise.

1. **Corner between front jambs and side walls**  
   Side walls are centered on `±halfW` with thickness `t` on **X**, so their **outer** faces sit at `±(halfW + t/2)`.  
   Front segments were still sized/placed using **`halfW` as the “room edge”** (effectively `±7` on a 14 m floor) instead of **`±(halfW + t/2)`** (`±7.175` with `t = 0.35`).  
   That left a **wedge-shaped hole** (~`t/2` wide at the corner) no amount of symmetric length fudge would reliably close without correcting **which plane** the front wall terminates on.

2. **Gate panel floating in Z** (see [§5.2](#52-bug-b--echo-gate-z-misaligned-with-doorway-plane))  
   Lengthening static wall boxes does not move the **Echo Gate** mesh; a **~1.45 m** void could still appear between the doorway and the gate.

### Takeaway

`visualOverlap` is still useful as a **micro-seam** polish, but it is the wrong primary tool when the error is **systematic placement** (wrong boundary definition or wrong object Z).

---

## 4. Attempt 2 — bounds-based walls (without fixing the gate)

### Idea

Stop hand-tuning `position` + `args` per wall. Introduce `wallFromBounds({ minX, maxX, minZ, maxZ, height })` and derive every slab from an explicit axis-aligned footprint so:

- front **left** / **right** segments meet the **outer** faces of the side prisms,
- small `visualOverlap` remains for micro-cracks only.

### Why it helped

Once front segments extended to **`outerXLeft ± ov`** and **`outerXRight ± ov`**, the **jamb ↔ side-wall** corner class of gaps went away: the math matched the actual thick-wall outer boundary.

### What still looked wrong

The **Echo Gate** (`EchoGate.tsx`) still used `gate.position[2] = -7.2` from config while the **front wall slab** lives at **`frontZ = -halfD = -9`**.  
The gate panel sat **too far toward the room interior**, leaving a **large visible tunnel** between:

- the **inner face** of the front wall / jambs (`z ≈ -8.825`), and  
- the **back** of the gate box (`z ≈ -7.375` for center `-7.2`, depth `0.35`).

Collision followed the same wrong Z, so the player was still blocked — but the **void was obvious**.

### Takeaway

Room shells must treat **movable / scripted door geometry** as part of the same **layout contract** as static walls. A separate magic number for “gate Z” drifts unless **derived from the same `frontZ` and thickness** as the room.

---

## 5. Root causes (two separate bugs)

### 5.1 Bug A — Front jamb X extent vs. thick side walls

| Concept | Value (14 × 18 room, `t = 0.35`) |
|--------|-----------------------------------|
| Floor half-extent `halfW` | `7` |
| Side wall **outer** X | `±(halfW + t/2)` → **`±7.175`** |
| Wrong assumption | “Room edge in X is `±halfW`” for front segments |
| Effect | Front slabs stopped short of the side prisms’ outer faces → **corner gap** |

### 5.2 Bug B — Echo Gate Z misaligned with doorway plane

| Plane | Approximate Z |
|-------|----------------|
| Front wall slab center | `-9` (= `-halfD`) |
| Room-facing **inner** face of front slab | `frontZ + t/2` → **`-8.825`** |
| Old gate center | **`-7.2`** |
| Old gate back (half depth `0.175`) | **`-7.375`** |

Gap along **+Z** from inner doorway plane to gate back: on the order of **`~1.45` m** — reads as a huge black slot next to the “orb wall” (gate) and jambs.

---

## 6. Fixes applied

### 6.1 Bounds-driven `PrototypeRoom` walls

- Added **`wallFromBounds`** so each wall is an explicit **XZ AABB** → center and `boxGeometry` args are **forced consistent**.
- **Front segments** span from **`outerXLeft - ov`** to **`-doorHalf + ov`** (and symmetric right), with **`doorW`** taken from **`gate.size[0]`** so the opening always matches the gate width.
- **Side walls** extend **`±ov`** in **Z** past `frontZ` / `backZ` to soften transitions at the back and front edges.

### 6.2 Single-source room constants + derived gate Z (`prototypeSceneConfig.ts`)

- **`PROTOTYPE_FLOOR_W` / `PROTOTYPE_FLOOR_D`** anchor floor size for both walls and gate math.
- **`gateCenterZ = frontWallCenterZ + wallT/2 + gateD/2`**  
  i.e. place the gate so its **back face** meets the **inner face** of the front wall slab, with depth extending slightly **into the room** — no hollow “tunnel” in the doorway.

`EchoGate` and **`getGateRectCollider`** consume the same config, so **mesh and collider move together**.

---

## 7. Why it works now

1. **Corners**  
   Front jambs terminate on the same **outer X** definition as the side walls (`±(halfW + t/2))`, plus optional `visualOverlap` — the corner volume is actually covered by mesh, not by hope.

2. **Doorway**  
   The gate is no longer a free-floating panel at an arbitrary Z; it is **anchored to the front wall’s inner plane** using the same `wallT` and `gateD` as the scene. Visual closure matches **player and camera obstruction** rects.

3. **One source of truth**  
   Floor size, wall thickness, door width, and gate depth feed **one derivation chain**. Future edits are less likely to reintroduce “collision says no, eyes say yes” drift.

---

## 8. Lessons & guardrails

| Lesson | Practice |
|--------|----------|
| **Thick walls ≠ thin room outline** | Any “edge” in XZ for T-junctions must use **outer skin** (`halfW ± t/2`), not only `halfW`. |
| **Doors are part of the wall system** | Derive door transform from **`frontZ`, `t`, and door depth`** — avoid magic `z` unless it is clearly labeled and tied to formulas. |
| **Overlap is not a substitute for wrong bounds** | `visualOverlap` seals slivers; it won’t fix **centimeters–meters** placement errors. |
| **When collision “works” but art fails** | Compare **AABB** of meshes vs. rects in a quick table (or debug draw once) before tuning material/lighting. |

---

## 9. Related files

| File | Role |
|------|------|
| `apps/web/src/features/world-objects/PrototypeRoom.tsx` | Floor + wall meshes; `wallFromBounds`, jamb ↔ side outer alignment. |
| `apps/web/src/scenes/prototypeSceneConfig.ts` | Floor constants, wall/gate sizes, **derived `gateCenterZ`**. |
| `apps/web/src/features/world-objects/EchoGate.tsx` | Renders gate mesh from `PROTOTYPE_SCENE_CONFIG.gate`. |
| `apps/web/src/features/collision/staticColliders.ts` | `ROOM_WALL_RECTS` + gate rect; unchanged footprint philosophy (visuals may extend slightly past rects where intentional). |
| `apps/web/src/features/interaction/interactableRegistry.ts` | Gate orb; independent of wall Z but placement reads same room config where relevant. |

---

## Verification

- `npm run build -w web` — passing at time of this document.
- Manual: stand in doorway and corners in third person — no unintended **void slot** between gate and jambs; orb no longer reads as “behind a crack” at the boundary.

---

## Follow-ups (optional)

- If **camera obstruction** rects should include the **extended** jamb visuals, consider nudging rects to match outer skins (trade-off: slightly larger occlusion volume).
- When **procedural map generation** lands, port **`wallFromBounds` + outer-face rules** into the generator instead of re-hardcoding.
