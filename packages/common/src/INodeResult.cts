import { IResult } from "./IResult.cjs";
import { ResultType } from "./ResultType.cjs";

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
