import { INameOfProvider } from "@typescript-nameof/common-types";
import { createMacro, MacroHandler } from "babel-plugin-macros";
import { BabelMacroTransformer } from "./BabelMacroTransformer";

let nameofMacro: MacroHandler =
    (params) =>
    {
        new BabelMacroTransformer(params.babel).Macro(params);
    };

const nameof: INameOfProvider = createMacro(nameofMacro);
// eslint-disable-next-line import/no-default-export
export default nameof;
