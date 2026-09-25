import "http://localhost:30001/modules/token-walk-animation/@vite/client";

window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.global = window;

import("http://localhost:30001/modules/token-walk-animation/src/main.ts");
