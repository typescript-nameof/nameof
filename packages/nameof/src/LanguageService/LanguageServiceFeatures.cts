import { IErrorHandler } from "@typescript-nameof/common";
import ts, { Node } from "typescript";
import { LanguageServiceErrorHandler } from "../Diagnostics/LanguageServiceErrorHandler.cjs";
import { ITypeScriptContext } from "../Transformation/ITypeScriptContext.cjs";
import { TypeScriptFeatures } from "../Transformation/TypeScriptFeatures.cjs";

/**
 * Provides features for language service validators.
 */
export class LanguageServiceFeatures extends TypeScriptFeatures
{
    /**
     * Initializes a new instance of the {@linkcode LanguageServiceFeatures} class.
     *
     * @param tsLibrary
     * The TypeScript library.
     */
    public constructor(tsLibrary: typeof ts)
    {
        super({ tsLibrary });
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The newly created error handler.
     */
    protected override InitializeErrorHandler(): IErrorHandler<Node, ITypeScriptContext>
    {
        return new LanguageServiceErrorHandler(this);
    }
}
