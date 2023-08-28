import { IResult } from "./IResult.cjs";
import { ResultType } from "./ResultType.cjs";

/**
 * Represents a plain text result.
 */
export interface IPlainResult extends IResult
{
    /**
     * @inheritdoc
     */
    type: ResultType.Plain;

    /**
     * The text of the result.
     */
    text: string;
}
