import { TextTests } from "./text/index.test.js";
import { TypeScriptTester } from "./TypeScriptTester.js";

let tester = new TypeScriptTester();

suite(
    "nameof",
    () =>
    {
        TextTests();
        tester.RegisterCommon();
    });
