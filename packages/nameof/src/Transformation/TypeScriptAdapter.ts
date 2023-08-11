import { Adapter, NameofCallExpression, Node as NameofNode } from "@typescript-nameof/common";
import type { Node, SourceFile } from "typescript";
import { parse } from "./parse";
import { transform, TransformResult } from "./transform";
import { VisitSourceFileContext } from "./VisitSourceFileContext";

/**
 * Provides the functionality to parse and dump `nameof` calls for typescript.
 */
export class TypeScriptAdapter extends Adapter<Node, TransformResult>
{
    /**
     * The source file which contains the nodes to transform.
     */
    private sourceFile: SourceFile;

    /**
     * The context of the visitor.
     */
    private context: VisitSourceFileContext;

    /**
     * Initializes a new instance of the {@linkcode TypeScriptAdapter} class.
     *
     * @param sourceFile
     * The source file which contains the nodes to transform.
     */
    public constructor(sourceFile: SourceFile)
    {
        super();
        this.sourceFile = sourceFile;

        this.context = {
            interpolateExpressions: new Set()
        };
    }

    /**
     * Gets the source file which contains the nodes to transform.
     */
    protected get SourceFile(): SourceFile
    {
        return this.sourceFile;
    }

    /**
     * Gets the context of the visitor.
     */
    public get Context(): VisitSourceFileContext
    {
        return this.context;
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
    public Parse(item: Node): NameofCallExpression | undefined
    {
        return parse(item, this.SourceFile, this.Context);
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
    public Dump(node: NameofNode): TransformResult
    {
        return transform(node, this.Context);
    }
}
