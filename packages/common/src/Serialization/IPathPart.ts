import { PathKind } from "./PathKind";

/**
 * Represents a part of a path.
 */
export interface IPathPart<T>
{
    /**
     * The source of the path part.
     */
    source: T;

    /**
     * The type of the path part.
     */
    type: PathKind;
}
