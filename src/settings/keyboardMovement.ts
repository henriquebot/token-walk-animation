import { MODULE_ID } from "../constants";

export const ANIMATE_KEYBOARD_MOVEMENT = "animateKeyboardMovement";

export function registerKeyboardMovementAnimationSetting() {
    game.settings?.register(MODULE_ID, ANIMATE_KEYBOARD_MOVEMENT, {
        name: "Animate WASD / Arrow-Key Movement",
        hint: "Use Token Walk Animation's movement animation when a Token is moved with WASD or the arrow keys. Foundry's default keyboard movement animation is replaced only for keyboard movement.",
        scope: "client",
        config: true,
        default: true,
        type: Boolean,
    });
}

export function isKeyboardMovementAnimationEnabled(): boolean {
    return (
        game.settings?.get(MODULE_ID, ANIMATE_KEYBOARD_MOVEMENT) ?? true
    );
}
