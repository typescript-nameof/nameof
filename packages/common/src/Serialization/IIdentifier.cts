import { INamedPathPart } from "./INamedPathPart.cjs";
import { PathKind } from "./PathKind.cjs";

/**
 * Represents an identifier.
 */
export interface IIdentifier<T> extends INamedPathPart<T, string>
{
    /**
     * @inheritdoc
     */
    type: PathKind.Identifier;
}
