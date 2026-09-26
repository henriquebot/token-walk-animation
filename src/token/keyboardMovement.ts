import { isKeyboardMovementAnimationEnabled } from "../settings/keyboardMovement";
import { AerisToken } from "./aerisToken";

export function setupKeyboardMovementAnimation() {
    Hooks.on(
        "moveToken",
        async (
            document: TokenDocument,
            movement: any,
            _operation: any,
            user: User
        ) => {
            if (!isKeyboardMovementAnimationEnabled()) return;
            if (movement?.method !== "keyboard") return;

            const token = document.object as AerisToken | null | undefined;
            if (!token?.mesh || token.isAerisDrag()) return;

            const origin = movement?.origin;
            const destination = movement?.destination;
            if (
                !origin ||
                !destination ||
                (!Number.isFinite(origin.x) &&
                    !Number.isFinite(origin.y)) ||
                (!Number.isFinite(destination.x) &&
                    !Number.isFinite(destination.y))
            )
                return;

            if (
                Number(origin.x) === Number(destination.x) &&
                Number(origin.y) === Number(destination.y)
            )
                return;

            const mode =
                (document.movementAction as MovementMode | null) ??
                token.dragActionHandler.currentAction ??
                "walk";

            await token.jumpHandler.animateKeyboardMovement(
                {
                    x: Number(origin.x ?? token.x),
                    y: Number(origin.y ?? token.y),
                },
                {
                    x: Number(destination.x ?? token.x),
                    y: Number(destination.y ?? token.y),
                },
                mode,
                Boolean(user?.isSelf && token.controlled)
            );
        }
    );
}
