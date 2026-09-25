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

// scope here to only warn once per setting
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
        // A valid base path with no value for this particular mode simply
        // means the Actor cannot use that movement mode. Do not fabricate a
        // six-space speed or warn about an otherwise-correct setting.
        const configuredBaseValue =
            typeof movementPathSetting === "string"
                ? Number(foundry.utils.getProperty(actor, movementPathSetting))
                : movementPathSetting;
        if (Number.isFinite(configuredBaseValue) && configuredBaseValue > 0)
            return [];

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

function resolveMovementValue(
    actor: Actor,
    movementPathSetting: string | number,
    rawMode: string
): number | undefined {
    if (typeof movementPathSetting === "number") return movementPathSetting;
    if (!movementPathSetting.length) return undefined;

    const normalMode = MODE_ALIASES[rawMode.toLowerCase()] ?? rawMode.toLowerCase();
    const candidates: string[] = [];

    if (normalMode === "walk") candidates.push(movementPathSetting);

    if (/\.walk$/i.test(movementPathSetting)) {
        candidates.push(
            movementPathSetting.replace(/\.walk$/i, `.${normalMode}`)
        );
    }

    candidates.push(`system.attributes.movement.${normalMode}`);

    for (const path of Array.from(new Set(candidates))) {
        const value = foundry.utils.getProperty(actor, path);
        const numeric = Number(value);
        if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }

    // Modes such as crawling, climbing and swimming can be derived from walk
    // speed by systems which represent their extra cost in the movement action.
    if (WALK_DERIVED_MODES.has(normalMode)) {
        const walkCandidates = [
            movementPathSetting,
            "system.attributes.movement.walk",
        ];
        for (const path of Array.from(new Set(walkCandidates))) {
            const value = foundry.utils.getProperty(actor, path);
            const numeric = Number(value);
            if (Number.isFinite(numeric) && numeric > 0) return numeric;
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
