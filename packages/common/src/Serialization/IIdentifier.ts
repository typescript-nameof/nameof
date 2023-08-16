import { INamedPathPart } from "./INamedPathPart";
import { PathKind } from "./PathKind";

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
