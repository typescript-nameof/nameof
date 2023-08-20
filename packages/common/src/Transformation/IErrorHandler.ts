import { INodeLocation } from "./INodeLocation";

/**
 * Represents a component for reporting errors.
 *
 * @template TNode
 * The type of the nodes to report errors for.
 */
export interface IErrorHandler<TNode, TContext = Record<string, never>>
{
    /**
     * Reports the specified {@linkcode error}.
     *
     * @param location
     * The location of the specified {@linkcode node}.
     *
     * @param item
     * The item related to the specified {@linkcode error}.
     *
     * @param context
     * The context of the operation.
     *
     * @param error
     * The error to report.
     */
    Report(location: INodeLocation, item: TNode, context: TContext, error: Error): void;
}
