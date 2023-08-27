import { BabelPluginTester } from "./BabelPluginTester.js";
import { TransformationTests } from "./Transformation/index.test.js";

let tester = new BabelPluginTester();

suite(
    "nameof",
    () =>
    {
        TransformationTests();
        tester.RegisterCommon();
    });
