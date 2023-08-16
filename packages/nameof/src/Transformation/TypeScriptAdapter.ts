import { Adapter, NameofCallExpression, Node as NameofNode } from "@typescript-nameof/common";
import ts = require("typescript");
import { ITypeScriptContext } from "./ITypeScriptContext";
import { parse } from "./parse";
import { transform } from "./transform";
import { TypeScriptFeatures } from "./TypeScriptFeatures";
import { VisitSourceFileContext } from "./VisitSourceFileContext";

/**
 * Provides the functionality to parse and dump `nameof` calls for typescript.
 */
export class TypeScriptAdapter extends Adapter<TypeScriptFeatures, ts.Node, ts.Node, ITypeScriptContext>
{
    /**
     * The context of the visitor.
     */
    private context: VisitSourceFileContext;

    /**
     * Initializes a new instance of the {@linkcode TypeScriptAdapter} class.
     *
     * @param features
     * The features of the platform integration.
     */
    public constructor(features: TypeScriptFeatures)
    {
        super(features);

        this.context = {
            interpolateExpressions: new Set()
        };
    }

    /**
     * Gets the context of the visitor.
     */
    public get Context(): VisitSourceFileContext
    {
        return this.context;
    }

    /**
     * Gets the TypeScript compiler instance.
     */
    public get TypeScript(): typeof ts
    {
        return this.Features.TypeScript;
    }

    /**
     * @inheritdoc
     *
     * @param input
     * The input to extract the node from.
     *
     * @returns
     * The node that was extracted from the specified {@linkcode input}.
     */
    public Extract(input: ts.Node): ts.Node
    {
        return input;
    }


    /**
     * @inheritdoc
     *
     * @param item
     * The item to get the source code from.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The code of the specified {@linkcode item}.
     */
    public ExtractCode(item: ts.Node, context: ITypeScriptContext): string
    {
        return item.getText(context.file);
    }

    /**
     * @inheritdoc
     *
     * @param item
     * The item to parse.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The parsed `nameof` expression.
     */
    public LegacyParse(item: ts.Node, context: ITypeScriptContext): NameofCallExpression | undefined
    {
        try
        {
            this.Transform(item, context);
        }
        catch
        { }

        return parse(item, context.file, this.Context);
    }

    /**
     * @inheritdoc
     *
     * @param node
     * The node to dump.
     *
     * @returns
     * The converted representation of the specified {@linkcode node}.
     */
    public Dump(node: NameofNode): ts.Node
    {
        return transform(node, this.Context);
    }

    /**
     * Checks whether the specified {@linkcode item} is a function.
     *
     * @param item
     * The item to check.
     *
     * @returns
     * A value indicating whether the specified {@linkcode item} is a call expression.
     */
    protected IsCallExpression(item: ts.Node): item is ts.CallExpression
    {
        return this.TypeScript.isCallExpression(item);
    }
}
