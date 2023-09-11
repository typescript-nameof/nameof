import { Diagnostic } from "typescript";
import { ITypeScriptContext } from "../Transformation/ITypeScriptContext.cjs";

/**
 * Represents the context of a language service validation.
 */
export interface ILanguageServiceContext extends ITypeScriptContext
{
    /**
     * The diagnostics reported by TypeScript.
     */
    diagnostics?: Diagnostic[];
}
