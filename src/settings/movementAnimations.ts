import { MODULE_ID } from "../constants";

const MOVEMENT_SPECIFIC_ANIMATIONS = "movementSpecificAnimations";

export function registerMovementSpecificAnimationsSetting() {
    game.settings?.register(MODULE_ID, MOVEMENT_SPECIFIC_ANIMATIONS, {
        name: "Experimental Movement-Specific Animations",
        hint: "Use distinct, conservative animations for flying, swimming, climbing, burrowing, crawling, and teleporting. Disabled by default for maximum compatibility.",
        scope: "client",
        config: true,
        default: false,
        type: Boolean,
    });
}

export function useMovementSpecificAnimations(): boolean {
    return (
        game.settings?.get(MODULE_ID, MOVEMENT_SPECIFIC_ANIMATIONS) ?? false
    );
}
