import { BabelPluginTester } from "./BabelPluginTester.js";

let tester = new BabelPluginTester();

suite(
    "nameof",
    () =>
    {
        tester.RegisterCommon();
    });
