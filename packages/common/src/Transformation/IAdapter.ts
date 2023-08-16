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
    Dump(node: Node, context: TContext): TNode;

    /**
     * Extracts the source code of the specified {@linkcode item}.
     *
     * @param item
     * The item to get the source code from.
     */
    ExtractCode(item: TNode): string;

    /**
     * Handles the specified {@linkcode error}.
     *
     * @param error
     * The error to handle.
     *
     * @param item
     * The item related to the error.
     */
    HandleError(error: Error, item: TNode): void;
}
