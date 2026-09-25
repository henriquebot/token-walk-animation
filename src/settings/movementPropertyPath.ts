import { MODULE_ID } from "../constants";

export const PATH_WALK = "movementDataPathSetting";
const LEGACY_DND5E_MOVEMENT_PATH = "system.attributes.movement.walk";
const MODERN_DND5E_MOVEMENT_PATH = "system.attributes.movement.speeds.walk";
const DEFAULT_MOVEMENT_PATH = LEGACY_DND5E_MOVEMENT_PATH;

const defaultPathsWalk = {
    dnd5e: MODERN_DND5E_MOVEMENT_PATH,
    pf2e: "system.attributes.speed.total",
} as const;

export function getDefaultPath(): string {
    const systemId = (game.system?.id ?? "") as keyof typeof defaultPathsWalk;
    return defaultPathsWalk[systemId] ?? DEFAULT_MOVEMENT_PATH;
}

export function registerMovementDataPathSetting() {
    const actorTypes = Actor.implementation.TYPES.filter((t) => t !== "base");

    actorTypes.forEach((a) => {
        //@ts-expect-error untyped;
        game.settings?.register(MODULE_ID, `${PATH_WALK}.${a}`, {
            name: `Movement Property Path (${a})`,
            hint: `Data path to a ${a} actor’s movement property path. Alternatively, enter a number to use that as a flat override for all actors of this type.`,
            scope: "world",
            config: true,
            default: getDefaultPath(),
            type: String,
        });
    });
}

export function getMovementSystemPath(
    actor: Actor.Implementation
): string | number {
    //@ts-expect-error untyped
    const stored = game.settings?.get(MODULE_ID, `${PATH_WALK}.${actor.type}`);

    if (typeof stored === "string" && /^\d+(?:\.\d+)?$/.test(stored))
        return Number(stored);

    if (
        game.system?.id === "dnd5e" &&
        stored === LEGACY_DND5E_MOVEMENT_PATH &&
        foundry.utils.getProperty(actor, MODERN_DND5E_MOVEMENT_PATH) !== undefined
    ) {
        return MODERN_DND5E_MOVEMENT_PATH;
    }

    return typeof stored === "string" && stored.length
        ? stored
        : getDefaultPath();
}

/**
 * D&D5e 6.x moved movement speeds from movement.walk/fly/etc. to
 * movement.speeds.walk/fly/etc. Upgrade only the old built-in default; custom
 * paths chosen by the user are never touched.
 */
export async function migrateDnd5eMovementDataPaths() {
    if (!game.user?.isGM || game.system?.id !== "dnd5e") return;

    for (const actorType of Actor.implementation.TYPES.filter((t) => t !== "base")) {
        const key = `${PATH_WALK}.${actorType}`;
        //@ts-expect-error untyped
        const stored = game.settings?.get(MODULE_ID, key);
        if (stored !== LEGACY_DND5E_MOVEMENT_PATH) continue;

        const hasModernActor = (game.actors ?? []).some(
            (actor) =>
                actor.type === actorType &&
                foundry.utils.getProperty(actor, MODERN_DND5E_MOVEMENT_PATH) !== undefined
        );

        if (!hasModernActor) continue;

        await game.settings?.set(MODULE_ID, key, MODERN_DND5E_MOVEMENT_PATH);
    }
}
