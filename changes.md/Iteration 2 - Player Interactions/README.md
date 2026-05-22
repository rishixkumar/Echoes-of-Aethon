# Iteration 2 — Player interactions (progress README)

This document summarizes **all work after** the session captured in  
[`interactionFoundation-20260522.md`](./interactionFoundation-20260522.md)  
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
- **`features/interaction/TestInteractable.tsx`** — world labels via shared **`WorldLabel`** (Drei **`<Html sprite />`**); styles under **`.worldLabel`** in **`index.css`**.
- **`features/ui/GameHud.tsx`** — dev readouts: player **`x, z`** and **near interactable** yes/no.

### B. Interaction registry (multi-object)

- **`features/interaction/interactableRegistry.ts`** — **`INTERACTABLES`** as the single source of truth (e.g. **Ancient Echo Orb** at `(2, 0.5, 2)` plus a second entry **Shard of Quiet** at `(-2, 0.5, -2)` to prove “add row → new object”).
- **`features/interaction/InteractableRenderer.tsx`** — maps **`INTERACTABLES`** → **`<TestInteractable />`**.
- **`features/interaction/TestInteractable.tsx`** — **props-driven** (`id`, `label`, `position`, `radius`); no hardcoded world position. **`pickNearestInteractable`** so when ranges overlap, the **nearest** object owns the bottom HUD, world prompt, and **E** acceptance.
- **`features/collision/staticColliders.ts`** — **`STATIC_COLLIDERS`** built by **mapping `INTERACTABLES`** (`colliderRadius` → circle radius).
- **`scenes/PrototypeScene.tsx`** — uses **`<InteractableRenderer />`** instead of a one-off orb component.
- **`scenes/prototypeSceneConfig.ts`** — **floor-only** once interactables lived in the registry.

### C. World prompt: billboard + tuning

- **`features/interaction/TestInteractable.tsx`** — Drei **`<Html sprite />`** via **`WorldLabel`**: **name** + **Press E** when the interactable is the **nearest** in range; per-variant **`distanceFactor`** inside **`WorldLabel`**.

### D. Atmosphere + labels (2026-05-22)

- **[`atmosphereWorldLabels-20260522.md`](./atmosphereWorldLabels-20260522.md)** — **`rendering/Atmosphere`**, **`atmosphereConfig`**, **`components/world-labels/WorldLabel`**, player overhead tag, scene fog/background.

### E. Still explicitly out of scope

Inventory, dialogue trees, quests, save/load, backend APIs, full physics, NPC/enemy AI.

---

## How to verify quickly

```bash
npm install
npm run build -w web
npm run dev -w web
```

**Manual:** WASD + slab bounds; cannot walk through orb colliders; approach either orb → HUD line + world **name** + **Press E**; orbit camera → labels stay camera-facing (**sprite**); **E** activates the **nearest** in-range orb; walk away → labels + HUD clear; **Player** tag always visible.

---

## Related files (quick index)

| Area | Files |
|------|--------|
| Registry | `interactableRegistry.ts`, `InteractableRenderer.tsx` |
| Interaction UX | `TestInteractable.tsx`, `interactionConfig.ts`, `interactionHudStore.ts`, `interactionTypes.ts` |
| World labels | `components/world-labels/WorldLabel.tsx` |
| Atmosphere | `rendering/Atmosphere.tsx`, `rendering/atmosphereConfig.ts` |
| Player | `PlayerController.tsx`, `PlayerAura.tsx`, `playerStore.ts`, `playerMovementConfig.ts`, `useKeyboardMovement.ts` |
| Collision | `collisionTypes.ts`, `collisionConfig.ts`, `staticColliders.ts` |
| Scene | `PrototypeScene.tsx`, `prototypeSceneConfig.ts` |
| HUD | `GameHud.tsx`, `App.tsx`, `index.css` |

---

Holistic narrative: [`../../docs/iteration-02-summary.md`](../../docs/iteration-02-summary.md).
