# Token Walk Animation — Foundry VTT v14 Community Beta 11

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

## Beta 7 visual-novel Token HUD controls

- Three new controls are placed in the Token HUD right column: alternate art, scale up, and scale down.
- Alternate art is selected with Foundry's File Picker and is stored on the scene Token.
- Map art and visual-novel art remember separate visual scales.
- Scaling affects only token texture scale, not grid footprint, and can exceed 3x (default maximum 8x, configurable up to 20x).
- Shift-click changes scale by 1.0 and right-click on a scale control resets the current form to 1x.

## Beta 8 keyboard movement animation

- WASD and arrow-key movement now use the same Token Walk Animation movement animation as mouse-driven movement.
- The feature uses Foundry v14's keyboard movement method rather than listening to raw key presses.
- Repeated keyboard movement queues each grid step and supports the currently selected movement action/style.
- A client setting can disable the custom keyboard animation and restore Foundry's default behavior.

## Beta 9 native token facing

- Token Walk Animation can now automatically mirror illustrated token art left/right during movement.
- The facing system preserves large Visual-Novel scales instead of forcing scaleX to +/-1.
- Mouse and keyboard movement use the same facing logic.
- Ctrl+F manually flips selected tokens; Ctrl+B toggles the artwork's natural/base facing.
- Disable the separate Token Facing Flip module when using this feature because both modules update texture.scaleX.

## Beta 10 WASD render synchronization

- Fixed the token shadow/ring reaching the keyboard destination before the artwork.
- Foundry now owns the complete x/y animation for keyboard movement; Token Walk Animation only adds the movement-style visual overlay to the artwork.
- This keeps shadow, dynamic ring, border and other token presentation synchronized while retaining the custom jump/movement feel.

## Beta 11 keyboard speed and camera follow

- WASD/arrow-key movement now uses the same Token Speed timing as mouse movement.
- Corrected Foundry v14 animation options to the operation level instead of the per-token movement entry.
- Keyboard movement explicitly starts native camera following and continuously tracks the controlled Token without the drag dead-zone.
- Smooth camera timing and zoom preservation remain configurable with the existing camera settings.
