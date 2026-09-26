import { MODULE_ID } from "../constants";
import {
    areTokenHudAppearanceControlsEnabled,
    getTokenArtMaxScale,
    getTokenArtScaleStep,
} from "../settings/tokenHudAppearance";

type VisualNovelState = {
    alternateSrc?: string;
    active?: boolean;
    baseSrc?: string;
    baseScaleX?: number;
    baseScaleY?: number;
    alternateScaleX?: number;
    alternateScaleY?: number;
};

const FLAG_KEY = "visualNovelAppearance";
const MIN_SCALE = 0.25;

export function setupTokenHUDAppearanceControls() {
    Hooks.on("renderTokenHUD", (hud: TokenHUD, html: HTMLElement) => {
        if (!areTokenHudAppearanceControlsEnabled()) return;

        const tokenDocument = getHudTokenDocument(hud);
        if (!tokenDocument?.isOwner) return;

        const rightColumn = html.querySelector(".col.right");
        if (!rightColumn) return;

        if (rightColumn.querySelector('[data-twa-control="alternate-art"]'))
            return;

        const state = getState(tokenDocument);

        const alternate = makeButton(
            "alternate-art",
            "fa-solid fa-masks-theater",
            state.active
                ? "Return to map token art"
                : "Toggle visual-novel token art"
        );
        if (state.active) alternate.classList.add("active");

        alternate.addEventListener("click", async (event) => {
            event.preventDefault();
            event.stopPropagation();

            let currentState = getState(tokenDocument);
            if (!currentState.alternateSrc) {
                const selected = await chooseAlternateImage(tokenDocument);
                if (!selected) return;
                currentState = getState(tokenDocument);
            }

            await toggleAlternateArt(tokenDocument, currentState);
        });

        alternate.addEventListener("contextmenu", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await chooseAlternateImage(tokenDocument);
        });

        const scaleUp = makeButton(
            "scale-up",
            "fa-solid fa-up-right-and-down-left-from-center",
            "Increase token art scale (Shift: +1.0, right-click: reset)"
        );
        scaleUp.addEventListener("click", async (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            await changeCurrentScale(
                tokenDocument,
                event.shiftKey ? 1 : getTokenArtScaleStep()
            );
        });
        scaleUp.addEventListener("contextmenu", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await resetCurrentScale(tokenDocument);
        });

        const scaleDown = makeButton(
            "scale-down",
            "fa-solid fa-down-left-and-up-right-to-center",
            "Decrease token art scale (Shift: -1.0, right-click: reset)"
        );
        scaleDown.addEventListener("click", async (event: MouseEvent) => {
            event.preventDefault();
            event.stopPropagation();
            await changeCurrentScale(
                tokenDocument,
                -(event.shiftKey ? 1 : getTokenArtScaleStep())
            );
        });
        scaleDown.addEventListener("contextmenu", async (event) => {
            event.preventDefault();
            event.stopPropagation();
            await resetCurrentScale(tokenDocument);
        });

        // Requested placement: right HUD column.
        // Prepending in reverse gives: alternate art, scale up, scale down.
        rightColumn.prepend(scaleDown);
        rightColumn.prepend(scaleUp);
        rightColumn.prepend(alternate);
    });
}

function makeButton(
    control: string,
    icon: string,
    tooltip: string
): HTMLDivElement {
    const button = document.createElement("div");
    button.className = "control-icon";
    button.dataset.twaControl = control;
    button.dataset.tooltip = tooltip;
    button.setAttribute("aria-label", tooltip);
    button.innerHTML = `<i class="${icon}"></i>`;
    return button;
}

function getHudTokenDocument(hud: TokenHUD): TokenDocument | undefined {
    const raw = hud as any;
    const candidate =
        raw.object?.document ??
        raw.document ??
        raw.token?.document ??
        raw.object;

    return candidate?.documentName === "Token"
        ? (candidate as TokenDocument)
        : undefined;
}

function getState(tokenDocument: TokenDocument): VisualNovelState {
    return (
        ((tokenDocument.flags as any)?.[MODULE_ID]?.[FLAG_KEY] as
            | VisualNovelState
            | undefined) ?? {}
    );
}

function textureState(tokenDocument: TokenDocument) {
    const texture = tokenDocument.texture as any;
    return {
        src: String(texture?.src ?? ""),
        scaleX: finiteScale(texture?.scaleX, 1),
        scaleY: finiteScale(texture?.scaleY, 1),
    };
}

function finiteScale(value: unknown, fallback: number): number {
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric !== 0 ? numeric : fallback;
}

async function chooseAlternateImage(
    tokenDocument: TokenDocument
): Promise<string | null> {
    const state = getState(tokenDocument);
    const current =
        state.alternateSrc ??
        (state.active ? state.baseSrc : undefined) ??
        String((tokenDocument.texture as any)?.src ?? "");

    return new Promise((resolve) => {
        const Picker = foundry.applications.apps.FilePicker;
        const picker = new Picker({
            type: "image",
            current,
            callback: async (path: string) => {
                const selected = String(path ?? "").trim();
                if (!selected) {
                    resolve(null);
                    return;
                }

                const latest = getState(tokenDocument);
                const next: VisualNovelState = {
                    ...latest,
                    alternateSrc: selected,
                };

                const update: Record<string, unknown> = {
                    [`flags.${MODULE_ID}.${FLAG_KEY}`]: next,
                };
                if (latest.active) update["texture.src"] = selected;

                await tokenDocument.update(update);
                resolve(selected);
            },
        });

        picker.addEventListener(
            "close",
            () => resolve(null),
            { once: true }
        );
        void picker.render({ force: true });
    });
}

async function toggleAlternateArt(
    tokenDocument: TokenDocument,
    state = getState(tokenDocument)
) {
    const current = textureState(tokenDocument);

    if (state.active) {
        if (!state.baseSrc) {
            ui.notifications?.warn(
                "Token Walk Animation could not restore the map token art because no base image was saved."
            );
            return;
        }

        const next: VisualNovelState = {
            ...state,
            active: false,
            alternateScaleX: current.scaleX,
            alternateScaleY: current.scaleY,
        };

        await tokenDocument.update({
            "texture.src": state.baseSrc,
            "texture.scaleX": finiteScale(state.baseScaleX, 1),
            "texture.scaleY": finiteScale(state.baseScaleY, 1),
            [`flags.${MODULE_ID}.${FLAG_KEY}`]: next,
        });
        return;
    }

    if (!state.alternateSrc) return;

    const next: VisualNovelState = {
        ...state,
        active: true,
        baseSrc: current.src,
        baseScaleX: current.scaleX,
        baseScaleY: current.scaleY,
    };

    await tokenDocument.update({
        "texture.src": state.alternateSrc,
        "texture.scaleX": finiteScale(
            state.alternateScaleX,
            current.scaleX
        ),
        "texture.scaleY": finiteScale(
            state.alternateScaleY,
            current.scaleY
        ),
        [`flags.${MODULE_ID}.${FLAG_KEY}`]: next,
    });
}

async function changeCurrentScale(
    tokenDocument: TokenDocument,
    delta: number
) {
    const current = textureState(tokenDocument);
    const magnitude = Math.max(
        Math.abs(current.scaleX),
        Math.abs(current.scaleY),
        MIN_SCALE
    );

    const target = Math.min(
        getTokenArtMaxScale(),
        Math.max(MIN_SCALE, magnitude + delta)
    );

    const factor = target / magnitude;
    const scaleX = current.scaleX * factor;
    const scaleY = current.scaleY * factor;

    await updateCurrentScale(tokenDocument, scaleX, scaleY);
}

async function resetCurrentScale(tokenDocument: TokenDocument) {
    const current = textureState(tokenDocument);
    await updateCurrentScale(
        tokenDocument,
        current.scaleX < 0 ? -1 : 1,
        current.scaleY < 0 ? -1 : 1
    );
}

async function updateCurrentScale(
    tokenDocument: TokenDocument,
    scaleX: number,
    scaleY: number
) {
    const state = getState(tokenDocument);
    const next: VisualNovelState = state.active
        ? {
              ...state,
              alternateScaleX: scaleX,
              alternateScaleY: scaleY,
          }
        : {
              ...state,
              baseSrc: String(
                  (tokenDocument.texture as any)?.src ??
                      state.baseSrc ??
                      ""
              ),
              baseScaleX: scaleX,
              baseScaleY: scaleY,
          };

    await tokenDocument.update({
        "texture.scaleX": scaleX,
        "texture.scaleY": scaleY,
        [`flags.${MODULE_ID}.${FLAG_KEY}`]: next,
    });
}
