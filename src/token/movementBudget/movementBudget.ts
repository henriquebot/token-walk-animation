import { callResetMovement } from "../../api/resetMovement";
import { LEGACY_MODULE_ID, MODULE_ID } from "../../constants";
import { isCombatMovementHistoryForTokenEnabled } from "../../settings/movementHistory";
import { AerisToken } from "../aerisToken";

export class MovementBudgetContext {
    /**
     * Keeps the just-finished drag available synchronously while the Actor flag
     * is travelling through Foundry's async document update workflow.
     */
    private optimisticDistanceMoved: number | null = null;

    get priorTurnCost(): number {
        if (!isCombatMovementHistoryForTokenEnabled(this.token)) {
            this.optimisticDistanceMoved = null;
            return 0;
        }

        const stored =
            this.token.actor?.flags?.[MODULE_ID]?.distanceMoved ??
            this.token.actor?.flags?.[LEGACY_MODULE_ID]?.distanceMoved ??
            0;

        if (this.optimisticDistanceMoved === null) return stored;

        // Once the document update catches up, the Actor flag becomes the
        // source of truth again. Until then, preserve the locally known value
        // so a second drag cannot reset the movement budget.
        if (stored === this.optimisticDistanceMoved) {
            this.optimisticDistanceMoved = null;
            return stored;
        }

        return this.optimisticDistanceMoved;
    }

    async set(movement: number) {
        this.optimisticDistanceMoved = movement;
        try {
            await this.token.actor?.setFlag(
                MODULE_ID,
                "distanceMoved",
                movement
            );
        } catch (error) {
            this.optimisticDistanceMoved = null;
            throw error;
        }
    }

    async reset() {
        if (!this.token.actor) return;
        this.optimisticDistanceMoved = 0;
        try {
            await this.token.actor.setFlag(MODULE_ID, "distanceMoved", 0);
            await callResetMovement(this.token.actor);
        } finally {
            this.optimisticDistanceMoved = null;
        }
    }

    constructor(private token: AerisToken) {}
}
