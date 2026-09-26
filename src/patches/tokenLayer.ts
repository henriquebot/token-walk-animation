import { isKeyboardMovementAnimationEnabled } from "../settings/keyboardMovement";
import { getTokenMoveSpeed } from "../settings/tokenSpeed";
import { AerisToken } from "../token/aerisToken";

export function patchTokenLayer() {
    libWrapper.register(
        "token-walk-animation",
        "foundry.canvas.layers.TokenLayer.prototype._onCycleViewKey",
        function (this: TokenLayer, wrapped, event) {
            const handled = wrapped.call(this, event);

            //@ts-expect-error untyped
            if (handled && this._draggedToken?.dragActionHandler) {
                //@ts-expect-error untyped
                this._draggedToken.dragActionHandler.handleTab(event.shiftKey);
            }
            return handled;
        },
        "MIXED"
    );

    libWrapper.register(
        "token-walk-animation",
        "foundry.canvas.layers.TokenLayer.prototype._prepareKeyboardMovementUpdates",
        function (
            this: TokenLayer,
            wrapped,
            objects: AerisToken[],
            dx,
            dy,
            dz
        ) {
            const result = wrapped.call(this, objects, dx, dy, dz);
            if (!isKeyboardMovementAnimationEnabled()) return result;
            if (!Array.isArray(result)) return result;

            const [updates, options = {}] = result;
            if (!Array.isArray(updates)) return result;

            // These are operation-level animation options in Foundry v14.
            // Keeping duration fixed here makes one keyboard grid step take
            // exactly the same time as one mouse-driven Token Walk jump.
            const duration = getTokenMoveSpeed() * 1000;
            options.animate = true;
            options.pan = false;
            options.animation = {
                ...(options.animation ?? {}),
                duration,
                linkToMovement: false,
            };

            for (const update of updates) {
                const id = String(update?._id ?? "");
                if (!id) continue;

                const token = objects.find((object) => object.id === id);
                if (!token?.jumpHandler) continue;

                const destinationX = Number(update.x ?? token.document.x);
                const destinationY = Number(update.y ?? token.document.y);
                const originX = Number(token.document.x);
                const originY = Number(token.document.y);

                if (
                    destinationX === originX &&
                    destinationY === originY
                )
                    continue;

                token.jumpHandler.prepareCoreKeyboardAnimation(
                    { x: originX, y: originY },
                    { x: destinationX, y: destinationY },
                    (token.document.movementAction as MovementMode | null) ??
                        token.dragActionHandler.currentAction ??
                        "walk",
                    Boolean(token.controlled),
                    true
                );
            }

            return [updates, options];
        },
        "WRAPPER"
    );
}
