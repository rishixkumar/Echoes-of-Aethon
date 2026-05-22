# Iteration 2 — Player interactions (progress README)

This document summarizes **all work after** the session captured in  
[`2026-05-22-interaction-foundation.md`](./2026-05-22-interaction-foundation.md)  
through the current codebase state. **Iteration 2 is not closed**; this README exists so the branch can be pushed with a clear handoff.

---

## Baseline (already documented in the foundation log)

The foundation milestone established:

- Proximity + **E** interaction, bottom-left **HUD** prompt via Zustand, **`playerStore`** (position each frame), **`TestInteractable`** + **`GameHud`**, **`zustand`** on `apps/web`.

See the linked file for paths and the original QA checklist.

---

## Subsequent changes (after the foundation log)

### A. Prototype tightening & scene centralization

- **`scenes/prototypeSceneConfig.ts`** — introduced a shared config for the dev playground (floor size / half-extent). Interactable numbers later moved exclusively to the registry (see C).
- **`features/player/playerMovementConfig.ts`** — slab bounds driven from **`PROTOTYPE_SCENE_CONFIG.floor.halfExtent`** (with capsule inset). **Fix:** import path must be **`../../scenes/prototypeSceneConfig`** (from `features/player/`), not `../scenes/`.
- **`features/collision/`** — lightweight **XZ circle** static colliders, **`collisionTypes`**, **`collisionConfig`**, **`staticColliders`**, and **`PlayerController`** collision rejection (revert to previous `x,z` + zero horizontal velocity when overlapping; no physics engine).
- **`features/interaction/TestInteractable.tsx`** — world-space prompt via Drei **`<Html />`** (initially `transform`), **`.worldPrompt`** styles in **`index.css`**.
- **`features/ui/GameHud.tsx`** — dev readouts: player **`x, z`** and **near interactable** yes/no.

### B. Interaction registry (multi-object)

- **`features/interaction/interactableRegistry.ts`** — **`INTERACTABLES`** as the single source of truth (e.g. **Ancient Echo Orb** at `(2, 0.5, 2)` plus a second entry **Shard of Quiet** at `(-2, 0.5, -2)` to prove “add row → new object”).
- **`features/interaction/InteractableRenderer.tsx`** — maps **`INTERACTABLES`** → **`<TestInteractable />`**.
- **`features/interaction/TestInteractable.tsx`** — **props-driven** (`id`, `label`, `position`, `radius`); no hardcoded world position. **`pickNearestInteractable`** so when ranges overlap, the **nearest** object owns the bottom HUD, world prompt, and **E** acceptance.
- **`features/collision/staticColliders.ts`** — **`STATIC_COLLIDERS`** built by **mapping `INTERACTABLES`** (`colliderRadius` → circle radius).
- **`scenes/PrototypeScene.tsx`** — uses **`<InteractableRenderer />`** instead of a one-off orb component.
- **`scenes/prototypeSceneConfig.ts`** — **floor-only** once interactables lived in the registry.

### C. World prompt: billboard + tuning

- **`features/interaction/interactionConfig.ts`** — **`worldPrompt`**: `distanceFactor`, `yOffset`; removed obsolete **`defaultRadius`** (radii come from registry entries).
- **`features/interaction/TestInteractable.tsx`** — Drei **`<Html sprite />`** so the label **faces the active camera** while staying anchored in world space; **`center`** + **`distanceFactor`**. Current tuning: **`distanceFactor: 10`**, **`yOffset: 1.6`** (raise `distanceFactor` toward **12** if the label still feels large).

### D. Still explicitly out of scope

Inventory, dialogue trees, quests, save/load, backend APIs, full physics, NPC/enemy AI.

---

## How to verify quickly

```bash
npm install
npm run build -w web
npm run dev -w web
```

**Manual:** WASD + slab bounds; cannot walk through orb colliders; approach either orb → prompts + world “Press E”; orbit camera → world prompt stays camera-facing (**sprite**); **E** activates the **nearest** in-range orb; walk away → prompts clear.

---

## Related files (quick index)

| Area | Files |
|------|--------|
| Registry | `interactableRegistry.ts`, `InteractableRenderer.tsx` |
| Interaction UX | `TestInteractable.tsx`, `interactionConfig.ts`, `interactionHudStore.ts`, `interactionTypes.ts` |
| Player | `PlayerController.tsx`, `playerStore.ts`, `playerMovementConfig.ts`, `useKeyboardMovement.ts` |
| Collision | `collisionTypes.ts`, `collisionConfig.ts`, `staticColliders.ts` |
| Scene | `PrototypeScene.tsx`, `prototypeSceneConfig.ts` |
| HUD | `GameHud.tsx`, `App.tsx`, `index.css` |

---

*Prepared for git push mid–Iteration 2; holistic `docs/iteration-02-*.md` may follow when you close the iteration.*
