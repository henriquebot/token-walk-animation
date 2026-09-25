import { LEGACY_MODULE_ID, MODULE_TITLE } from "./constants";

export function compatibilityCheck() {
    if (game.modules?.get(LEGACY_MODULE_ID)?.active) {
        ui.notifications?.error(
            `${MODULE_TITLE}: disable the old Aeris Tokens module before using this renamed package. Running both at once will patch the same token movement code twice.`,
            { permanent: true }
        );
    }

    if (game.modules?.get("terrainmapper")?.active) {
        ui.notifications?.warn(
            `${MODULE_TITLE} is currently incompatible with Terrain Mapper. Using them together will cause issues.`
        );
    }
}
