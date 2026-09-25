import { MODULE_ID } from "../constants";

export const CAMERA_PAN_PADDING = "cameraPanPadding";
export const CAMERA_PAN_PADDING_CHANGED = "cameraPanPaddingChanged";

/**
 * Retained for migration from Aeris Tokens. Native camera follow preserves the
 * user's current zoom and therefore does not use the old zoom-out padding.
 */
export function registerCameraPanPaddingSetting() {
    game.settings?.register(MODULE_ID, CAMERA_PAN_PADDING, {
        name: "Legacy Camera Pan Padding",
        hint: "Retained only to migrate older Aeris settings. Token Walk Animation's native camera follow preserves the current zoom level.",
        scope: "client",
        config: false,
        default: 1,
        type: Number,
        range: {
            min: 0,
            max: 5,
            step: 0.1,
        },
    });
}
