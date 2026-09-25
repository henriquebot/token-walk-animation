import { MODULE_ID } from "../constants";

export const MOVE_CAMERA_ON_HOLD = "moveCameraOnHold";

export function registerMoveCameraOnHoldSetting() {
    game.settings?.register(MODULE_ID, MOVE_CAMERA_ON_HOLD, {
        name: "Follow Token Camera",
        hint: "Keep the camera following the token while dragging or while Token Walk Animation is playing the movement. The current zoom level is preserved and Aeris Cinematic View is not required.",
        scope: "client",
        config: true,
        default: true,
        type: Boolean,
    });
}

export function isMoveCameraOnHoldEnabled(): boolean {
    return game.settings?.get(MODULE_ID, MOVE_CAMERA_ON_HOLD) === true;
}
