import { LEGACY_MODULE_ID, MODULE_ID } from "./constants";

type StoredValue = { found: boolean; value?: unknown };

function parseStoredValue(value: unknown): unknown {
    if (typeof value !== "string") return value;
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function readStoredValue(scope: "client" | "world", fullKey: string): StoredValue {
    const storage: any = game.settings?.storage.get(scope);
    if (!storage) return { found: false };

    // Client storage implements the localStorage API in Foundry v14.
    if (typeof storage.getItem === "function") {
        const raw = storage.getItem(fullKey);
        if (raw === null || raw === undefined) return { found: false };
        return { found: true, value: parseStoredValue(raw) };
    }

    // World storage is a Collection of Setting documents in Foundry v14.
    let document: any;
    if (typeof storage.getSetting === "function") {
        try {
            document = storage.getSetting(fullKey);
        } catch {
            document = undefined;
        }
    }
    if (!document && typeof storage.find === "function") {
        document = storage.find((entry: any) => entry.key === fullKey);
    }
    if (!document && typeof storage.get === "function") {
        document = storage.get(fullKey);
    }
    if (document) {
        return {
            found: true,
            value: parseStoredValue(document.value ?? document._source?.value),
        };
    }

    return { found: false };
}

async function migrateSettings() {
    const settings: any = game.settings;
    if (!settings) return;

    const configs = Array.from(settings.settings.values()).filter(
        (config: any) => config.namespace === MODULE_ID
    ) as any[];

    for (const config of configs) {
        if (config.scope !== "client" && config.scope !== "world") continue;
        if (config.scope === "world" && !game.user?.isGM) continue;

        const nextFullKey = `${MODULE_ID}.${config.key}`;
        const oldFullKey = `${LEGACY_MODULE_ID}.${config.key}`;

        // Never overwrite a value already explicitly saved under the new ID.
        if (readStoredValue(config.scope, nextFullKey).found) continue;

        const legacy = readStoredValue(config.scope, oldFullKey);
        if (!legacy.found) continue;

        try {
            await settings.set(MODULE_ID, config.key, legacy.value);
        } catch (error) {
            console.warn(
                `Token Walk Animation | Could not migrate setting ${oldFullKey}`,
                error
            );
        }
    }
}

async function migrateActorMovementFlags() {
    if (!game.user?.isGM) return;

    const actors = new Map<string, Actor>();
    for (const actor of game.actors ?? []) actors.set(actor.uuid, actor);

    for (const scene of game.scenes ?? []) {
        for (const token of scene.tokens ?? []) {
            const actor = token.actor;
            if (actor) actors.set(actor.uuid, actor);
        }
    }

    for (const actor of actors.values()) {
        const current = actor.flags?.[MODULE_ID]?.distanceMoved;
        const legacy = actor.flags?.[LEGACY_MODULE_ID]?.distanceMoved;
        if (current !== undefined || legacy === undefined) continue;

        try {
            await actor.setFlag(MODULE_ID, "distanceMoved", legacy);
        } catch (error) {
            console.warn(
                `Token Walk Animation | Could not migrate movement history for ${actor.name}`,
                error
            );
        }
    }
}

export async function migrateLegacyAerisNamespace() {
    await migrateSettings();
    await migrateActorMovementFlags();
}
