import type { PluginPass, types } from "@babel/core" assert { "resolution-mode": "import" };
import { ITransformationContext } from "@typescript-nameof/common";

/**
 * Represents the context of a `babel` transformation.
 */
export interface IBabelContext extends ITransformationContext<types.Node>
{
    /**
     * The state of the plugin.
     */
    state: PluginPass;

    /**
     * Expected identifier name at the start of the call expression. This could be different when using a macro.
     *
     * @default "nameof"
     */
    nameofName?: string;
}
