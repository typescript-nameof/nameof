import { INodeLocation } from "./INodeLocation.cjs";

/**
 * Represents a component for parsing and dumping `nameof` expressions.
 */
export interface IAdapter<TInput, TNode, TContext = Record<string, never>>
{
    /**
     * Gets the expected name of nameof function calls.
     *
     * @param context
     * The context of the operation.
     *
     * @returns
     * The expected name of function calls.
     */
    GetNameofName(context: TContext): string;

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
     * Checks whether the specified {@linkcode item} has been mutated in a previous `nameof` call.
     *
     * @param item
     * The item to check.
     *
     * @param context
     * The context of the operation.
     */
    IsMutated(item: TNode, context: TContext): boolean;

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
     * Gets the location of the specified {@linkcode item}.
     *
     * @param item
     * The item whose location to get.
     *
     * @param context
     * The context of the operation.
     */
    GetLocation(item: TNode, context: TContext): INodeLocation;

    /**
     * Gets the source code of the specified {@linkcode item}.
     *
     * @param item
     * The item to get the source code from.
     *
     * @param context
     * The context of the operation.
     */
    GetSourceCode(item: TNode, context: TContext): string;

    /**
     * Generates the source code representing the specified {@linkcode item}.
     *
     * @param item
     * The item to generate the source code for.
     *
     * @param context
     * The context of the operation.
     */
    PrintSourceCode(item: TNode, context: TContext): string;

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
