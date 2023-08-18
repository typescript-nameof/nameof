// eslint-disable-next-line node/no-unpublished-import
import type { Node, PluginPass } from "@babel/core";
import { ITransformationContext } from "@typescript-nameof/common";
import { ParseOptions } from "../parse";

/**
 * Represents the context of a `babel` transformation.
 */
export type BabelContext = ParseOptions & ITransformationContext<Node> & {
    /**
     * The state of the plugin.
     */
    state: PluginPass;
};
