import { createRequire } from "module";
import { TypeScriptTransformerTester } from "./TypeScriptTransformerTester.js";

/**
 * Provides the functionality to test the `ts-patch` integration.
 */
export class TTypeScriptTester extends TypeScriptTransformerTester
{
    /**
     * @inheritdoc
     */
    protected override get Title(): string
    {
        return "ttypescript";
    }

    /**
     * @inheritdoc
     */
    protected override get UsePlugin(): boolean
    {
        return false;
    }

    /**
     * @inheritdoc
     *
     * @returns
     * The compiler to use.
     */
    protected override GetCompiler(): typeof import("typescript")
    {
        return createRequire(new URL("../../../../ttypescript-workspace", import.meta.url)).resolve("ttypescript") as any;
    }
}
