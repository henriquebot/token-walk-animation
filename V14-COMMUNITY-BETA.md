# Token Walk Animation — Foundry VTT v14 Community Beta 6

This is an **unofficial compatibility build** prepared from the original MIT-licensed Aeris Tokens source. It is not an official release by the original author.

## Target

- Foundry VTT 14.367+ (verified 14.368)
- Required: libWrapper 1.13.5.1 or newer
- Required: socketlib 1.1.4 or newer
- Aeris Core and Color Picker are optional

## Beta 2 fixes

- Movement spent during a combat turn is now accumulated across separate drags.
- The just-finished movement is cached immediately while Foundry saves the Actor flag asynchronously.
- Movement history is enabled by default and migrated on first beta-2 startup.
- The movement action selected in the Token HUD is read at the beginning of every drag.
- Foundry v14 selectable movement actions and common actor movement fields are detected automatically.
- Walk, fly, swim, climb, burrow, crawl/crouch, and other system-provided movement modes can use distinct ranges.
- Added optional experimental movement-specific animations, disabled by default.

## Installation

1. Back up the world.
2. Close Foundry.
3. Replace the existing `Data/modules/token-walk-animation/` folder with this version.
4. Start Foundry and enable libWrapper, socketlib, and Token Walk Animation.
5. Test in a copied world before using it in a live session.

## Useful report

After reproducing an error, press F12, open Console, and copy the first red stack trace mentioning `token-walk-animation`.

## Beta 4 camera changes

- Native Foundry v14 camera follow using `canvas.animatePan()`.
- No Aeris Cinematic View requirement.
- Current zoom is preserved while following the token.
- Optional smooth camera movement with configurable catch-up duration.

## Beta 5 D&D5e movement schema

- Supports current D&D5e `system.attributes.movement.speeds.walk/fly/swim/climb/burrow` fields.
- Keeps compatibility with older D&D5e movement fields.
- Migrates the old default movement path automatically where appropriate.
- Avoids false invalid-path warnings for unavailable movement actions.

## Beta 6 system profiles

- Added Auto-detect, System Agnostic, D&D 5e, Legend in the Mist / Mist Engine, and Custom Actor Data Path integration modes.
- LitM/Mist Engine uses a configurable movement budget in grid spaces instead of looking for a D&D-style Actor speed statistic.
- Known LitM system IDs are auto-detected, including the current official `mist-engine-fvtt` and `litmv2`.
- The movement data-path warning is only used by the Custom Actor Data Path profile.
