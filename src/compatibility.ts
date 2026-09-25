export function compatibilityCheck() {
    if (game.modules?.get("terrainmapper")?.active) {
        ui.notifications?.warn(
            "Aeris Tokens is currently incompatible with Terrain Mapper. Using them together will cause issues."
        );
    }
}
