import { INameOfProvider } from "@typescript-nameof/common-types";
import { createMacro, MacroHandler } from "babel-plugin-macros";
import { BabelMacroTransformer } from "./BabelMacroTransformer.cjs";

let nameofMacro: MacroHandler =
    (params) =>
    {
        new BabelMacroTransformer(params.babel, params.config?.errorHandler).Macro(params);
    };

const nameof: INameOfProvider = createMacro(nameofMacro, { configName: "nameof" });
export = nameof;
