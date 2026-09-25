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
