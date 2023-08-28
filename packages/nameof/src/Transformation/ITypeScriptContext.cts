import { ITransformationContext } from "@typescript-nameof/common";
import { Node, SourceFile } from "typescript";

/**
 * Represents the context of a transformation.
 */
export interface ITypeScriptContext extends ITransformationContext<Node>
{
    /**
     * The file that is transformed.
     */
    file: SourceFile;

    /**
     * A hook to execute after a node has been transformed.
     *
     * @param oldNode
     * The node that has been transformed.
     *
     * @param newNode
     * The replacement of the {@linkcode oldNode}.
     */
    postTransformHook?: (oldNode: Node, newNode: Node) => void;
}
