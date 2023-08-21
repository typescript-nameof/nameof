import { IPathPart } from "./IPathPart.cjs";
import { PathKind } from "./PathKind.cjs";

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
