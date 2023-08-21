import { BabelPluginTester } from "./BabelPluginTester";

let tester = new BabelPluginTester();

suite(
    "nameof",
    () =>
    {
        tester.RegisterCommon();
    });
