import { TransformerBase, UnusedInterpolationError } from "@typescript-nameof/common";
import { Node, SourceFile, TransformationContext, TransformerFactory } from "typescript";
import { ITypeScriptContext } from "./ITypeScriptContext";
import { TypeScriptAdapter } from "./TypeScriptAdapter";
import { TypeScriptFeatures } from "./TypeScriptFeatures";

/**
 * Provides a basic implementation of a TypeScript transformer.
 *
 * @template TFeatures
 * The type of the features for the transformer.
 */
export abstract class TypeScriptTransformerBase<TFeatures extends TypeScriptFeatures> extends TransformerBase<Node, ITypeScriptContext, TFeatures>
{
    /**
     * Initializes a new instance of the {@linkcode TypeScriptTransformerBase} class.
     *
     * @param features
     * The features of the transformer.
     */
    public constructor(features: TFeatures)
    {
        super(features);
    }

    /**
     * Gets a component for creating a transformer.
     */
    public get Factory(): TransformerFactory<SourceFile>
    {
        return (tsContext) =>
        {
            return (file) =>
            {
                return this.VisitSourceFile(file, tsContext);
            };
        };
    }

    /**
     * Transforms the specified {@linkcode file}.
     *
     * @param file
     * The file to transform.
     *
     * @param tsContext
     * The context of the typescript transformation.
     *
     * @returns
     * The transformed representation of the specified {@linkcode file}.
     */
    public VisitSourceFile(file: SourceFile, tsContext: TransformationContext): SourceFile
    {
        let context: ITypeScriptContext = { file };
        let adapter = new TypeScriptAdapter(this.Features);

        let result = this.VisitNode(
            new TypeScriptAdapter(this.Features),
            file,
            context,
            tsContext);

        let remainingCall = context.interpolationCalls?.[0];

        if (remainingCall)
        {
            new UnusedInterpolationError(adapter, remainingCall, context).ReportAction();
        }

        return result;
    }

    /**
     * Transforms the specified {@linkcode node}.
     *
     * @param transformer
     * A component for performing the transformation.
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
    protected VisitNode<T extends Node>(transformer: TypeScriptAdapter, node: T, context: ITypeScriptContext, tsContext: TransformationContext): T
    {
        node = this.Features.TypeScript.visitEachChild(
            node,
            (node) =>
            {
                return this.VisitNode(transformer, node, context, tsContext);
            },
            tsContext);

        return transformer.Transform(node, context) as T ?? node;
    }
}
