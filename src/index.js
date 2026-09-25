import "http://localhost:30001/modules/aeris-tokens/@vite/client";

window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.global = window;

import("http://localhost:30001/modules/aeris-tokens/src/main.ts");
