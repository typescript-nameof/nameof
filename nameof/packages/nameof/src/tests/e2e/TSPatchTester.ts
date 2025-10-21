import { IErrorHandler } from "@typescript-nameof/common";
import { TestErrorHandler } from "@typescript-nameof/test";
import ts = require("typescript");
import { TypeScriptTransformerTester } from "./TypeScriptTransformerTester.js";
import { ITypeScriptContext } from "../../Transformation/ITypeScriptContext.cjs";

/**
 * Provides the functionality to test typescript transformers.
 */
export class TSPatchTester extends TypeScriptTransformerTester
{
    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return "ts-patch";
    }

    /**
     * @inheritdoc
     */
    protected override get DefaultErrorHandler(): IErrorHandler<ts.Node, ITypeScriptContext>
    {
        return new TestErrorHandler();
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The compiler to use.
     */
    protected override GetCompiler(): Promise<typeof ts>
    {
        return import("typescript");
    }
}
