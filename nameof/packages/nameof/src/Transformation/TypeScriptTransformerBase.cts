import { IAdapter, TransformerBase } from "@typescript-nameof/common";
import { Node, SourceFile, TransformationContext, TransformerFactory } from "typescript";
import { ITypeScriptContext } from "./ITypeScriptContext.cjs";
import { TypeScriptAdapter } from "./TypeScriptAdapter.cjs";
import { TypeScriptFeatures } from "./TypeScriptFeatures.cjs";

/**
 * Provides a basic implementation of a TypeScript transformer.
 *
 * @template TFeatures
 * The type of the features for the transformer.
 */
export abstract class TypeScriptTransformerBase<TFeatures extends TypeScriptFeatures> extends TransformerBase<Node, Node, ITypeScriptContext, TFeatures>
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
     * Gets a factory with a pre-defined {@linkcode context}.
     *
     * @param context
     * The context of the transformation.
     *
     * @returns
     * A newly created factory with a pre-defined {@linkcode context}.
     */
    public GetFactory(context: Partial<ITypeScriptContext>): TransformerFactory<SourceFile>
    {
        return (tsContext) =>
        {
            return (file) =>
            {
                return this.VisitSourceFile(file, tsContext, context);
            };
        };
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The newly created adapter.
     */
    protected InitializeAdapter(): IAdapter<Node, Node, ITypeScriptContext>
    {
        return new TypeScriptAdapter(this.Features);
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
     * @param context
     * The context of the transformation.
     *
     * @returns
     * The transformed representation of the specified {@linkcode file}.
     */
    protected VisitSourceFile(file: SourceFile, tsContext: TransformationContext, context?: Partial<ITypeScriptContext>): SourceFile
    {
        let defaults = context ?? {};

        return this.MonitorTransformation(
            (context) =>
            {
                let typeScriptContext: ITypeScriptContext = context as any;
                typeScriptContext.file = file;
                Object.assign(context, defaults);

                return this.VisitNode(file, typeScriptContext, tsContext);
            });
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
    protected VisitNode<T extends Node>(node: T, context: ITypeScriptContext, tsContext: TransformationContext): T
    {
        node = this.Features.TypeScript.visitEachChild(
            node,
            (node) =>
            {
                return this.VisitNode(node, context, tsContext);
            },
            tsContext);

        let result = this.Adapter.Transform(node, context) as T ?? node;
        context.postTransformHook?.(node, result);
        return result;
    }
}
