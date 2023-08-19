/// <reference path="references.d.ts" />
import { INameOfProvider } from "@typescript-nameof/common-types";
import { createMacro } from "babel-plugin-macros";
import { BabelMacroTransformer } from "./BabelMacroTransformer";

const nameof: INameOfProvider = createMacro(nameofMacro);
// eslint-disable-next-line import/no-default-export
export default nameof;

/**
 * Transforms `nameof` calls.
 *
 * @param context
 * The context of the macro.
 */
// @ts-ignore
function nameofMacro(context: any): void
{
    return new BabelMacroTransformer(context.babel).Macro(context);
}
