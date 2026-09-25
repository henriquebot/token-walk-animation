# Token Walk Animation — Foundry VTT v14 Community Beta 3

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
