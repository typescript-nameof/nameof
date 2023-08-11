// eslint-disable-next-line node/no-unpublished-import
import type { TsCompilerInstance } from "ts-jest/dist/types";
import { ProgramPattern, TransformerExtras } from "ts-patch";
import { Program, SourceFile, TransformationContext, TransformerFactory } from "typescript";
import { Api } from "./Api";
import { replaceInFiles, replaceInText } from "./text";
import { transformerFactory } from "./Transformation/transformerFactory";

let transformerFactoryBuilder: ProgramPattern & TransformerFactory<SourceFile> = (...args: [Program, Record<string, unknown>?, TransformerExtras?] | [TransformationContext]) =>
{
    if ("factory" in args[0])
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
