import { MODULE_ID } from "../constants";

export const SMOOTH_CAMERA_MOVEMENT = "smoothCameraMovement";
export const CAMERA_FOLLOW_DURATION = "cameraFollowDuration";

export function registerSmoothCameraMovementSettings() {
    game.settings?.register(MODULE_ID, SMOOTH_CAMERA_MOVEMENT, {
        name: "Smooth Camera Movement",
        hint: "Animate camera movement while following the token instead of snapping instantly.",
        scope: "client",
        config: true,
        default: true,
        type: Boolean,
    });

    game.settings?.register(MODULE_ID, CAMERA_FOLLOW_DURATION, {
        name: "Camera Follow Smoothing",
        hint: "How quickly the camera catches up to the token, in milliseconds. Lower values are more responsive; higher values are more cinematic.",
        scope: "client",
        config: true,
        default: 180,
        type: Number,
        range: {
            min: 50,
            max: 600,
            step: 10,
        },
    });
}

export function isSmoothCameraMovementEnabled(): boolean {
    return game.settings?.get(MODULE_ID, SMOOTH_CAMERA_MOVEMENT) !== false;
}

export function getCameraFollowDuration(): number {
    const value = Number(
        game.settings?.get(MODULE_ID, CAMERA_FOLLOW_DURATION) ?? 180
    );
    return Number.isFinite(value) ? Math.max(0, value) : 180;
}
