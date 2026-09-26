import { isKeyboardMovementAnimationEnabled } from "../settings/keyboardMovement";
import { AerisToken } from "./aerisToken";

export function setupKeyboardMovementAnimation() {
    Hooks.on(
        "moveToken",
        (
            document: TokenDocument,
            movement: any,
            _operation: any,
            user: User
        ) => {
            if (!isKeyboardMovementAnimationEnabled()) return;
            if (movement?.method !== "keyboard") return;

            const token = document.object as AerisToken | null | undefined;
            if (!token?.mesh || token.isAerisDrag()) return;

            // The initiating client prepares this state before the database
            // update in TokenLayer._prepareKeyboardMovementUpdates. Other
            // clients learn about the movement here and can decorate Foundry's
            // own full-token movement animation too.
            if (token.jumpHandler.hasCoreKeyboardAnimation()) return;

            const origin = movement?.origin;
            const destination = movement?.destination;
            if (!origin || !destination) return;

            const originX = Number(origin.x);
            const originY = Number(origin.y);
            const destinationX = Number(destination.x);
            const destinationY = Number(destination.y);
            if (
                !Number.isFinite(originX) ||
                !Number.isFinite(originY) ||
                !Number.isFinite(destinationX) ||
                !Number.isFinite(destinationY)
            )
                return;

            const isCaller = user?.id === game.userId;

            token.jumpHandler.prepareCoreKeyboardAnimation(
                { x: originX, y: originY },
                { x: destinationX, y: destinationY },
                (document.movementAction as MovementMode | null) ??
                    token.dragActionHandler.currentAction ??
                    "walk",
                isCaller
            );
        }
    );
}
