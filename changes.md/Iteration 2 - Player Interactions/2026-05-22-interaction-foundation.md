# 2026-05-22 — Interaction foundation (proximity + E + HUD)

## Summary

First **non-movement gameplay layer**: the player can **approach** a test object, see **“Press E to interact”** in a DOM HUD, press **E**, and get a **visible + console** response. Movement, slab bounds, and OrbitControls are unchanged.

## Added

| Path | Role |
|------|------|
| `apps/web/src/features/interaction/interactionTypes.ts` | `InteractionId`, `Interactable` contract for future registries. |
| `apps/web/src/features/interaction/interactionConfig.ts` | `INTERACTION_CONFIG` (`key`, `defaultRadius`) + `isInteractKey()`. |
| `apps/web/src/features/interaction/interactionHudStore.ts` | Zustand store for the **HUD prompt string** (null when out of range). |
| `apps/web/src/features/interaction/TestInteractable.tsx` | Glowing sphere at `(2, 0.5, 2)`, horizontal proximity, `E` handler, material color pulse, `console.info` on use. |
| `apps/web/src/features/player/playerStore.ts` | Zustand **`playerPosition`** + `setPlayerPosition` (updated every frame from `PlayerController`). |
| `apps/web/src/features/ui/GameHud.tsx` | HTML overlay: existing control hints + interaction line when prompt is set. |

## Updated

- `apps/web/src/features/player/PlayerController.tsx` — writes `[x,y,z]` to `usePlayerStore` each `useFrame`.
- `apps/web/src/scenes/PrototypeScene.tsx` — mounts `TestInteractable`.
- `apps/web/src/app/App.tsx` — uses `GameHud` instead of inline hint markup.

## Dependencies

- **`zustand`** added to `apps/web` (`npm install zustand -w web`).

## Explicitly not added

Inventory, dialogue, quests, save/load, backend, puzzle logic.

## Verification

- `npm run build -w web` — succeeded.

## Manual QA checklist

1. WASD still moves; still blocked at slab edges.  
2. Orb visible near `(2, 2)` on the XZ plane.  
3. Enter default radius (~1.5m horizontal): HUD shows **Press E to interact**.  
4. Press **E**: console log, orb color shifts, HUD shows **Object activated** for ~2s while still in range.  
5. Walk away: HUD clears; orb color resets to teal when leaving radius.
