import { PathKind } from "./PathKind";

/**
 * Represents a part of a path.
 */
export interface IPathPart
{
    /**
     * The type of the path part.
     */
    type: PathKind;
}
