import { IResult } from "./IResult";
import { ResultType } from "./ResultType";

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
