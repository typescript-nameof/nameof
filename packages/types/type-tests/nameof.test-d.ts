/// <reference path="../index.d.ts" />
import { INameOfProvider } from "@typescript-nameof/common-types";
import { expectAssignable, expectDeprecated, expectNotDeprecated, expectType } from "tsd";

expectType<INameOfProvider>(nameof);

namespace TestNamespace {
    export interface TestType {
        prop: string;
    }
}

class TestClass
{
    public prop1 = "";

    public prop2 = "";
}

// nameof tests
expectType<string>(nameof(TestClass));
expectType<string>(nameof<TestNamespace.TestType>());
expectType<string>(nameof<TestClass>(((t) => t.prop1)));

// nameof.full tests
const testInstance = new TestClass();
expectType<string>(nameof.full(testInstance.prop1));
expectType<string>(nameof.full(testInstance.prop1, 1));
expectType<string>(nameof.full<TestNamespace.TestType>());
expectType<string>(nameof.full<TestNamespace.TestType>(1));
expectType<string>(nameof.full<TestClass>(((t) => t.prop1)));
expectType<string>(nameof.full<TestClass>((t) => t.prop1, 1));

// nameof.array tests
expectNotDeprecated(nameof.array);
expectType<string[]>(nameof.array(testInstance.prop1));
expectType<string[]>(nameof.array(testInstance.prop1, testInstance.prop2));
expectType<string[]>(nameof.array<TestClass>(t => [t.prop1]));

// nameof.toArray tests
expectDeprecated(nameof.toArray);
expectType<string[]>(nameof.toArray(testInstance.prop1));
expectType<string[]>(nameof.toArray(testInstance.prop1, testInstance.prop2));
expectType<string[]>(nameof.toArray<TestClass>(t => [t.prop1]));

// nameof.split tests
expectType<string[]>((nameof.split(testInstance.prop1)));
expectType<string[]>((nameof.split(testInstance.prop1, 1)));
expectType<string[]>((nameof.split<TestClass>(obj => obj.prop1)));
expectType<string[]>((nameof.split<TestClass>(obj => obj.prop1, 1)));

// nameof.interpolate tests
expectAssignable<string>(nameof.interpolate(""));
expectType<TestClass>(nameof.interpolate(undefined as any as TestClass));
