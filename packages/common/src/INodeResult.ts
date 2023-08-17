import { IResult } from "./IResult";
import { ResultType } from "./ResultType";

/**
 * Represents a node result.
 */
export interface INodeResult<T> extends IResult
{
    /**
     * @inheritdoc
     */
    type: ResultType.Node;

    /**
     * The node of the result.
     */
    node: T;
}
