import { IErrorHandler } from "@typescript-nameof/common";
import { TestErrorHandler } from "@typescript-nameof/tests-common";
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
     *
     * @returns
     * The compiler to use.
     */
    protected override GetCompiler(): typeof ts
    {
        return require("typescript");
    }

    /**
     * @inheritdoc
     */
    protected override get DefaultErrorHandler(): IErrorHandler<ts.Node, ITypeScriptContext>
    {
        return new TestErrorHandler();
    }
}
