# 2026-05-22 — Persistent interaction state, objectives, and Echo Gate

## Summary

Adds **persistent world state** for interactables (toggle, survives walking away), a **minimal objective** (“Activate the Ancient Echo Orb”) that **stays complete** after first activation, an **Echo Gate** that **blocks** the player until the orb is active then **removes** mesh + collider, plus HUD/debug wiring.

## New files

| Path | Role |
|------|------|
| `apps/web/src/features/world-state/worldStateStore.ts` | Zustand: `activatedInteractables`, activate / deactivate / toggle / query. |
| `apps/web/src/features/objectives/objectiveTypes.ts` | `ObjectiveDefinition` shape. |
| `apps/web/src/features/objectives/objectiveRegistry.ts` | `OBJECTIVES` list (orb activation goal). |
| `apps/web/src/features/objectives/objectiveStore.ts` | Zustand: `completedById`, `completeObjective`, `isObjectiveComplete`. |
| `apps/web/src/features/objectives/ObjectiveHud.tsx` | Top-left objective list with ✓ / ○. |
| `apps/web/src/features/world-objects/EchoGate.tsx` | Box gate; unmounts when `test-orb` is activated. |

## Updated

- `apps/web/src/features/interaction/TestInteractable.tsx` — **orange** = inactive, **teal** = active (persistent); **E** toggles world store; HUD strings **activate / deactivate**; completes matching **objectives** on first activate only.
- `apps/web/src/features/collision/staticColliders.ts` — **`getCollidersForPlayer()`** builds interactable circles + **gate** circle unless orb active; `xzOverlapsAnyStaticCollider` uses that list each call.
- `apps/web/src/scenes/prototypeSceneConfig.ts` — **`gate`** block (`id`, `position`, `size`, `colliderRadius`, `unlocksWhen`).
- `apps/web/src/scenes/PrototypeScene.tsx` — mounts **`<EchoGate />`**.
- `apps/web/src/features/ui/GameHud.tsx` — **Active objects:** count of activated interactables.
- `apps/web/src/app/App.tsx` — renders **`<ObjectiveHud />`**.

## Behavior notes

- **Objectives:** completing is **idempotent**; **deactivating the orb does not un-complete** the objective (per design).
- **Gate:** collision uses the same **XZ circle** approximation as other prototypes (`colliderRadius` at gate `position`).

## Verification

- `npm run build -w web` — run in CI / locally after pull.

## Manual QA

1. Approach **Ancient Echo Orb** → HUD **Press E to activate**; world **Press E**.  
2. Press **E** → orb turns **teal**, stays teal when leaving and returning.  
3. **Active objects** increments; objective shows **✓** and remains ✓ after toggling orb off.  
4. Gate at **z ≈ -4** blocks passage until orb is active; after activate, gate **gone** and player can pass.
