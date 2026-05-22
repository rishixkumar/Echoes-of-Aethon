# 2026-05-22 — Prototype world bounds (axis-aligned clamp)

## Summary

Added **`PLAYER_MOVEMENT_CONFIG`** with **`speed`**, existing smoothing **`response`**, **`capsule`**, and **`bounds`**. After each movement step, the player’s XZ position is **clamped** to the playable slab. Velocity along an axis is **zeroed when a clamp fires** so the avatar does not “push” into an invisible wall every frame.

## Rationale

- Matches **`PrototypeScene`** ground: `planeGeometry` **12×12** → half-extent **6** on X/Z.
- Bounds are **inset by the capsule radius** so the placeholder mesh stays visually on the plane (hemisphere overhang).

## Files

- **Added:** `apps/web/src/features/player/playerMovementConfig.ts`
- **Updated:** `apps/web/src/features/player/PlayerController.tsx`
- **Removed:** `apps/web/src/features/player/playerMovementSettings.ts` (replaced by the config module)

## Verification

- `npm run build -w web` — succeeded.

## Follow-ups (not started)

- First **interaction** system (per roadmap) — deferred as requested.
- Later: real collision volumes / physics instead of a single global bounds object.
