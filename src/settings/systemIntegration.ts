import { MODULE_ID } from "../constants";

export const SYSTEM_INTEGRATION_PROFILE = "systemIntegrationProfile";
export const AGNOSTIC_BASE_MOVEMENT = "agnosticBaseMovement";

export type SystemIntegrationProfile =
    | "auto"
    | "agnostic"
    | "dnd5e"
    | "litm"
    | "custom";

const LITM_SYSTEM_IDS = new Set([
    "mist-engine-fvtt",
    "litmv2",
    "foundryvtt-litm",
    "legend-in-the-mist-foundry",
    "litm",
]);

export function registerSystemIntegrationSettings() {
    game.settings?.register(MODULE_ID, SYSTEM_INTEGRATION_PROFILE, {
        name: "System Integration",
        hint: "Choose how Token Walk Animation gets movement range. Auto uses D&D5e actor speeds when running D&D5e, uses the LitM/Mist Engine profile for known Legend in the Mist systems, and otherwise falls back to System Agnostic.",
        scope: "world",
        config: true,
        default: "auto",
        type: String,
        choices: {
            auto: "Auto-detect",
            agnostic: "System Agnostic",
            dnd5e: "D&D 5e",
            litm: "Legend in the Mist / Mist Engine",
            custom: "Custom Actor Data Path",
        },
    });

    game.settings?.register(MODULE_ID, AGNOSTIC_BASE_MOVEMENT, {
        name: "Agnostic / LitM Base Movement",
        hint: "Movement range in grid spaces when using System Agnostic or Legend in the Mist / Mist Engine integration. LitM has no D&D-style speed field, so this is a visual/tactical movement budget rather than an Actor statistic.",
        scope: "world",
        config: true,
        default: 6,
        type: Number,
        range: {
            min: 1,
            max: 30,
            step: 1,
        },
    });
}

export function getConfiguredSystemIntegrationProfile(): SystemIntegrationProfile {
    return (
        (game.settings?.get(
            MODULE_ID,
            SYSTEM_INTEGRATION_PROFILE
        ) as SystemIntegrationProfile) ?? "auto"
    );
}

export function getSystemIntegrationProfile(): Exclude<
    SystemIntegrationProfile,
    "auto"
> {
    const configured = getConfiguredSystemIntegrationProfile();
    if (configured !== "auto") return configured;

    const systemId = game.system?.id ?? "";
    if (systemId === "dnd5e") return "dnd5e";
    if (LITM_SYSTEM_IDS.has(systemId)) return "litm";
    return "agnostic";
}

export function getAgnosticBaseMovement(): number {
    const value = Number(
        game.settings?.get(MODULE_ID, AGNOSTIC_BASE_MOVEMENT) ?? 6
    );
    return Number.isFinite(value) && value > 0 ? value : 6;
}

export function isKnownLitMSystem(systemId = game.system?.id ?? ""): boolean {
    return LITM_SYSTEM_IDS.has(systemId);
}
