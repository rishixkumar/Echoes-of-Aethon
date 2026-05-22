# 2026-05-22 — Runnable web shell + prototype scene + architecture rules

## Summary

Made the **`apps/web`** client **runnable under Vite**, added a **minimal React Three Fiber prototype scene** (cube + ground + lights + `OrbitControls`), added **`.gitkeep` placeholders** for empty workspace directories, and documented **folder placement rules** for future agents in `docs/architecture-rules.md`.

## Commands run

```bash
cd "/Users/rishikumar/Desktop/EchoesOfAethon"

# Preserve empty directories in git (workspace convention)
find apps packages -type d -empty -exec touch "{}/.gitkeep" \;

# Verify production bundle
npm run build -w web

# Smoke-test dev server (background curl, then killed)
npm run dev -w web -- --host 127.0.0.1 --port 5173
curl -sfI http://127.0.0.1:5173/
```

Results:

- **`npm run build -w web`**: succeeded (Vite `7.3.3` reported).
- **Dev server**: returned **`HTTP/1.1 200 OK`** for `/` on `127.0.0.1:5173`.

## Files added

### Vite / React boot (`apps/web`)

- `index.html`
- `vite.config.ts` (`@vitejs/plugin-react`)
- `tsconfig.json`
- `src/vite-env.d.ts`
- `src/main.tsx`
- `src/index.css`
- `src/app/App.tsx` — mounts `<Canvas>` with `camera` + `shadows`
- `src/scenes/PrototypeScene.tsx` — minimal R3F scene (not gameplay)

### Documentation

- `docs/architecture-rules.md` — where code belongs + explicit non-goals for early milestones.

### Placeholders

- `.gitkeep` files created via `find apps packages -type d -empty -exec touch "{}/.gitkeep" \;`

## Notes

- **Chunk size warning** during `vite build` is expected for a default Three.js bundle; address later with code-splitting if needed.
- **`.gitkeep` discovery**: some repository search tools **do not index dotfiles** like `.gitkeep`, but the files exist on disk under previously-empty folders (for example `apps/web/public/`, `packages/shared/`, and unused `features/*` leaves).

## Follow-ups

1. First tiny gameplay vertical slice: **player movement in a simple environment** (per roadmap), implemented primarily under `features/player/` + a thin `scenes/` assembly.
2. Optionally tune Vite chunking / dynamic imports once real systems land.
3. Add `apps/server` entrypoint only when persistence/API is required.
