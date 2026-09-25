import { MODULE_ID } from "../constants";
import { AerisToken } from "../token/aerisToken";

export const ENABLE_COMBAT_MOVEMENT_HISTORY = "enableCombatMovementHistory";
const BETA2_HISTORY_MIGRATION = "beta2MovementHistoryDefaultMigrated";

export function registerEnableCombatMovementHistorySetting() {
    game.settings?.register(MODULE_ID, ENABLE_COMBAT_MOVEMENT_HISTORY, {
        name: "Enable Movement History in Combat",
        hint: "If enabled, total movement during a combat turn is tracked and accumulated across multiple drags. Movement resets at the start of the token's turn or when manually reset with the Token HUD.",
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });

    game.settings?.register(MODULE_ID, BETA2_HISTORY_MIGRATION, {
        scope: "world",
        config: false,
        default: false,
        type: Boolean,
    });
}

/** Enable the corrected beta-2 behaviour once for worlds created with beta 1. */
export async function migrateMovementHistoryDefault() {
    if (!game.user?.isGM) return;
    const migrated =
        game.settings?.get(MODULE_ID, BETA2_HISTORY_MIGRATION) ?? false;
    if (migrated) return;

    await game.settings?.set(MODULE_ID, ENABLE_COMBAT_MOVEMENT_HISTORY, true);
    await game.settings?.set(MODULE_ID, BETA2_HISTORY_MIGRATION, true);
}

export function isCombatMovementHistoryEnabled(): boolean {
    return (
        !!game.combat?.active &&
        (game.settings?.get(MODULE_ID, ENABLE_COMBAT_MOVEMENT_HISTORY) ?? true)
    );
}

export function isCombatMovementHistoryForTokenEnabled(
    token: AerisToken
): boolean {
    const currentCombatant = game.combat?.combatant;
    if (!currentCombatant) return false;

    // Prefer token identity because linked and synthetic Actors can differ by
    // object identity across clients. Fall back to Actor UUID for systems that
    // do not expose a placed Token on the Combatant.
    const combatTokenId = currentCombatant.tokenId ?? currentCombatant.token?.id;
    if (combatTokenId && token.id === combatTokenId)
        return isCombatMovementHistoryEnabled();

    const currentActorUuid = currentCombatant.actor?.uuid;
    return (
        !!currentActorUuid &&
        token.actor?.uuid === currentActorUuid &&
        isCombatMovementHistoryEnabled()
    );
}
