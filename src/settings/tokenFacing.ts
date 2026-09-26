import { MODULE_ID } from "../constants";

export const AUTO_FLIP_TOKEN_FACING = "autoFlipTokenFacing";
const BASE_FACING_FLAG = "baseFacing";

type FacingDirection = 1 | -1;

export function registerTokenFacingSettings() {
    game.settings?.register(MODULE_ID, AUTO_FLIP_TOKEN_FACING, {
        name: "Auto Flip Token Facing",
        hint: "Horizontally mirrors token artwork when moving left/right. Unlike Token Facing Flip, the current visual scale is preserved (for example 5x becomes -5x, not -1x).",
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });

    game.keybindings?.register(MODULE_ID, "flipSelectedTokens", {
        name: "Flip selected token artwork horizontally",
        hint: "Manually mirrors selected token artwork without changing its visual scale.",
        editable: [{ key: "KeyF", modifiers: ["Control"] }],
        restricted: false,
        onDown: () => {
            void flipSelectedTokens();
            return true;
        },
    });

    game.keybindings?.register(MODULE_ID, "toggleBaseFacing", {
        name: "Toggle selected token base facing",
        hint: "Switches whether the unmirrored artwork naturally faces right or left.",
        editable: [{ key: "KeyB", modifiers: ["Control"] }],
        restricted: false,
        onDown: () => {
            void toggleBaseFacingForSelectedTokens();
            return true;
        },
    });
}

export function isAutoTokenFacingEnabled(): boolean {
    return game.settings?.get(MODULE_ID, AUTO_FLIP_TOKEN_FACING) ?? false;
}

export function getBaseFacing(document: TokenDocument): FacingDirection {
    const value = Number(document.getFlag(MODULE_ID, BASE_FACING_FLAG) ?? 1);
    return value === -1 ? -1 : 1;
}

export function getDesiredFacingScaleX(
    document: TokenDocument,
    dx: number
): number | null {
    if (!isAutoTokenFacingEnabled() || Math.abs(dx) < 0.001) return null;

    const current = Number((document.texture as any)?.scaleX ?? 1);
    const magnitude =
        Number.isFinite(current) && Math.abs(current) > 0
            ? Math.abs(current)
            : 1;

    const baseFacing = getBaseFacing(document);
    const direction: FacingDirection = dx < 0 ? -1 : 1;

    return magnitude * baseFacing * direction;
}

export function applyFacingToMesh(
    token: Token,
    desiredTextureScaleX: number | null
) {
    if (desiredTextureScaleX === null || !token.mesh) return;

    const sign = Math.sign(desiredTextureScaleX) || 1;
    const magnitude = Math.abs(token.mesh.scale.x) || 1;
    token.mesh.scale.x = magnitude * sign;
}

async function flipSelectedTokens() {
    const tokens = canvas?.tokens?.controlled ?? [];
    if (!tokens.length) {
        ui.notifications?.warn("No token selected.");
        return;
    }

    const updates = tokens.map((token) => {
        const current = Number((token.document.texture as any)?.scaleX ?? 1);
        return {
            _id: token.document.id,
            "texture.scaleX":
                (Number.isFinite(current) && current !== 0 ? current : 1) * -1,
        };
    });

    await canvas?.scene?.updateEmbeddedDocuments("Token", updates, {
        animate: false,
        pan: false,
    });
}

async function toggleBaseFacingForSelectedTokens() {
    const tokens = canvas?.tokens?.controlled ?? [];
    if (!tokens.length) {
        ui.notifications?.warn("No token selected.");
        return;
    }

    const updates = tokens.map((token) => {
        const current = getBaseFacing(token.document);
        return {
            _id: token.document.id,
            [`flags.${MODULE_ID}.${BASE_FACING_FLAG}`]:
                current === 1 ? -1 : 1,
        };
    });

    await canvas?.scene?.updateEmbeddedDocuments("Token", updates, {
        animate: false,
        pan: false,
    });

    ui.notifications?.info(
        "Token Walk Animation | Base facing updated for selected token(s)."
    );
}
