import type { NodePath } from "@babel/traverse";
import { ParseOptions } from "./parse";

/**
 * Represents the context of a visitor.
 */
export interface ITransformTarget
{
    /**
     * The path to the node to transform.
     */
    path: NodePath;

    /**
     * The options for parsing.
     */
    options?: ParseOptions;
}
