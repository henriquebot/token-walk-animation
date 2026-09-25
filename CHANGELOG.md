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
