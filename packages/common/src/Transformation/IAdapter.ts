import { NameofCallExpression, Node } from "../Serialization/nodes";

/**
 * Represents a component for parsing and dumping `nameof` expressions.
 */
export interface IAdapter<TInput, TNode, TContext = Record<string, never>>
{
    /**
     * Extracts the node from the specified {@linkcode input}.
     *
     * @param input
     * The input to extract the node from.
     *
     * @returns
     * The node that was extracted from the specified {@linkcode input}.
     */
    Extract(input: TInput): TNode;

    /**
     * Transforms the specified {@linkcode input}.
     *
     * @param input
     * The item to transform.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The transformed node.
     */
    Transform(input: TInput, context: TContext): TNode;

    /**
     * Parses the specified {@linkcode item}.
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
    LegacyParse(item: TInput, context: TContext): NameofCallExpression | undefined;

    /**
     * Dumps the specified {@linkcode node}.
     *
     * @param node
     * The node to dump.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The converted representation of the specified {@linkcode node}.
     */
    LegacyDump(node: Node, context: TContext): TNode;

    /**
     * Gets the source code of the specified {@linkcode item}.
     *
     * @param context
     * The context of the operation.
     *
     * @param item
     * The item to get the source code from.
     */
    GetSourceCode(item: TNode, context: TContext): string;

    /**
     * Reports the specified {@linkcode error}.
     *
     * @param item
     * The item related to the error.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to handle.
     */
    ReportError(item: TNode, context: TContext, error: Error): void;
}
