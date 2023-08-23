import { BabelMacroTester } from "./BabelMacroTester.js";

let tester = new BabelMacroTester();

suite(
    "macro",
    () =>
    {
        tester.RegisterCommon();
    });
