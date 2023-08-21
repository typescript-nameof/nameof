// eslint-disable-next-line node/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import { ProgramPattern, TransformerExtras } from "ts-patch";
import { Program, SourceFile, TransformationContext, TransformerFactory } from "typescript";
import { Api } from "./Api.cjs";
import { replaceInFiles, replaceInText } from "./text/index.cjs";
import { TSJestTransformer } from "./Transformation/TSJestTransformer.cjs";
import { TSPatchTransformer } from "./Transformation/TSPatchTransformer.cjs";
import { TypeScriptTransformer } from "./Transformation/TypeScriptTransformer.cjs";

let transformerFactoryBuilder: ProgramPattern & TransformerFactory<SourceFile> = (...args: [Program, Record<string, unknown>?, TransformerExtras?] | [TransformationContext]) =>
{
    let factory: TransformerFactory<SourceFile>;

    if (
        args[2]?.addDiagnostic &&
        // Detecting `ts-patch` (ttypescript's `addDiagnostic` implementation doesn't do anything)
        args[2].diagnostics)
    {
        factory = new TSPatchTransformer(args[2]).Factory;
    }
    else
    {
        factory = new TypeScriptTransformer().Factory;
    }

    if ("factory" in args[0])
    {
        return factory(args[0]) as any;
    }
    else
    {
        return factory;
    }
};

const api: Api = transformerFactoryBuilder as Api;
api.replaceInFiles = replaceInFiles;
api.replaceInText = replaceInText;

// this is for ts-jest support... not ideal
api.factory =
    (compiler: TsCompilerInstance) =>
    {
        return new TSJestTransformer(compiler).Factory;
    };

// eslint-disable-next-line @typescript-eslint/no-var-requires
(api as any).version = require("../package.json")["version"];

export = api;
