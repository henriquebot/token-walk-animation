import { callGetMovementModes } from "../../api/getMovementModes";
import { getMovementValue } from "../../utils/movement";

export class MovementDataProvider {
    get(actor: Actor | null, tokenDocument?: TokenDocument): MovementData[] {
        if (!actor) return [];

        const hookModes = callGetMovementModes(actor) ?? [];
        const coreModes = getSelectableCoreMovementModes(tokenDocument);
        const actorModes = getActorMovementModes(actor);

        const use: MovementMode[] = Array.from(
            new Set([
                ...coreModes,
                ...hookModes,
                ...actorModes,
                (tokenDocument?.movementAction as MovementMode | null) ??
                    "walk",
            ])
        );

        return use
            .map((mode) => ({ mode, ranges: getMovementValue(actor, mode) }))
            .filter((x) => x.ranges.length);
    }
}

function getSelectableCoreMovementModes(
    tokenDocument?: TokenDocument
): MovementMode[] {
    if (!tokenDocument) return [];

    const actions = CONFIG.Token.movement?.actions ?? {};

    return Object.entries(actions)
        .filter(([, action]) => {
            try {
                const canSelect = action?.canSelect;
                return typeof canSelect === "function"
                    ? canSelect(tokenDocument)
                    : canSelect !== false;
            } catch (error) {
                console.warn(
                    "Token Walk Animation | Could not evaluate movement action",
                    error
                );
                return false;
            }
        })
        .sort(([, a], [, b]) => (a?.order ?? 0) - (b?.order ?? 0))
        .map(([mode]) => mode as MovementMode);
}

function getActorMovementModes(actor: Actor): MovementMode[] {
    const movement = foundry.utils.getProperty(
        actor,
        "system.attributes.movement"
    ) as Record<string, unknown> | undefined;
    if (!movement || typeof movement !== "object") return [];

    const modes = new Set<MovementMode>();

    const addNumericModes = (source: unknown) => {
        if (!source || typeof source !== "object") return;
        for (const [rawMode, value] of Object.entries(
            source as Record<string, unknown>
        )) {
            const candidate =
                typeof value === "object" && value !== null
                    ? (value as any).value
                    : value;
            const numeric = Number(candidate);
            if (!Number.isFinite(numeric) || numeric <= 0) continue;

            const mode = rawMode === "speed" ? "walk" : rawMode;
            if (
                ["bonus", "multiplier", "units", "hover"].includes(mode)
            )
                continue;

            modes.add(mode as MovementMode);
        }
    };

    // D&D5e 6.x.
    addNumericModes((movement as any).speeds);

    // Older D&D5e and systems which store movement modes directly.
    addNumericModes(movement);

    return Array.from(modes);
}
