// eslint-disable-next-line node/no-unpublished-import
import type { PluginPass } from "@babel/core";
import { ParseOptions } from "../parse";

/**
 * Represents the context of a `babel` transformation.
 */
export type BabelContext = ParseOptions & {
    /**
     * The state of the plugin.
     */
    state: PluginPass;
};
