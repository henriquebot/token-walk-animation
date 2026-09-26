import { benchmarkCollisionTest } from "./api/benchmark/benchmarkCollisionTest";
import { benchmarkCostPath } from "./api/benchmark/benchmarkCostPath";
import { quickBenchmarkIsLegalStep } from "./api/benchmark/benchmarkLegalStep";
import { quickBenchmarkNavGridRebuild } from "./api/benchmark/benchmarkNavGridRebuild";
import { benchmarkPerceptionPolygon } from "./api/benchmark/benchmarkPerceptionPolygon";
import { benchmarkLightPolygonComputation } from "./api/benchmark/benchmarkPolygonCreate";
import { quickBenchmarkReachableTiles } from "./api/benchmark/benchmarkReachables";
import { benchmarkVisionPolygon } from "./api/benchmark/benchmarkVisionPolygon";
import { compatibilityCheck } from "./compatibility";
import { migrateLegacyAerisNamespace } from "./migrateLegacyNamespace";
import { LocalSweepPolygon } from "./localSweepPolygon";
import { navGrid } from "./navGrid/navGrid";
import { setupNavGridBuild } from "./navGrid/setup";
import { patchTokenLayer } from "./patches/tokenLayer";
import { regionIndexManager } from "./regionIndex/regionIndexManager";
import { setupRegionIndexBuild } from "./regionIndex/setup";
import { registerSettings } from "./settings/_registerSettings";
import { migrateDnd5eMovementDataPaths } from "./settings/movementPropertyPath";
import { migrateMovementHistoryDefault } from "./settings/movementHistory";
import {
    setupWarmGridTravelCacheOnLogin,
    warmGridTravelCache,
} from "./settings/gridSound";
import { bakeFont } from "./settings/worldFont";
import { setupSocket } from "./socket/_socket";
import { MinHeap } from "./structures/minHeap";
import {
    setupAerisTokens,
    setupBuildReachablesOnCreateToken,
    setupBuildReachablesOnMovementUpdate,
    setupMovementHistory,
    setupSupressCanvasPanWhileDragging,
    setupTokenHUDResetMovementBtn,
} from "./token/setup";
import { setupTokenHUDAppearanceControls } from "./token/hudAppearance";
import { setupKeyboardMovementAnimation } from "./token/keyboardMovement";
import { isLegalStep } from "./token/trail/isLegalStep";
import { getRowsCol } from "./utils/rowsCols";
import { getOccupiedTiles } from "./utils/tiles";
import { setupCanvasWallBuild } from "./wallIndex/setup";
import { wallIndexManager } from "./wallIndex/wallIndexManager";

Hooks.once("init", () => {
    patchTokenLayer();
    registerSettings();
    setupAerisTokens();
    setupBuildReachablesOnMovementUpdate();
    setupBuildReachablesOnCreateToken();
    setupCanvasWallBuild();
    setupRegionIndexBuild();
    setupNavGridBuild();
    setupSupressCanvasPanWhileDragging();
    setupTokenHUDResetMovementBtn();
    setupTokenHUDAppearanceControls();
    setupKeyboardMovementAnimation();
    setupMovementHistory();
    bakeFont();
});

Hooks.on("socketlib.ready", () => {
    setupSocket();
});

Hooks.on("ready", () => {
    // @ts-expect-error untyped
    globalThis.LocalSweepPolygon = LocalSweepPolygon;

    const api = {
        MinHeap,
        quickBenchmarkIsLegalStep,
        quickBenchmarkReachableTiles,
        benchmarkCollisionTest,
        benchmarkLightPolygonComputation,
        benchmarkVisionPolygon,
        benchmarkPerceptionPolygon,
        benchmarkCostPath,
        quickBenchmarkNavGridRebuild,
        isLegalStep,
        getOccupiedTiles,
        wallIndexManager,
        regionIndexManager,
        navGrid,
        getRowsCol,
    };

    // New public name plus the original global alias for backwards compatibility.
    (globalThis as any).tokenWalkAnimation = api;
    (globalThis as any).aerisTokens = api;
});

Hooks.on("ready", async () => {
    await migrateLegacyAerisNamespace();
    await migrateDnd5eMovementDataPaths();
    await migrateMovementHistoryDefault();
    warmGridTravelCache();
    setupWarmGridTravelCacheOnLogin();
    compatibilityCheck();
});

Hooks.on("ready", () => {
    // Aeris Core is optional in this community v14 compatibility build.
    try {
        (globalThis as any).aerisCore?.docs?.registerDocsMenu?.("token-walk-animation");
    } catch (error) {
        console.warn("Token Walk Animation | Aeris Core documentation menu unavailable", error);
    }
});
