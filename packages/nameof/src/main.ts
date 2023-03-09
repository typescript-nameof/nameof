import { transformerFactory } from "@typescript-nameof/tsc-transformer";
// eslint-disable-next-line node/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import * as ts from "typescript";
import { Api } from "./Api";
import { replaceInFiles, replaceInText } from "./text";

let transformerFactoryBuilder: ts.ProgramPattern & ts.TransformerFactory<ts.SourceFile> = (...args: [ts.Program, Record<string, unknown>?, ts.TransformerExtras?] | [ts.TransformationContext]) =>
{
    if (args.length === 1 &&
        !("getTypeChecker" in args[0]))
    {
        return transformerFactory(args[0]) as any;
    }
    else
    {
        return transformerFactory;
    }
};

const api: Api = transformerFactoryBuilder as Api;
api.replaceInFiles = replaceInFiles;
api.replaceInText = replaceInText;
// this is for ts-jest support... not ideal
api.factory = (compiler: TsCompilerInstance) => transformerFactory;

export = api;
