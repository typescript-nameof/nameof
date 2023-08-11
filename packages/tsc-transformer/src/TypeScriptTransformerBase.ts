import { NameofNodeTransformer, TransformerBase } from "@typescript-nameof/common";
import { Node, SourceFile, TransformationContext, TransformerFactory } from "typescript";
import { TypeScriptFeatures } from "./Transformation/TypeScriptFeatures";
import { TypeScriptAdapter } from "./TypeScriptAdapter";

/**
 * Provides a basic implementation of a TypeScript transformer.
 *
 * @template TFeatures
 * The type of the features for the transformer.
 */
export abstract class TypeScriptTransformerBase<TFeatures extends TypeScriptFeatures> extends TransformerBase<Node, TFeatures>
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
        return (context) =>
        {
            return (file) =>
            {
                return this.VisitSourceFile(file, context);
            };
        };
    }

    /**
     * Transforms the specified {@linkcode file}.
     *
     * @param file
     * The file to transform.
     *
     * @param context
     * The context of the transformation.
     *
     * @returns
     * The transformed representation of the specified {@linkcode file}.
     */
    public VisitSourceFile(file: SourceFile, context: TransformationContext): SourceFile
    {
        return this.VisitNode(
            new NameofNodeTransformer(new TypeScriptAdapter(file)),
            file,
            context);
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
     * The context of the transformation.
     *
     * @returns
     * The transformed representation of the specified {@linkcode node}.
     */
    protected VisitNode<T extends Node>(transformer: NameofNodeTransformer<Node>, node: T, context: TransformationContext): T
    {
        node = this.Features.TypeScript.visitEachChild(
            node,
            (node) =>
            {
                return this.VisitNode(transformer, node, context);
            },
            context);

        return transformer.Transform(node) as T ?? node;
    }
}
