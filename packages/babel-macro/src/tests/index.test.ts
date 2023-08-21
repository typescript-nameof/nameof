import { BabelMacroTester } from "./BabelMacroTester.js";

let tester = new BabelMacroTester();

suite(
    "nameof",
    () =>
    {
        tester.RegisterCommon();
    });
