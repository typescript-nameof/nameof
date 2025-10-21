import { INameOfProvider } from "@typescript-nameof/common-types";
import { createMacro, MacroHandler } from "babel-plugin-macros";
import { BabelTransformer } from "..";

let nameofMacro: MacroHandler =
    (params) =>
    {
        new BabelTransformer(params.babel, params.config?.errorHandler).Macro(params);
    };

const nameof = createMacro(nameofMacro, { configName: "nameof" }) as INameOfProvider;
export = nameof;
