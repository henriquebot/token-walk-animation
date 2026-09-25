/**
 * API surface exposed by the module.
 */
export interface Api {
    docs: {
        registerDocsMenu(
            moduleId: string,
            options?: Partial<ClientSettings.RegisterSubmenu>
        ): void;
    };
}

export declare const aerisCoreApi: Api;
