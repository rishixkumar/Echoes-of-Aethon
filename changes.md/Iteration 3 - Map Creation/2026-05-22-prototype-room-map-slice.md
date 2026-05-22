# 2026-05-22 — Iteration 3 start: hand-built prototype room + exit slice

## Goal

First **playable micro-room** (no procedural generation): fixed primitives, full loop **enter room → find Ancient Echo Orb → activate → gate opens → exit strip → “Area Complete”** on HUD.

## Added

| Path | Role |
|------|------|
| `apps/web/src/features/world-objects/PrototypeRoom.tsx` | Floor 14×18, four walls + split front wall (gate opening); `meshStandardMaterial` for lantern response. |
| `apps/web/src/features/world-objects/ExitZone.tsx` | Faint exit pad when gate open; `useFrame` AABB vs player XZ; sets `useAreaStateStore` once. |
| `apps/web/src/features/world-state/areaStateStore.ts` | Zustand: `isPrototypeAreaComplete`, `setPrototypeAreaComplete`. |

## Updated

- `apps/web/src/scenes/prototypeSceneConfig.ts` — **`PROTOTYPE_ROOM_CONFIG`** (floor, walls, gate, exit, `playerStart`, `objectiveOrb`); **`PROTOTYPE_SCENE_CONFIG`** derived for movement/collision/scene.
- `apps/web/src/scenes/PrototypeScene.tsx` — order: `Atmosphere` → `PrototypeRoom` → `EchoGate` → `ExitZone` → `PlayerController` (spawn from config) → `InteractableRenderer`; removed duplicate floor mesh; widened shadow camera frustum.
- `apps/web/src/features/collision/collisionTypes.ts` — **`RectCollider`** (`kind: 'rect'`, center + XZ size); **`CircleCollider.kind`**; union **`StaticCollider`**.
- `apps/web/src/features/collision/staticColliders.ts` — **five wall rects** + **gate rect** when closed + interactable **circles**; **`xzCircleOverlapsRect`** (closest point on AABB vs player circle); **`getCollidersForPlayer`** returns mixed list.
- `apps/web/src/features/player/playerMovementConfig.ts` — slab bounds **`halfExtentX` / `halfExtentZ`** (7 / 9).
- `apps/web/src/features/interaction/interactableRegistry.ts` — objective orb position from **`PROTOTYPE_ROOM_CONFIG.objectiveOrb`**; second orb repositioned inside room.
- `apps/web/src/features/ui/GameHud.tsx` — top-center **“Area Complete”** banner when `useAreaStateStore` is true (debug panel unchanged).

## Collision model (XZ)

- **Circles:** unchanged `hypot` vs `r_player + r_body`.
- **Rects:** `closestX/Z = clamp(px/pz, rectMin, rectMax)`; overlap if `(px−closestX)² + (pz−closestZ)² < r_player²`.

## Verification

- `npm run build -w web` — pass.

## Manual QA

1. Spawn inside room; walls block movement; gate blocks opening until orb active.  
2. Activate **Ancient Echo Orb**; objective ✓; gate gone; exit glow visible past opening.  
3. Walk onto exit pad → **Area Complete** banner.  
4. Second **Echo Orb** still toggles for extra interaction smoke test.

## Explicitly not in this milestone

Procedural maps, navmesh, advanced physics, save/load.
