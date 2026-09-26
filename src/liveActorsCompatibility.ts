/**
 * Optional interoperability with Live Actors.
 *
 * Live Actors owns token.mesh.scale while its canvas speech animation is active.
 * Its cached lerp state can predate a later horizontal facing flip, causing a
 * flipped token to appear unflipped as soon as speech/viseme animation starts.
 *
 * We intentionally synchronize only the SIGN of X scale. Live Actors remains
 * fully responsible for the magnitude used by bounce, stretch and viseme fitting.
 */
let liveActorsAnimator: any = null;
let tickerInstalled = false;

export async function setupLiveActorsCompatibility() {
    if (!game.modules?.get("live-actors")?.active) return;

    try {
        const route = foundry.utils.getRoute(
            "modules/live-actors/scripts/canvas-animator.mjs"
        );
        const module = await import(/* @vite-ignore */ route);
        liveActorsAnimator = module?.CanvasAnimator;

        if (!liveActorsAnimator) {
            console.warn(
                "Token Walk Animation | Live Actors is active, but CanvasAnimator could not be resolved."
            );
            return;
        }

        Hooks.on(
            "updateToken",
            (document: TokenDocument, changes: Record<string, unknown>) => {
                if (
                    !foundry.utils.hasProperty(
                        changes,
                        "texture.scaleX"
                    )
                )
                    return;

                syncLiveActorsFacing(document);
            }
        );

        if (!tickerInstalled) {
            // Live Actors registers its canvas animator at PIXI's normal
            // priority. Run later so its bounce/viseme magnitude is preserved
            // while the Token's facing sign is reasserted.
            PIXI.Ticker.shared.add(
                enforceLiveActorsFacing,
                undefined,
                -100
            );
            tickerInstalled = true;
        }

        // A token may already be tracked by Live Actors when this module reaches
        // ready (for example after a hot reload). Normalize those states once.
        for (const tokenId of liveActorsAnimator._targets?.keys?.() ?? []) {
            const document = canvas?.tokens?.get(tokenId)?.document;
            if (document) syncLiveActorsFacing(document);
        }

        console.info(
            "Token Walk Animation | Live Actors facing compatibility enabled."
        );
    } catch (error) {
        console.warn(
            "Token Walk Animation | Could not enable Live Actors facing compatibility.",
            error
        );
    }
}

function getFacingSign(document: TokenDocument): 1 | -1 {
    const scaleX = Number((document.texture as any)?.scaleX ?? 1);
    return scaleX < 0 ? -1 : 1;
}

function applySign(value: unknown, sign: 1 | -1): unknown {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric === 0) return value;
    return Math.abs(numeric) * sign;
}

function syncLiveActorsFacing(document: TokenDocument) {
    if (!liveActorsAnimator) return;

    const sign = getFacingSign(document);
    const state = liveActorsAnimator._lerped?.get?.(document.id);

    // These are the exact horizontal scale caches used by Live Actors 1.3.x.
    // Feature detection keeps this harmless if a future release changes them.
    if (state) {
        for (const key of [
            "origScaleX",
            "baseScaleX",
            "scaleX",
            "swapFitX",
        ]) {
            if (state[key] !== undefined)
                state[key] = applySign(state[key], sign);
        }
    }

    const token = document.object as Token | null | undefined;
    if (token?.mesh) {
        const magnitude = Math.abs(Number(token.mesh.scale.x) || 1);
        token.mesh.scale.x = magnitude * sign;
    }
}

function enforceLiveActorsFacing() {
    if (!liveActorsAnimator || !canvas?.ready) return;

    const targets = liveActorsAnimator._targets;
    if (!targets?.size) return;

    for (const tokenId of targets.keys()) {
        const document = canvas.tokens?.get(tokenId)?.document;
        if (!document) continue;

        // Live Actors may re-fit a viseme texture (including Dynamic Ring)
        // during the same frame, which can refresh its cached base scale.
        // Re-normalize the cache and rendered mesh after its own ticker.
        syncLiveActorsFacing(document);
    }
}
