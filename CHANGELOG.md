# 14.0.0-beta.15 — Live Actors camera controls compatibility

- Added a Live Actors compatibility fix for its client-scoped `videoCleanControls` setting.
- Live Actors defaults that setting to enabled, which hides the camera/audio control buttons after the UI finishes loading.
- When both modules are active, Token Walk Animation now sets `live-actors.videoCleanControls` to `false` on each client and removes any stale `lva-clean-controls` class immediately.
- This applies independently in every player's browser, so players keep their camera/audio controls visible without modifying the Live Actors repository.

# 14.0.0-beta.14 — Remove camera follow

- Removed Token Walk Animation's custom camera-follow runtime from mouse and WASD/arrow-key movement.
- Removed the **Follow Token Camera**, **Smooth Camera Movement**, and **Camera Follow Smoothing** client settings.
- Removed the legacy camera-padding registration and the Token camera-follow handler.
- WASD/arrow-key movement animation, movement styles, facing, and Token Speed timing remain enabled; only automatic viewport tracking was removed.
- This prevents the camera jitter/stutter that could be visible to players while the viewport tried to follow an animated Token.

# 14.0.0-beta.13 — Live Actors artwork handoff fix

- Fixed a second Live Actors conflict distinct from horizontal facing.
- Live Actors caches the PIXI texture it considers the token's "original" artwork and restores that texture after speech/viseme animation.
- When Token Walk Animation switches between map art and Visual-Novel art, the compatibility layer now rebases Live Actors onto the TokenDocument's current `texture.src` after Live Actors finishes its own update hook.
- Stale Live Actors texture/lerp/viseme caches are cleared, Foundry refits the current artwork, and Live Actors is allowed to rediscover visemes using the new active filename.
- This prevents an older map-token texture from being restored when speech begins or ends.
- The beta.12 scale-sign synchronization remains in place.

# 14.0.0-beta.12 — Live Actors facing compatibility

- Added optional interoperability with **Live Actors** when both modules are active.
- Fixed Live Actors speech/viseme animation restoring a previously cached horizontal facing and visually unflipping a Token.
- Token Walk Animation now synchronizes only the **sign** of Live Actors' X-scale caches (`origScaleX`, `baseScaleX`, `scaleX`, and `swapFitX`) with the Token document's current `texture.scaleX`.
- Live Actors remains responsible for bounce/stretch/viseme scale magnitude; Token Walk Animation only preserves left/right facing.
- A low-priority PIXI ticker reasserts the facing sign after Live Actors' own canvas animation tick, including held `-closed` viseme frames and Dynamic Token Ring refits.
- No Live Actors database writes or settings are modified.

# 14.0.0-beta.11 — Mouse/keyboard speed parity and continuous camera follow

- Fixed WASD/arrow-key movement running noticeably faster than mouse movement.
- Foundry v14 keyboard animation options are now written at the Token update-operation level, where core actually reads them.
- One keyboard grid step now uses the same **Token Speed** duration as one mouse-driven movement step (default 0.5 seconds).
- Keyboard camera follow now explicitly starts/stops a camera-follow session instead of calling follow while the camera handler was inactive.
- WASD camera tracking bypasses the drag dead-zone and continuously follows the controlled Token while preserving the current zoom.
- **Smooth Camera Movement** and **Camera Follow Smoothing** now apply during keyboard movement.

# 14.0.0-beta.10 — Synchronized WASD rendering

- Fixed the Token artwork and shadow/ring becoming visually separated during WASD/arrow-key movement.
- Foundry v14 now remains responsible for the complete keyboard movement position animation (mesh, shadow, dynamic ring, borders and markers).
- Token Walk Animation decorates the core keyboard animation with jump/fly/swim/climb/burrow/crawl/teleport visuals instead of running a second competing position animation.
- Corrected handling of `TokenLayer._prepareKeyboardMovementUpdates()`: Foundry v14 stores movement options per Token ID rather than directly on the movement record.
- Camera follow and scale-preserving auto-facing remain integrated with keyboard movement.
- Remote clients can decorate the same core movement when the `moveToken` hook is received.

# 14.0.0-beta.9 — Native scale-preserving token facing

- Added **Auto Flip Token Facing**, a native replacement for the core behavior of Token Facing Flip.
- Horizontal movement now mirrors artwork while preserving its absolute texture scale: e.g. `5x -> -5x` instead of resetting the art to `-1x`.
- Auto-facing is integrated directly into Token Walk Animation's mouse and WASD/arrow-key animation path.
- When auto-facing is enabled, directional token rotation is suppressed so illustrated tokens remain upright.
- Added Ctrl+F manual horizontal flip and Ctrl+B base-facing toggle for selected tokens.
- Base facing is stored per scene Token.
- Added a compatibility warning when **Token Facing Flip** is active because both modules write `texture.scaleX` during movement.
- Recommended setup: disable Token Facing Flip and enable **Auto Flip Token Facing** in Token Walk Animation.

# 14.0.0-beta.8 — WASD / arrow-key animation

- Added **Animate WASD / Arrow-Key Movement** client setting, enabled by default.
- Foundry v14 keyboard movement (`method: "keyboard"`) now uses Token Walk Animation's jump/movement animation instead of teleporting between grid spaces.
- Keyboard movement keeps Foundry's normal movement operation, collision constraints, and movement history; only the core visual animation/pan is replaced.
- Repeated key presses queue individual grid-step animations instead of discarding intermediate steps.
- Movement-specific animation styles also apply to keyboard movement based on the Token's current movement action.
- Native camera follow can follow the controlled Token during keyboard animation without changing zoom.

# 14.0.0-beta.7 — Token HUD visual-novel controls

- Added three Token HUD controls in the **right column**: alternate art, increase visual scale, and decrease visual scale.
- Left-click the alternate-art button to toggle between normal map art and a second visual-novel art image.
- If no alternate image is configured yet, the first left-click opens Foundry's File Picker; right-click the button can be used later to replace the alternate image.
- Normal map art and alternate visual-novel art remember **independent texture scales**.
- Scale buttons change only `texture.scaleX/scaleY`; Token width/height and grid footprint are untouched.
- Visual scale can exceed the standard Token configuration UI range, with a configurable maximum (default 8x, up to 20x).
- Shift-click scale buttons changes scale by 1.0; right-click either scale button resets the currently displayed art to 1x.
- Added a setting to disable the Token HUD appearance controls entirely.

# 14.0.0-beta.6 — System integration profiles

- Added a **System Integration** setting with Auto-detect, System Agnostic, D&D 5e, Legend in the Mist / Mist Engine, and Custom Actor Data Path profiles.
- Auto-detect recognizes the current official LitM system (`mist-engine-fvtt`), `litmv2`, the archived `litm` system, and common community LitM system IDs.
- LitM/System Agnostic profiles no longer look for D&D-style Actor speed fields and therefore do not show the invalid movement-path warning.
- Added **Agnostic / LitM Base Movement**, expressed in grid spaces (default 6).
- D&D5e keeps per-Actor walk/fly/swim/climb/burrow speed integration.
- Custom Actor Data Path remains available for other systems that expose a numeric movement property.

# 14.0.0-beta.5 — D&D5e movement schema fix

- Added native support for the current D&D5e movement schema at `system.attributes.movement.speeds.*`.
- Preserved compatibility with the older `system.attributes.movement.*` schema.
- Existing worlds using the old default movement path are migrated automatically when modern D&D5e actor data is detected.
- Movement-mode discovery now reads both modern `movement.speeds` and legacy flat movement fields.
- Unsupported movement modes no longer trigger a false "invalid data path" warning when walking speed is valid.

# 14.0.0-beta.4 — Native camera follow

- Removed the runtime dependency on Aeris Cinematic View for camera movement.
- Replaced Aeris camera calls with Foundry v14 `canvas.animatePan()`.
- Camera follow now preserves the current zoom level instead of zooming out to fit the movement range.
- Added **Follow Token Camera**, **Smooth Camera Movement**, and **Camera Follow Smoothing** client settings.
- Added a camera dead-zone to avoid constantly pulling the viewport for tiny token movements.
- Camera follows both drag previews and the final animated token movement.

# 14.0.0-beta.3 — Token Walk Animation

- Renamed the package ID from `aeris-tokens` to `token-walk-animation`.
- Added one-time migration support for settings and movement-history flags saved under the old `aeris-tokens` namespace.
- Preserved legacy `aeris-tokens.*` API hooks while adding the new `token-walk-animation.*` hook names.
- Updated module asset/template paths for the new package folder.
- Raised Foundry compatibility to 14.367+ and verified against 14.368 release/API notes.
- Release ZIP is now `token-walk-animation.zip`.

# v14 Community Beta 2

- Fixed movement budget accumulation across multiple drags in one combat turn.
- Synced the Token HUD movement action at every drag start.
- Added automatic Foundry v14 and actor movement-mode discovery.
- Enabled movement history by default with a one-time beta migration.
- Added optional experimental movement-specific animations setting.

## v13.0.19

### Fixed

-   Corrected manifest url

## v13.0.17

### Fixed

-   Movement will now ignore native walls due to conflicts.
-   Drop events beyond the canvas rect are now correctly handled

## v13.0.16

### Changed

-   Removed `this.renderFlags.delete("redraw")` to improve texture updates

## v13.0.15

### Fixed

-   Movement pathfinding now correctly expands based on the **maximum available movement mode**

## v13.0.14

### Changed

-   Movement pathfinding now expands based on the **maximum available movement mode** (e.g. 60 ft Fly speed), ensuring the grid is fully explored.
-   Reachable tiles are still restricted to the **currently selected movement mode** (e.g. 30 ft Walk), so previews no longer incorrectly include tiles from longer actions.

## v13.0.13

### Fixed

-   Update tokenDocument default movementAction if changed while dragging

## v13.0.12

### Added

-   Ingame documentation via `Aeris Core`
