# 2026-05-22 — Player controller prototype (WASD)

## Summary

Added a **keyboard-driven placeholder player** (capsule mesh) under `features/player/`, integrated into `PrototypeScene`, to validate **input → per-frame integration → XZ movement** without physics, collisions, or jumping.

## What changed

### New

- `apps/web/src/features/player/PlayerController.tsx` — `useFrame` movement, capsule visual, feet pinned to `y = 0`.
- `apps/web/src/features/player/useKeyboardMovement.ts` — WASD tracking via `KeyboardEvent.code` + **blur / visibility** resets to prevent stuck inputs.
- `apps/web/src/features/player/playerMovementSettings.ts` — `maxSpeed`, smoothing `response`, capsule dimensions.

> **Note (later change):** settings were consolidated into `playerMovementConfig.ts` when world bounds were added (`./playerWorldBounds-20260522.md`).

### Updated

- `apps/web/src/scenes/PrototypeScene.tsx` — removed static cube; mounts `PlayerController`; improved directional shadow setup for the moving capsule.
- `apps/web/src/app/App.tsx` — small non-interactive on-screen control hint (WASD + orbit).

### Removed

- `apps/web/src/features/player/.gitkeep` — folder now contains real source files.

## Behavior notes (intentional “extra” beyond the brief)

- Movement is **camera-relative on the XZ plane** (still ground-only), which pairs much better with **OrbitControls** than world-fixed axes.
- Velocity **eases toward** the target each frame using an exponential smoothing factor derived from `delta` (stable across frame rates).

## Verification

- `npm run build -w web` — succeeded after changes.

## Follow-ups

- Ground clamp + simple **collision** (bounds or meshes) once environments grow.
- Decide whether long-term movement stays camera-relative or becomes character-relative when a gameplay camera replaces orbit inspection.
