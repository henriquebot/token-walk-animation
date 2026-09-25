import { isMoveCameraOnHoldEnabled } from "../../settings/moveCameraOnHold";
import {
    getCameraFollowDuration,
    isSmoothCameraMovementEnabled,
} from "../../settings/smoothCameraMovement";
import { AerisToken } from "../aerisToken";

/**
 * Native Foundry v14 camera follower.
 *
 * The old implementation delegated to Aeris Cinematic View and deliberately
 * changed the canvas scale to fit the full movement range. That is the source
 * of the visible zoom-out when the two Aeris modules are used together.
 *
 * This implementation only uses Canvas#animatePan, preserves the user's current
 * scale, and applies a viewport dead-zone so the camera moves only when needed.
 */
export class TokenZoomHandler {
    private following = false;
    private panInFlight = false;
    private queuedPoint: { x: number; y: number } | null = null;

    constructor(private token: AerisToken) {}

    async zoomOut(_origin: { x: number; y: number }) {
        if (!isMoveCameraOnHoldEnabled()) return;
        this.following = true;
    }

    async zoomBackIn() {
        this.following = false;
        this.queuedPoint = null;
    }

    follow(point: { x: number; y: number }) {
        if (!this.following || !isMoveCameraOnHoldEnabled()) return;
        if (!canvas?.ready || !canvas.stage || !canvas.app?.renderer) return;

        this.queuedPoint = point;
        if (this.panInFlight) return;
        void this.flushFollowQueue();
    }

    private async flushFollowQueue() {
        const point = this.queuedPoint;
        this.queuedPoint = null;
        if (!point || !this.following) return;

        const stage = canvas!.stage!;
        const scale = stage.scale.x || 1;
        const pivot = stage.pivot;
        const screen = canvas!.app!.renderer.screen;

        // Keep a generous central safe area. Camera motion starts only when
        // the token leaves roughly the middle 65% of the viewport.
        const deadZoneX = (screen.width / (2 * scale)) * 0.65;
        const deadZoneY = (screen.height / (2 * scale)) * 0.65;
        const dx = point.x - pivot.x;
        const dy = point.y - pivot.y;

        if (Math.abs(dx) <= deadZoneX && Math.abs(dy) <= deadZoneY) return;

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
            if (this.queuedPoint && this.following) void this.flushFollowQueue();
        }
    }
}
