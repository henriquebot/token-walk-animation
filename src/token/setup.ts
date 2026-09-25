import { LEGACY_MODULE_ID, MODULE_ID } from "../constants";
import { getMovementSystemPath } from "../settings/movementPropertyPath";
import { getGameInterfaceVolume } from "../utils/volume";
import {
    AerisInteractionData,
    AerisToken,
    createAerisTokenClass,
} from "./aerisToken";

export function setupAerisTokens() {
    CONFIG.Token.objectClass = createAerisTokenClass(CONFIG.Token.objectClass);
}

export function setupSupressCanvasPanWhileDragging() {
    //@ts-expect-error protected
    const originalPan = foundry.canvas.Canvas.prototype._onDragCanvasPan;

    //@ts-expect-error protected
    foundry.canvas.Canvas.prototype._onDragCanvasPan = function (
        event: Canvas.Event.Pointer<PIXI.Container<PIXI.DisplayObject>>
    ) {
        const interactionData = event.interactionData as AerisInteractionData;

        const dragTarget = interactionData?.targets?.[0];

        if (dragTarget?.isAerisDrag()) return;

        return originalPan.call(this, event);
    };
}

export function setupBuildReachablesOnCreateToken() {
    Hooks.on(
        "createToken",
        (tokenDoc: TokenDocument, _createOptions: Object, _userId: String) => {
            const token = tokenDoc.object as AerisToken | undefined;
            if (!token) return;
            token.pathStateManager.initBaseReach();
        }
    );
}

export function setupBuildReachablesOnMovementUpdate() {
    Hooks.on("updateActor", (actor: Actor, changes: object) => {
        // TODO FIND CURRENT MODE INSTEAD OF PASSING WALK
        const movementPath = getMovementSystemPath(actor);
        const movementChange = foundry.utils.getProperty(changes, movementPath);
        if (movementChange === undefined) return;

        const token = canvas!.tokens?.placeables.find(
            (t) => t.actor === actor
        ) as AerisToken | undefined;
        if (!token) return;

        token.pathStateManager.initBaseReach();
    });
}

export function setupTokenHUDResetMovementBtn() {
    Hooks.on("renderTokenHUD", (hud: TokenHUD, html: HTMLElement, _data) => {
        const actor = (hud as any).actor as Actor;
        const value =
            actor.flags?.[MODULE_ID]?.distanceMoved ??
            actor.flags?.[LEGACY_MODULE_ID]?.distanceMoved ??
            0;
        if (!value) return;

        const btn = $(
            `<div class="control-icon"><i class="fas fa-undo"></i></div>`
        );
        btn.on("click", () => {
            game.audio?.play(POP_CLICK_AUDIO, {
                volume: getGameInterfaceVolume(),
            });
            actor.setFlag(MODULE_ID, "distanceMoved", 0);
        });

        const jQuery = $(html);

        jQuery?.find(".col.right").prepend(btn);
    });
}

const POP_CLICK_AUDIO = "modules/token-walk-animation/assets/pop_ui_click.ogg";

function resetCombatantMovement(combatant: Combatant | null | undefined) {
    const token = combatant?.token?.object as AerisToken | null | undefined;
    token?.movementBudgetHandler?.reset();
}

export function setupMovementHistory() {
    Hooks.on("combatStart", (combat: Combat) => {
        if (!game.user?.isGM) return;
        combat.combatants.forEach(resetCombatantMovement);
    });

    Hooks.on("combatTurnChange", (combat: Combat, prev: Combat.HistoryData) => {
        if (!game.user?.isGM) return;
        const combatantId = prev.combatantId;
        if (!combatantId) return;

        resetCombatantMovement(combat.combatants.get(combatantId));
    });
}
