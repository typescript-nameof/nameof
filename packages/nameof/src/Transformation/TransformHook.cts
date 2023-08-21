import { Node } from "typescript";

/**
 * Represents a hook for for customizing transformations.
 */
export type TransformHook =
    /**
     * Handles the transformation of a node.
     *
     * @param oldNode
     * The original node.
     *
     * @param newNode
     * The replacement of the {@linkcode oldNode}.
     */
    (oldNode: Node, newNode: Node) => void;
