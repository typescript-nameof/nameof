import { IPathPart } from "./IPathPart";
import { PathKind } from "./PathKind";

/**
 * Represents an interpolation.
 */
export interface IInterpolation<T> extends IPathPart<T>
{
    /**
     * @inheritdoc
     */
    type: PathKind.Interpolation;

    /**
     * The interpolated node.
     */
    node: T;
}
