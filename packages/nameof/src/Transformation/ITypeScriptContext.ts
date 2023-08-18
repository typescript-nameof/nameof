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
}
