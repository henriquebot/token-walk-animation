export function getMovementActionLabel(mode: MovementMode) {
    const action = CONFIG.Token.movement?.actions?.[mode];
    if (action?.label) return game.i18n?.localize(action.label) ?? action.label;

    const value = String(mode || "walk");
    return value.charAt(0).toUpperCase() + value.slice(1);
}
