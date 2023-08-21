import ts from "typescript";

/**
 * Provides settings for the typescript plugin.
 */
export interface IPluginConfig
{
    /**
     * A module specifier to load `typescript` from or an actual `typescript` instance.
     */
    tsLibrary?: string | typeof ts;
}
