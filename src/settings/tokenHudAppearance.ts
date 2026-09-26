import { MODULE_ID } from "../constants";

export const ENABLE_TOKEN_HUD_APPEARANCE = "enableTokenHudAppearanceControls";
export const TOKEN_ART_SCALE_STEP = "tokenArtScaleStep";
export const TOKEN_ART_MAX_SCALE = "tokenArtMaxScale";

export function registerTokenHudAppearanceSettings() {
    game.settings?.register(MODULE_ID, ENABLE_TOKEN_HUD_APPEARANCE, {
        name: "Token HUD Appearance Controls",
        hint: "Adds alternate-art, increase-scale, and decrease-scale buttons to the right column of the Token HUD.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });

    game.settings?.register(MODULE_ID, TOKEN_ART_SCALE_STEP, {
        name: "Token Art Scale Step",
        hint: "Amount added or removed by the Token HUD art-scale buttons. Shift-click uses a 1.0 step.",
        scope: "client",
        config: true,
        default: 0.25,
        type: Number,
        range: {
            min: 0.05,
            max: 1,
            step: 0.05,
        },
    });

    game.settings?.register(MODULE_ID, TOKEN_ART_MAX_SCALE, {
        name: "Maximum Token Art Scale",
        hint: "Maximum visual texture scale allowed by the Token HUD controls. This can exceed the standard Token configuration UI limit without changing the Token's grid footprint.",
        scope: "world",
        config: true,
        default: 8,
        type: Number,
        range: {
            min: 3,
            max: 20,
            step: 0.5,
        },
    });
}

export function areTokenHudAppearanceControlsEnabled(): boolean {
    return (
        game.settings?.get(MODULE_ID, ENABLE_TOKEN_HUD_APPEARANCE) ?? true
    );
}

export function getTokenArtScaleStep(): number {
    const value = Number(
        game.settings?.get(MODULE_ID, TOKEN_ART_SCALE_STEP) ?? 0.25
    );
    return Number.isFinite(value) && value > 0 ? value : 0.25;
}

export function getTokenArtMaxScale(): number {
    const value = Number(
        game.settings?.get(MODULE_ID, TOKEN_ART_MAX_SCALE) ?? 8
    );
    return Number.isFinite(value) && value >= 3 ? value : 8;
}
