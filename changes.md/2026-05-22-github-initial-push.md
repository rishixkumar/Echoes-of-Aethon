# 2026-05-22 — Initial GitHub push

## Summary

Created a **dedicated Git repository inside** `EchoesOfAethon/` (previously, `git` commands inside this folder could resolve to a **parent repo** at `/Users/rishikumar`, which is unsafe for a focused project). Added a root **`README.md`**, made the **initial commit**, and pushed to **`origin/main`** on GitHub.

## Remote

- `https://github.com/rishixkumar/Echoes-of-Aethon.git`

## Commit

- **Subject:** `chore: initialize Echoes of Aethon monorepo and web prototype`
- **Body:** short bullet list covering workspaces, layout + `.gitkeep`, R3F prototype, docs/change logs

## Commands

```bash
cd "/Users/rishikumar/Desktop/EchoesOfAethon"
git init
git add -A
git commit -m "..."
git remote add origin "https://github.com/rishixkumar/Echoes-of-Aethon.git"
git push -u origin main
```

## Follow-ups

- None required for GitHub connectivity; future work should commit inside this repo only (`git rev-parse --show-toplevel` should print the project path).
