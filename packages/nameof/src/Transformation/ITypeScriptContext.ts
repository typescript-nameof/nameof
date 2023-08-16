import { SourceFile } from "typescript";

/**
 * Represents the context of a transformation.
 */
export interface ITypeScriptContext
{
    /**
     * The file that is transformed.
     */
    file?: SourceFile;
}
