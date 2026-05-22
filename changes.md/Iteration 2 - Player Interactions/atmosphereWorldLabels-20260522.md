# 2026-05-22 — Atmosphere + world labels

## Summary

Dim purple/red scene mood (**fog**, **hemisphere** + **ambient**), centralized **`Atmosphere`**, and reusable **`WorldLabel`** (Drei **`<Html sprite />`**) for player tag, orb names, and **Press E** prompts. HUD behavior unchanged (full verb line when focused).

## Added

| Path | Role |
|------|------|
| `apps/web/src/rendering/atmosphereConfig.ts` | `ATMOSPHERE_CONFIG` — background, fog near/far, light intensities/colors. |
| `apps/web/src/rendering/Atmosphere.tsx` | Sets `scene.background` + `scene.fog` in `useEffect`; mounts ambient + hemisphere lights. |
| `apps/web/src/components/world-labels/WorldLabel.tsx` | Props: `text`, `position`, `variant` (`name` \| `prompt` \| `player`), `visible`. |

## Updated

- `apps/web/src/scenes/PrototypeScene.tsx` — **`<Atmosphere />`**, removed duplicate ambient + `<color background>`; kept **directional** shadow light + floor + gate + interactables.
- `apps/web/src/features/player/PlayerController.tsx` — always-on **Player** label above capsule.
- `apps/web/src/features/interaction/TestInteractable.tsx` — name + **Press E** labels when nearest in range; removed inline **`<Html />`**.
- `apps/web/src/features/interaction/interactionConfig.ts` — dropped **`worldPrompt`** (scaling lives in **`WorldLabel`**).
- `apps/web/src/index.css` — **`.worldLabel`** / variant classes; body background aligned with scene.

## Lighting composition (same day)

Stronger **hemisphere** tint on upward normals, **pink moon** `directionalLight` in **`Atmosphere`**, denser **fog** (`near` / `far`), floor **`#120812`** + `roughness={1}`, gate / “wall” albedo shifted toward **`#1a1020`** with purple emissive so geometry picks up atmosphere when the camera is zoomed in.

## Brighter world + player aura

- **`atmosphereConfig`**: higher **ambient** / **hemisphere**; **`moonLight`** block drives **`Atmosphere`** directional.
- **`PlayerAura.tsx`**: layered **warm + purple** `pointLight`s with **flicker** (dual sine); small **emissive lantern** mesh; no floor disc / no body bubble; follows **`PlayerController`**.
- **Floor / gate / capsule** materials tuned so the player light reads on nearby surfaces (non-black albedo, controlled roughness).

## Manual QA

- Purple/red glow, fog; floor/orbs/gate still readable.
- Orbit camera → labels stay camera-facing.
- Approach orb → name + **Press E**; HUD still shows full line; **E** / objectives / gate / collisions unchanged.

## Explicitly not in this milestone

Particles, shaders, day/night, new mechanics, art assets.
