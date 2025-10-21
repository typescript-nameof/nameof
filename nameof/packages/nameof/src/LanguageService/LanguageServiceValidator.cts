import ts from "typescript";
import { ILanguageServiceContext } from "./ILanguageServiceContext.cjs";
import { LanguageServiceFeatures } from "./LanguageServiceFeatures.cjs";
import { TypeScriptTransformerBase } from "../Transformation/TypeScriptTransformerBase.cjs";

/**
 * Provides the functionality to validate files for a language service.
 */
export class LanguageServiceValidator extends TypeScriptTransformerBase<LanguageServiceFeatures>
{
    /**
     * Initializes a new instance of the {@linkcode LanguageServiceValidator} class.
     *
     * @param tsLibrary
     * The TypeScript library.
     */
    public constructor(tsLibrary: typeof ts)
    {
        super(new LanguageServiceFeatures(tsLibrary));
    }

    /**
     * Validates the specified {@linkcode sourceFile}.
     *
     * @param sourceFile
     * The file to validate.
     *
     * @param compilerOptions
     * The options of the compilation.
     *
     * @returns
     * The issues in the specified {@linkcode sourceFile}.
     */
    public Validate(sourceFile: ts.SourceFile, compilerOptions?: ts.CompilerOptions): ts.Diagnostic[]
    {
        let context: Partial<ILanguageServiceContext> = { diagnostics: [] };
        this.Features.TypeScript.transform(sourceFile, [this.GetFactory(context)], compilerOptions);
        return context.diagnostics ?? [];
    }
}
