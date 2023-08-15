import { NameofCallExpression, Node } from "../Serialization/nodes";

/**
 * Represents a component for parsing and dumping `nameof` expressions.
 */
export interface IAdapter<TInput, out TOutput = TInput>
{
    /**
     * Parses the specified {@linkcode item}.
     *
     * @param item
     * The item to parse.
     *
     * @returns
     * The parsed `nameof` expression.
     */
    LegacyParse(item: TInput): NameofCallExpression | undefined;

    /**
     * Dumps the specified {@linkcode node}.
     *
     * @param node
     * The node to dump.
     *
     * @returns
     * The converted representation of the specified {@linkcode node}.
     */
    Dump(node: Node): TOutput;

    /**
     * Handles the specified {@linkcode error}.
     *
     * @param error
     * The error to handle.
     *
     * @param item
     * The item related to the error.
     */
    HandleError(error: Error, item: TInput): void;
}
