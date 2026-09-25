import { isATAvailable } from "../token/aerisToken";
import { regionIndexManager } from "./regionIndexManager";

export function setupRegionIndexBuild() {
    Hooks.on("canvasReady", () => {
        if (!isATAvailable()) return;

        regionIndexManager.rebuild();
    });
}
