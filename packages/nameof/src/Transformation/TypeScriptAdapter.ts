import { Adapter, NameofCallExpression, Node as NameofNode } from "@typescript-nameof/common";
import ts = require("typescript");
import { parse } from "./parse";
import { transform } from "./transform";
import { TypeScriptFeatures } from "./TypeScriptFeatures";
import { VisitSourceFileContext } from "./VisitSourceFileContext";

/**
 * Provides the functionality to parse and dump `nameof` calls for typescript.
 */
export class TypeScriptAdapter extends Adapter<TypeScriptFeatures, ts.Node>
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
     * @param item
     * The item to parse.
     *
     * @returns
     * The parsed `nameof` expression.
     */
    public LegacyParse(item: ts.Node): NameofCallExpression | undefined
    {
        return parse(item, item.getSourceFile(), this.Context);
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
}
