import { ResultType } from "./ResultType.cjs";

/**
 * Represents a template result.
 */
export interface ITemplateResult<T>
{
    /**
     * @inheritdoc
     */
    type: ResultType.Template;

    /**
     * The text portions of the template.
     */
    templateParts: string[];

    /**
     * The expressions of the template.
     */
    expressions: T[];
}
