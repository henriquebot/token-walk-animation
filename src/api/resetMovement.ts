import { LEGACY_MODULE_ID, MODULE_ID } from "../constants";

export function callResetMovement(actor: Actor) {
    Hooks.callAll(`${MODULE_ID}.resetMovement`, actor);
    Hooks.callAll(`${LEGACY_MODULE_ID}.resetMovement`, actor);
}
