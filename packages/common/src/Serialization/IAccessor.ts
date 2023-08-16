import { IPathPart } from "./IPathPart";

/**
 * Represents an accessor.
 */
export interface IAccessor<T> extends IPathPart
{
    /**
     * The value of the item that is accessed.
     */
    value: T;
}
