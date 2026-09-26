import { isMoveCameraOnHoldEnabled } from "../../settings/moveCameraOnHold";
import {
    getCameraFollowDuration,
    isSmoothCameraMovementEnabled,
} from "../../settings/smoothCameraMovement";
import { AerisToken } from "../aerisToken";

/**
 * Native Foundry v14 camera follower.
 *
 * Preserves the user's current zoom. Dragging uses a viewport dead-zone while
 * keyboard movement can request continuous tracking so WASD feels like a
 * smooth follow camera rather than a sequence of delayed recenter operations.
 */
export class TokenZoomHandler {
    private followSources = new Set<string>();
    private panInFlight = false;
    private queuedPoint: { x: number; y: number } | null = null;
    private queuedForce = false;

    constructor(private token: AerisToken) {}

    get following(): boolean {
        return this.followSources.size > 0;
    }

    startFollowing(source = "movement") {
        if (!isMoveCameraOnHoldEnabled()) return;
        this.followSources.add(source);
    }

    stopFollowing(source = "movement") {
        this.followSources.delete(source);
        if (!this.following) {
            this.queuedPoint = null;
            this.queuedForce = false;
        }
    }

    async zoomOut(_origin: { x: number; y: number }) {
        this.startFollowing("drag");
    }

    async zoomBackIn() {
        this.stopFollowing("drag");
    }

    follow(point: { x: number; y: number }, force = false) {
        if (!this.following || !isMoveCameraOnHoldEnabled()) return;
        if (!canvas?.ready || !canvas.stage || !canvas.app?.renderer) return;

        this.queuedPoint = point;
        this.queuedForce ||= force;
        if (this.panInFlight) return;
        void this.flushFollowQueue();
    }

    private async flushFollowQueue() {
        const point = this.queuedPoint;
        const force = this.queuedForce;
        this.queuedPoint = null;
        this.queuedForce = false;
        if (!point || !this.following) return;

        const stage = canvas!.stage!;
        const scale = stage.scale.x || 1;
        const pivot = stage.pivot;
        const screen = canvas!.app!.renderer.screen;

        // Dragging keeps a generous central safe area. Keyboard follow asks
        // for force=true so the camera continuously tracks the moving Token.
        if (!force) {
            const deadZoneX = (screen.width / (2 * scale)) * 0.65;
            const deadZoneY = (screen.height / (2 * scale)) * 0.65;
            const dx = point.x - pivot.x;
            const dy = point.y - pivot.y;

            if (
                Math.abs(dx) <= deadZoneX &&
                Math.abs(dy) <= deadZoneY
            )
                return;
        }

        const duration = isSmoothCameraMovementEnabled()
            ? getCameraFollowDuration()
            : 0;

        this.panInFlight = true;
        try {
            await canvas!.animatePan({
                x: point.x,
                y: point.y,
                scale,
                duration,
                easing: "easeInOutCosine",
            });
        } catch (error) {
            console.warn(
                "Token Walk Animation | Could not follow token with camera",
                error
            );
        } finally {
            this.panInFlight = false;
            if (this.queuedPoint && this.following)
                void this.flushFollowQueue();
        }
    }
}
