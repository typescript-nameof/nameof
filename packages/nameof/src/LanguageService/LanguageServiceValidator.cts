import ts from "typescript";
import { ILanguageServiceContext } from "./ILanguageServiceContext.cjs";
import { LanguageServiceFeatures } from "./LanguageServiceFeatures.cjs";
import { ITypeScriptContext } from "../Transformation/ITypeScriptContext.cjs";
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

    /**
     * Transforms the specified {@linkcode node}.
     *
     * @param node
     * The node to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @param tsContext
     * The context of the typescript transformation.
     *
     * @returns
     * The transformed representation of the specified {@linkcode node}.
     */
    protected override VisitNode<T extends ts.Node>(node: T, context: ITypeScriptContext, tsContext: ts.TransformationContext): T
    {
        super.VisitNode(node, context, tsContext);
        return node;
    }
}
