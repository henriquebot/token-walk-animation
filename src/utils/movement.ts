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
import {
    getAgnosticBaseMovement,
    getSystemIntegrationProfile,
} from "../settings/systemIntegration";

const README_URL =
    "https://github.com/henriquebot/token-walk-animation#troubleshooting";

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

    // Kept as the highest-priority compatibility override from earlier builds.
    const baseOverride = Number(getBaseMovementOverride());
    if (Number.isFinite(baseOverride) && baseOverride > 0) {
        return buildRanges(baseOverride, available, bonus);
    }

    const profile = getSystemIntegrationProfile();

    // LitM/Mist Engine intentionally has no D&D-style speed characteristic.
    // System Agnostic uses the same rule: a configurable number of grid cells.
    if (profile === "litm" || profile === "agnostic") {
        const gridDistance = Number(canvas?.grid?.distance ?? 1) || 1;
        const value = getAgnosticBaseMovement() * gridDistance;
        return buildRanges(value, available, bonus);
    }

    let movementValue: number | undefined;
    let movementPathSetting: string | number | undefined;

    if (profile === "dnd5e") {
        movementValue = resolveDnd5eMovementValue(actor, String(mode));
    } else {
        movementPathSetting = getMovementSystemPath(actor);
        movementValue = resolveCustomMovementValue(
            actor,
            movementPathSetting,
            String(mode)
        );
    }

    if (typeof movementValue !== "number") {
        // A valid walking speed means this particular movement mode simply
        // does not exist for the Actor. Do not show a false path warning.
        const walkValue =
            profile === "dnd5e"
                ? resolveDnd5eMovementValue(actor, "walk")
                : resolveCustomMovementValue(
                      actor,
                      movementPathSetting!,
                      "walk"
                  );

        if (typeof walkValue === "number" && walkValue > 0) return [];

        // D&D5e integration should not ask the user for a custom dot-path.
        if (profile === "dnd5e") {
            if (warnedPath !== "dnd5e") {
                warnedPath = "dnd5e";
                ui.notifications?.warn(
                    "Token Walk Animation could not find a D&D5e movement speed on this Actor. You can switch System Integration to System Agnostic for a fixed movement budget."
                );
            }
            return [];
        }

        const warnKey = String(movementPathSetting ?? "");
        if (warnedPath !== warnKey) {
            warnedPath = warnKey;
            ui.notifications?.warn(
                `Please select a valid custom movement data path for this system, e.g. "${getDefaultPath()}".<br>
                    Or set <strong>System Integration</strong> to <strong>System Agnostic</strong>.<br>
                    <a href="${README_URL}" target="_blank" rel="noopener">Troubleshooting section of the README</a>.`
            );
        }
        return [];
    }

    return buildRanges(movementValue, available, bonus);
}

function buildRanges(
    value: number,
    available: { rgb: number; alpha: number },
    bonus: { rgb: number; alpha: number }
): MovementRange[] {
    if (!Number.isFinite(value) || value <= 0) return [];

    const ranges: MovementRange[] = [
        {
            value,
            rgb: available.rgb,
            a: available.alpha,
        },
    ];

    const movementMultiplier = getMovementMultiplier();
    if (movementMultiplier > 1) {
        ranges.push({
            value: value * movementMultiplier,
            rgb: bonus.rgb,
            a: bonus.alpha,
        });
    }

    return ranges;
}

function normalizeMode(rawMode: string): string {
    const value = rawMode.toLowerCase();
    return MODE_ALIASES[value] ?? value;
}

function readNumericMovementValue(
    actor: Actor,
    path: string
): number | undefined {
    const value = foundry.utils.getProperty(actor, path);

    if (typeof value === "object" && value !== null) {
        const nested = Number((value as any).value);
        if (Number.isFinite(nested) && nested > 0) return nested;
    }

    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function dnd5eCandidates(normalMode: string): string[] {
    const candidates = [
        `system.attributes.movement.speeds.${normalMode}`,
        `system.attributes.movement.${normalMode}`,
    ];

    if (normalMode === "walk") {
        candidates.push("system.attributes.movement.speed");
    }

    return candidates;
}

function resolveDnd5eMovementValue(
    actor: Actor,
    rawMode: string
): number | undefined {
    const normalMode = normalizeMode(rawMode);

    for (const path of dnd5eCandidates(normalMode)) {
        const numeric = readNumericMovementValue(actor, path);
        if (numeric !== undefined) return numeric;
    }

    if (WALK_DERIVED_MODES.has(normalMode)) {
        for (const path of dnd5eCandidates("walk")) {
            const numeric = readNumericMovementValue(actor, path);
            if (numeric !== undefined) return numeric;
        }
    }

    return undefined;
}

function customCandidates(
    movementPathSetting: string,
    normalMode: string
): string[] {
    const candidates: string[] = [];

    if (normalMode === "walk") candidates.push(movementPathSetting);

    if (/\.walk$/i.test(movementPathSetting)) {
        candidates.push(
            movementPathSetting.replace(/\.walk$/i, `.${normalMode}`)
        );
    }

    return Array.from(new Set(candidates));
}

function resolveCustomMovementValue(
    actor: Actor,
    movementPathSetting: string | number,
    rawMode: string
): number | undefined {
    if (typeof movementPathSetting === "number") return movementPathSetting;
    if (!movementPathSetting.length) return undefined;

    const normalMode = normalizeMode(rawMode);

    for (const path of customCandidates(movementPathSetting, normalMode)) {
        const numeric = readNumericMovementValue(actor, path);
        if (numeric !== undefined) return numeric;
    }

    if (WALK_DERIVED_MODES.has(normalMode)) {
        for (const path of customCandidates(movementPathSetting, "walk")) {
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
        (r, i) =>
            r.value === b[i].value &&
            r.rgb === b[i].rgb &&
            r.a === b[i].a
    );
}

export function maxMovementRange(ranges: MovementRange[]): number {
    if (!ranges.length) return 0;
    return Math.max(...ranges.map((r) => r.value));
}
