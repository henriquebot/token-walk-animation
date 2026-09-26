import { isKeyboardMovementAnimationEnabled } from "../settings/keyboardMovement";

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
            objects,
            dx,
            dy,
            dz
        ) {
            const result = wrapped.call(this, objects, dx, dy, dz);
            if (!isKeyboardMovementAnimationEnabled()) return result;
            if (!Array.isArray(result)) return result;

            const updates = result[0];
            const options = result[1] ?? {};

            // Foundry v14 prepares keyboard moves as a bulk Scene update with
            // Token movement options under the movement key. Disable only the
            // core visual animation/pan; the database movement, constraints,
            // history, and keyboard movement method are left intact.
            options.movement ??= {};
            options.movement.animate = false;
            options.movement.pan = false;

            return [updates, options];
        },
        "WRAPPER"
    );
}
