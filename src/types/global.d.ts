import { aerisCoreApi } from "./aeris-core";
import { SocketLib } from "./socketlib";

declare global {
    var socketlib: SocketLib;
    var aerisCore: typeof aerisCoreApi;
    interface GlobalThis {
        socketlib: SocketLib;
        tokenWalkAnimation?: unknown;
        aerisTokens?: unknown;
        aerisCore: typeof aerisCore;
    }
    interface Window {
        __customPan?: boolean;
    }

    namespace foundry {
        namespace canvas {
            namespace geometry {
                export import ClockwiseSweepPolygon = globalThis.ClockwiseSweepPolygon;
            }
        }
        namespace applications {
            namespace apps {
                export import FilePicker = globalThis.FilePicker;
            }
        }
    }
}
