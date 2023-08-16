import { IPathPart } from "./IPathPart";

/**
 * Represents an accessor.
 */
export interface INamedPathPart<TNode, TValue> extends IPathPart<TNode>
{
    /**
     * The name of the path part.
     */
    value: TValue;
}
