import { TransformerBase, UnusedInterpolationError } from "@typescript-nameof/common";
import { Node, SourceFile, TransformationContext, TransformerFactory } from "typescript";
import { ITypeScriptContext } from "./ITypeScriptContext";
import { TransformHook } from "./TransformHook";
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
     * An adapter for parsing and dumping nodes.
     */
    private adapter: TypeScriptAdapter;

    /**
     * Initializes a new instance of the {@linkcode TypeScriptTransformerBase} class.
     *
     * @param features
     * The features of the transformer.
     */
    public constructor(features: TFeatures)
    {
        super(features);
        this.adapter = new TypeScriptAdapter(this.Features);
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
     * Gets a component for parsing and dumping nodes.
     */
    protected get Adapter(): TypeScriptAdapter
    {
        return this.adapter;
    }

    /**
     * Gets a factory with a pre-defined {@linkcode context}.
     *
     * @param postTransformHook
     * A hook to execute after transforming a node.
     *
     * @returns
     * A newly created factory with a pre-defined {@linkcode context}.
     */
    public GetFactory(postTransformHook: TransformHook): TransformerFactory<SourceFile>
    {
        return (tsContext) =>
        {
            return (file) =>
            {
                return this.VisitSourceFile(file, tsContext, postTransformHook);
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
     * @param postTransformHook
     * A hook to execute after transforming a node.
     *
     * @returns
     * The transformed representation of the specified {@linkcode file}.
     */
    public VisitSourceFile(file: SourceFile, tsContext: TransformationContext, postTransformHook?: TransformHook): SourceFile
    {
        let context: ITypeScriptContext = { file };
        context.postTransformHook = postTransformHook;

        let adapter = new TypeScriptAdapter(this.Features);

        let result = this.VisitNode(
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
    public VisitNode<T extends Node>(node: T, context: ITypeScriptContext, tsContext: TransformationContext): T
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
