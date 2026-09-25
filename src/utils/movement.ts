import { callPreGetMovementValue } from "../api/preGetMovementValue";
import { getGridColorConfig } from "../settings/gridColor";
import {
    getBaseMovementOverride,
    getMovementMultiplier,
} from "../settings/movementMultiplier";
import {
    getDefaultPath,
    getMovementSystemPath,
} from "../settings/movementPropertyPath";

const README_URL = "https://github.com/henriquebot/token-walk-animation#troubleshooting";

let warnedPath: string | null = null;

const WALK_DERIVED_MODES = new Set([
    "crawl",
    "crouch",
    "prone",
    "sneak",
    "jump",
    "climb",
    "swim",
]);

const MODE_ALIASES: Record<string, string> = {
    walking: "walk",
    ground: "walk",
    speed: "walk",
    crouched: "crawl",
    agachado: "crawl",
    swimming: "swim",
    flying: "fly",
    hover: "fly",
    climbing: "climb",
    burrowing: "burrow",
};

export function getMovementValue(
    actor: Actor | null,
    mode: MovementMode
): MovementRange[] {
    if (actor === null) return [];
    const override = callPreGetMovementValue(actor, mode);
    if (override) return override;

    const { available, bonus } = getGridColorConfig();

    const baseOverride = getBaseMovementOverride();
    if (baseOverride)
        return [
            { value: baseOverride, rgb: available.rgb, a: available.alpha },
        ];

    const movementPathSetting = getMovementSystemPath(actor);
    const movementValue = resolveMovementValue(
        actor,
        movementPathSetting,
        String(mode)
    );

    if (typeof movementValue !== "number") {
        // If walking speed can be resolved, the configured schema is valid and
        // this particular movement action simply is not available to the Actor.
        const walkValue = resolveMovementValue(actor, movementPathSetting, "walk");
        if (typeof walkValue === "number" && walkValue > 0) return [];

        if (warnedPath !== movementPathSetting) {
            warnedPath = movementPathSetting as string;
            ui.notifications?.warn(
                `Please select a valid data path for movement for your system's actors, i.e. "${getDefaultPath()}".<br>
                    If you need help, please see the <a href="${README_URL}" target="_blank" rel="noopener">
                    Troubleshooting section of the README.
                </a>.`
            );
        }
        return [
            {
                value: 6,
                rgb: available.rgb,
                a: available.alpha,
            },
        ];
    }

    if (!Number.isFinite(movementValue) || movementValue <= 0) return [];

    const ranges = [
        {
            value: movementValue,
            rgb: available.rgb,
            a: available.alpha,
        },
    ];

    const movementMultiplier = getMovementMultiplier();
    if (movementMultiplier > 1)
        ranges.push({
            value: movementValue * movementMultiplier,
            rgb: bonus.rgb,
            a: bonus.alpha,
        });

    return ranges;
}

function readNumericMovementValue(actor: Actor, path: string): number | undefined {
    const value = foundry.utils.getProperty(actor, path);

    if (typeof value === "object" && value !== null) {
        const nested = Number((value as any).value);
        if (Number.isFinite(nested) && nested > 0) return nested;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function movementCandidates(
    movementPathSetting: string,
    normalMode: string
): string[] {
    const candidates: string[] = [];

    if (normalMode === "walk") candidates.push(movementPathSetting);

    if (/\.walk$/i.test(movementPathSetting)) {
        candidates.push(movementPathSetting.replace(/\.walk$/i, `.${normalMode}`));
    }

    // D&D5e 6.x schema.
    candidates.push(`system.attributes.movement.speeds.${normalMode}`);

    // D&D5e <=5.x and other systems using the old flat movement object.
    candidates.push(`system.attributes.movement.${normalMode}`);

    if (normalMode === "walk") {
        // Compatibility alias used by some D&D5e data/roll contexts.
        candidates.push("system.attributes.movement.speed");
    }

    return Array.from(new Set(candidates));
}

function resolveMovementValue(
    actor: Actor,
    movementPathSetting: string | number,
    rawMode: string
): number | undefined {
    if (typeof movementPathSetting === "number") return movementPathSetting;
    if (!movementPathSetting.length) return undefined;

    const normalMode =
        MODE_ALIASES[rawMode.toLowerCase()] ?? rawMode.toLowerCase();

    for (const path of movementCandidates(movementPathSetting, normalMode)) {
        const numeric = readNumericMovementValue(actor, path);
        if (numeric !== undefined) return numeric;
    }

    if (WALK_DERIVED_MODES.has(normalMode)) {
        for (const path of movementCandidates(movementPathSetting, "walk")) {
            const numeric = readNumericMovementValue(actor, path);
            if (numeric !== undefined) return numeric;
        }
    }

    return undefined;
}

export function movementRangesEqual(
    a: MovementRange[],
    b: MovementRange[]
): boolean {
    if (a.length !== b.length) return false;
    return a.every(
        (r, i) => r.value === b[i].value && r.rgb === b[i].rgb && r.a === b[i].a
    );
}

export function maxMovementRange(ranges: MovementRange[]): number {
    if (!ranges.length) return 0;
    return Math.max(...ranges.map((r) => r.value));
}
