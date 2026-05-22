# 2026-05-22 — Iteration 3: Camera system milestone

## Summary

The prototype camera is now **fully gameplay-driven** (no OrbitControls): **first-person / third-person** with **C**, **comma / period zoom**, **A/D yaw**, **smooth mode transitions** (position + FOV + delayed body visibility), **XZ wall collision** that pulls the third-person eye along the player→camera segment, and a **severe-obstruction top-down fallback** that blends toward a higher, shorter-behind rig. State lives in **`useCameraStore`**; each frame **`GameCamera`** resolves ideals, applies smoothing, and drives the R3F `PerspectiveCamera`.

---

## Feature checklist (product)

| Topic | Behavior |
|--------|----------|
| **First / third person toggle** | **C** (`CAMERA_CONFIG.modeToggleKey`) calls `toggleMode()`. While `transition.isTransitioning`, **another C is ignored** to avoid mid-blend flips. |
| **Zoom** | **,** zoom in, **.** zoom out. Third person: **distance** clamped `[minDistance, maxDistance]` with `distanceStep`. First person: **FOV** clamped `[minFov, maxFov]` with `fovStep`. |
| **A/D turning** | Held keys feed `turnRef` (−1, 0, +1). Yaw target advances by `rotationSpeed * delta * turn`; current yaw **shortest-path lerps** toward that target (see math below). |
| **Smooth transitions** | On toggle, store records `fromMode`, `toMode`, `startedAt`, `duration` (default **0.4 s**). Camera **ideal position** and **ideal look target** interpolate with **smoothstep**; **FOV** linearly interpolates between mode targets; **position smoothing** uses a higher \(k\) during the blend (`transition.positionSmoothing`). |
| **Wall collision (third person)** | Desired camera position is pulled along the segment from **look target** to **desired eye** so the segment stays outside axis-aligned **XZ rectangles** (wall footprints), with **padding** and a **minimum** offset from the look target. |
| **Top-down fallback** | If obstruction is **severe** (collision reports `isObstructed` and `safeDistance / desiredDistance` below `obstructionThreshold`), a scalar **`obstructionBlend`** eases toward 1 and **lerps** normal vs top-down **position** and **look**; otherwise eases back to 0. Only active in **third-person context** (including transitions that involve third person). |

---

## Key source files

| Path | Role |
|------|------|
| `apps/web/src/features/camera/cameraConfig.ts` | All tunables: smoothing, transition, FP/TP geometry, zoom limits, obstruction fallback. |
| `apps/web/src/features/camera/cameraStore.ts` | Zustand: `mode`, yaw, zoom, FP FOV, **transition** blob, `toggleMode` / `completeTransition`, debug HUD fields. |
| `apps/web/src/features/camera/cameraInput.ts` | Window key listeners: C, comma/period, A/D → `turnRef`. |
| `apps/web/src/features/camera/GameCamera.tsx` | `useFrame`: yaw integration, FP/TP ideals, collision + fallback blend, mode transition, camera `position` / `lookAt` / `fov`. |
| `apps/web/src/features/camera/cameraCollision.ts` | `resolveThirdPersonCameraCollision` → `CameraCollisionResult`. |
| `apps/web/src/features/camera/cameraTypes.ts` | `CameraMode`, `CameraCollisionResult`. |
| `apps/web/src/features/camera/useGameCamera.ts` | `lerpAngle`, `smoothstep`, `getCameraTransitionT`, `isPlayerBodyVisible`. |
| `apps/web/src/features/player/PlayerController.tsx` | Mesh visibility + player label from `isPlayerBodyVisible()`. |
| `apps/web/src/features/ui/GameHud.tsx` | Debug lines: **Camera obstruction** (`none` / `mild` / `severe`), **Top-down blend** (0–1). |
| `apps/web/src/features/collision/staticColliders.ts` | `getThirdPersonCameraObstructionRects()` feeds collision. |

---

## Mathematical model (reference)

### 1. Horizontal basis from yaw

Let \(\psi\) be **yaw** (radians, about +Y). The implementation uses:

\[
\hat{f}_{xz} = (\sin\psi,\; 0,\; \cos\psi) \quad\text{(forward on XZ)}
\]

\[
\hat{b}_{xz} = -\hat{f}_{xz}, \qquad
\hat{r}_{xz} = (\cos\psi,\; 0,\; -\sin\psi)
\]

(`GameCamera.tsx` — first- and third-person ideals.)

### 2. First-person ideal eye and look

With player position \(\mathbf{p} = (p_x, p_y, p_z)\) and config offsets \(h\) (eye height), \(f\) (forward offset along \(\hat{f}_{xz}\)):

\[
\mathbf{c}_{\text{FP}} =
\mathbf{p} + f\,\hat{f}_{xz} + (0,\,h,\,0)
\]

\[
\mathbf{l}_{\text{FP}} = \mathbf{c}_{\text{FP}} + \hat{f}_{xz}
\]

(“Look one unit forward” from the eye; sufficient for a horizon-stabilized view.)

### 3. Third-person ideal (before collision)

With chase distance \(d\), shoulder offset \(s\) along \(\hat{r}_{xz}\), and vertical offsets \(H\) (camera height above feet) and look-at height \(L\) for the **normal** rig:

\[
\mathbf{d}_{\text{normal}} =
\mathbf{p} + d\,\hat{b}_{xz} + s\,\hat{r}_{xz} + (0,\,H,\,0)
\]

\[
\mathbf{t}_{\text{look,normal}} = \mathbf{p} + (0,\,L,\,0)
\]

**Top-down fallback** uses separate parameters \((d_{\text{td}}, H_{\text{td}}, L_{\text{td}})\):

\[
\mathbf{d}_{\text{td}} =
\mathbf{p} + d_{\text{td}}\,\hat{b}_{xz} + (0,\,H_{\text{td}},\,0), \qquad
\mathbf{t}_{\text{look,td}} = \mathbf{p} + (0,\,L_{\text{td}},\,0)
\]

Each desired position is passed through **collision** (below), producing \(\mathbf{c}_{\text{normal}}\) and \(\mathbf{c}_{\text{td}}\). The **blended** ideal is:

\[
\mathbf{c}_{\text{TP}} = \operatorname{lerp}(\mathbf{c}_{\text{normal}},\,\mathbf{c}_{\text{td}},\,\beta), \qquad
\mathbf{t}_{\text{TP}} = \operatorname{lerp}(\mathbf{t}_{\text{look,normal}},\,\mathbf{t}_{\text{look,td}},\,\beta)
\]

where \(\beta =\) `obstructionBlend` \(\in [0,1]\).

### 4. Segment–slab clipping (collision core)

Collision is **2D in XZ** between \(\mathbf{t} = (t_x, t_z)\) (look) and \(\mathbf{d} = (d_x, d_z)\) (desired camera). Parameter \(u \in [0,1]\):

\[
\mathbf{s}(u) = \mathbf{t} + u(\mathbf{d}-\mathbf{t})
\]

For each axis-aligned rectangle \([x_{\min},x_{\max}] \times [z_{\min},z_{\max}]\), the code intersects the segment with **X** and **Z** slabs (1D clipping), then intersects the resulting \(u\)-intervals to get overlap \([u_0, u_1]\) within \([0,1]\). The **first entry** into the rect along the ray (from player toward camera) uses \(u_{\text{enter}} = \max(0, u_0)\).

Along the full 3D segment, Euclidean **desired distance** is:

\[
D_{\text{des}} = \|\mathbf{d} - \mathbf{t}\|
\]

The allowed distance before the wall (with **padding** \(\delta\) and **minimum** clearance \(m\) from the look target) is capped at:

\[
D_{\text{allow}} = \max\bigl(m,\; u_{\text{enter}} D_{\text{des}} - \delta\bigr)
\]

Across all rects, \(u_{\max}\) is the minimum allowed \(u\); final:

\[
u_{\text{final}} = \operatorname{clamp}(u_{\max},\,0,\,1), \qquad
\mathbf{c} = \mathbf{t} + u_{\text{final}}(\mathbf{d}-\mathbf{t})
\]

\[
D_{\text{safe}} = \|\mathbf{c}-\mathbf{t}\|, \qquad
\text{isObstructed} = (D_{\text{safe}} < D_{\text{des}} - \varepsilon)
\]

(\(\varepsilon \approx 10^{-3}\) avoids float noise.)

### 5. Severe obstruction → drive top-down blend

Obstruction **ratio**:

\[
\rho = \frac{D_{\text{safe}}}{D_{\text{des}}}
\]

**Severe** when `isObstructed` and \(\rho < \rho_{\text{thr}}\) (config `obstructionThreshold`, default **0.55**). Target blend \(\beta^\* \in \{0,1\}\) (1 if severe). Per frame, exponential approach:

\[
\alpha_\beta = 1 - e^{-k\,\Delta t}
\]

with \(k =\) `blendSpeedIn` if \(\beta^\* > \beta\) else `blendSpeedOut`. Then:

\[
\beta \leftarrow \beta + (\beta^\* - \beta)\,\alpha_\beta
\]

### 6. A/D yaw smoothing (shortest arc)

Target yaw updated:

\[
\psi_{\text{target}} \leftarrow \psi_{\text{target}} + \omega\,\tau\,\Delta t
\]

\(\omega =\) `rotationSpeed`, \(\tau \in \{-1,0,1\}\) from A/D.

Shortest difference \(\Delta\) between current \(\psi\) and \(\psi_{\text{target}}\) is wrapped to \((-\pi,\pi]\); then:

\[
\psi \leftarrow \psi + \alpha_r\,\Delta, \qquad
\alpha_r = 1 - e^{-k_r\,\Delta t}
\]

(\(k_r =\) `smoothing.rotation`.)

### 7. Mode transition (C)

Normalized **linear** time:

\[
\tau_{\text{raw}} = \min\left(1,\; \frac{t - t_0}{T}\right)
\]

where \(t\) is `performance.now()`, \(t_0 =\) `startedAt`, \(T =\) `duration` in seconds.

**Smoothstep** (Hermite \(S_3\), \(C^1\) at endpoints):

\[
S(\tau) = \tau^2 (3 - 2\tau)
\]

Ideals interpolate:

\[
\mathbf{c} = \operatorname{lerp}(\mathbf{c}_{\text{from}},\,\mathbf{c}_{\text{to}},\,S(\tau)), \qquad
\mathbf{l} = \operatorname{lerp}(\mathbf{l}_{\text{from}},\,\mathbf{l}_{\text{to}},\,S(\tau))
\]

FOV (linear in same \(S(\tau)\)):

\[
\text{FOV} = (1-S)\,\text{FOV}_{\text{from}} + S\,\text{FOV}_{\text{to}}
\]

Endpoints: FP uses store `firstPersonFov`; TP uses `thirdPerson.defaultFov` (**65** / **58** defaults in config).

### 8. Camera position / FOV follow (post-ideal)

**Position** toward ideal \(\mathbf{c}\) with exponential smoothing:

\[
\alpha_p = 1 - e^{-k_p\,\Delta t}
\]

\(k_p =\) `transition.positionSmoothing` during a mode transition, else `smoothing.position`. The smoothed position **lerps** toward \(\mathbf{c}\) by \(\alpha_p\) each frame (same pattern for look target).

**FOV** (outside transition): target FOV follows mode; smoothed value chases target with:

\[
\alpha_f = 1 - e^{-k_f\,\Delta t}, \quad k_f = \texttt{transition.fovSmoothing}
\]

### 9. Player body visibility (anti-pop)

Let \(S = S(\tau_{\text{raw}})\) as above during transition. With `fromMode`, `toMode`, and store `mode` (already the **target** mode after toggle):

\[
\text{visible} =
(\text{mode}=\text{TP}) \;\lor\;
(\text{toMode}=\text{TP} \land S > 0.1) \;\lor\;
(\text{fromMode}=\text{TP} \land S < 0.5)
\]

So **TP→FP** keeps the mesh visible for the **first half** of the eased curve; **FP→TP** can show the body once \(S > 0.1\) even while settling.

---

## QA results

### Automated

- **`npm run build -w web`** — succeeded at documentation time (TypeScript + Vite production build).

### Manual (recommended checklist)

Derived from the milestone spec; run in the prototype scene with dev server:

| # | Check |
|---|--------|
| 1 | **C** toggles FP / TP without snapping; **no second C** accepted mid-transition. |
| 2 | **, / .** zoom: TP distance and FP FOV change within clamps. |
| 3 | **A/D** rotate smoothly; movement still aligns with yaw. |
| 4 | **TP near walls**: camera pulls in (mild obstruction); **severe** case raises view (HUD: `severe`, blend → 1). |
| 5 | Leaving obstruction: blend returns toward 0; camera settles behind player. |
| 6 | **FP** unaffected by top-down logic (no obstruction HUD drive when not in TP context). |
| 7 | **Interactables**, **exit zone**, and **area complete** still behave as before. |

*(Record pass/fail and notes here after playtesting.)*

---

## Explicitly not in scope (this milestone)

Full camera physics, transparency through geometry, hiding walls, minimap, mouse-look, dynamic roof culling, cutscenes, fade-to-black, motion blur.

---

## Follow-ups (optional)

- Remove or gate **HUD debug** lines (`Camera obstruction`, `Top-down blend`) behind a dev flag when no longer needed.
- Tune `obstructionThreshold`, top-down heights, and blend speeds per art direction.
- Consider reusing `smoothing.fov` vs `transition.fovSmoothing` if FP zoom feel should differ from “steady-state chase” tuning.
