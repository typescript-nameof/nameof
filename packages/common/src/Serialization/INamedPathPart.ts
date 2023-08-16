import { IPathPart } from "./IPathPart";

/**
 * Represents an accessor.
 */
export interface INamedPathPart<T> extends IPathPart
{
    /**
     * The name of the path part.
     */
    value: T;
}
