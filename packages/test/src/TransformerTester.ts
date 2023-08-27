import { InvalidDefaultCallError, MissingImportTypeQualifierError, MissingPropertyAccessError, NestedNameofError, NoReturnExpressionError, UnsupportedAccessorTypeError, UnsupportedNodeError, UnsupportedScenarioError } from "@typescript-nameof/common";
import { TesterBase } from "./TesterBase.js";

/**
 * Provides the functionality to transform source code.
 *
 * @template T
 * The type of the node which are being transformed.
 */
export abstract class TransformerTester<TNode, TContext = Record<string, never>> extends TesterBase<TNode, TContext>
{
    /**
     * Gets the title of the suite.
     */
    protected get Title(): string
    {
        return "nameof";
    }

    /**
     * Registers common tests.
     */
    public Register(): void
    {
        suite(
            this.Title,
            () =>
            {
                this.RegisterTests();
            });
    }

    /**
     * Registers the tests.
     */
    protected RegisterTests(): void
    {
        suite(
            "bad call expressions",
            () =>
            {
                test(
                    "should throw if someone does not provide arguments or type arguments",
                    async () =>
                    {
                        await this.AssertError(
                            "nameof();",
                            InvalidDefaultCallError);
                    });
            });

        suite(
            "argument",
            () =>
            {
                test(
                    "should get the result of an identifier",
                    async () =>
                    {
                        await this.Assert("nameof(myObj);", '"myObj";');
                    });

                test(
                    "should get the result of the this keyword",
                    async () =>
                    {
                        await this.Assert("nameof(this);", '"this";');
                    });

                test(
                    "should get the result of a property access expression",
                    async () =>
                    {
                        await this.Assert("nameof(myObj.prop);", '"prop";');
                    });

                test(
                    "should get the result of an expression with a parenthesized expression",
                    async () =>
                    {
                        await this.Assert("nameof((myObj).prop);", '"prop";');
                    });

                test(
                    "should get the result of an expression with a type assertion",
                    async () =>
                    {
                        await this.Assert("nameof((myObj as any).prop);", '"prop";');
                    });

                test(
                    "should get the result of a property access expression with null assertion operators",
                    async () =>
                    {
                        await this.Assert("nameof(myObj!.prop!);", '"prop";');
                    });

                test(
                    "should get the result of an identifier with a dollar sign",
                    async () =>
                    {
                        await this.Assert("nameof(myObj.$prop);", '"$prop";');
                    });

                test(
                    "should throw if nameof calls are nested inside of nameof() calls",
                    async () =>
                    {
                        await this.AssertError("nameof(nameof(testing));", NestedNameofError);
                    });
            });

        suite(
            "type parameter",
            () =>
            {
                test(
                    "should get the result of an identifier",
                    async () =>
                    {
                        await this.Assert("nameof<Test>();", '"Test";');
                    });

                test(
                    "should get the result of a fully qualified name",
                    async () =>
                    {
                        await this.Assert("nameof<This.Is.A.Test>();", '"Test";');
                    });

                test(
                    "should get an identifier with a dollar sign",
                    async () =>
                    {
                        await this.Assert("nameof<Test$>();", '"Test$";');
                    });

                test(
                    "should handle when someone uses an import type as not the last node",
                    async () =>
                    {
                        await this.Assert("nameof<import('test').prop>();", '"prop";');
                    });

                test(
                    "should throw when someone only uses an import type",
                    async () =>
                    {
                        await this.AssertError("nameof<import('test')>();", MissingImportTypeQualifierError);
                    });

                test(
                    "should throw when someone only uses an import type with typeof",
                    async () =>
                    {
                        await this.AssertError("nameof<typeof import('test')>();", UnsupportedNodeError, MissingImportTypeQualifierError);
                    });
            });

        suite(
            "computed properties",
            () =>
            {
                test(
                    "should allow numeric computed properties",
                    async () =>
                    {
                        await this.Assert("nameof(anyProp[0]);", '"0";');
                    });

                test(
                    "should get after the period",
                    async () =>
                    {
                        await this.Assert("nameof(anyProp[0].prop);", '"prop";');
                    });

                test(
                    "should get the string inside the computed property",
                    async () =>
                    {
                        await this.Assert('nameof(obj["prop"]);', '"prop";');
                    });

                test(
                    "should get the string inside the computed property for a function",
                    async () =>
                    {
                        await this.Assert('nameof<MyInterface>(i => i["prop"]);', '"prop";');
                    });

                test(
                    "should not allow numeric computed properties using a function",
                    async () =>
                    {
                        await this.Assert("nameof<MyInterface>(i => i.prop[0]);", '"0";');
                    });

                test(
                    "should not allow an identifier nested in a computed property",
                    async () =>
                    {
                        await this.AssertError("nameof<MyInterface>(i => i.prop[prop[0]]);", UnsupportedAccessorTypeError);
                    });
            });

        suite(
            "array",
            () =>
            {
                test(
                    "should not allow only an array",
                    async () =>
                    {
                        await this.AssertError("nameof([0]);", UnsupportedNodeError);
                    });

                test(
                    "should allow getting an array's property",
                    async () =>
                    {
                        await this.Assert("nameof([].length);", '"length";');
                    });
            });

        suite(
            "with function",
            () =>
            {
                test(
                    "should get the last string",
                    async () =>
                    {
                        await this.Assert("nameof<MyInterface>(i => i.prop1.prop2);", '"prop2";');
                    });

                test(
                    "should get from the return statement",
                    async () =>
                    {
                        // no reason for people to do this, but don't bother complaining
                        await this.Assert("nameof<MyInterface>(i => { console.log('test'); return i.prop1.prop2; });", '"prop2";');
                    });

                test(
                    "should handle when someone uses an import type",
                    async () =>
                    {
                        await this.Assert("nameof<import('test')>(x => x.Foo);", '"Foo";');
                    });

                test(
                    "should get when using an element access expression directly on the object",
                    async () =>
                    {
                        await this.Assert('nameof<MyInterface>(i => i["prop1"]);', '"prop1";');
                    });

                test(
                    "should allow numeric computed properties",
                    async () =>
                    {
                        await this.Assert("nameof<MyInterface>(i => i[0]);", '"0";');
                    });

                test(
                    "should throw when the function doesn't have a period",
                    async () =>
                    {
                        await this.AssertError("nameof<MyInterface>(i => i);", MissingPropertyAccessError);
                    });

                test(
                    "should throw when the function doesn't have a return statement",
                    async () =>
                    {
                        await this.AssertError("nameof<MyInterface>(i => { i; });", NoReturnExpressionError);
                    });
            });

        suite(
            "literals",
            () =>
            {
                test(
                    "should throw if trying to parse a string literal",
                    async () =>
                    {
                        await this.AssertError('nameof("test");', UnsupportedNodeError);
                    });

                test(
                    "should throw if trying to parse a numeric literal",
                    async () =>
                    {
                        await this.AssertError("nameof(5);", UnsupportedNodeError);
                    });
            });

        suite(
            "interpolate",
            () =>
            {
                test(
                    "should throw when providing nameof.interpolate to nameof",
                    async () =>
                    {
                        await this.AssertError("nameof(nameof.interpolate(5));", UnsupportedScenarioError);
                    });
            });

        suite(
            "template expression",
            () =>
            {
                test(
                    "should throw when trying to parse a template literal",
                    async () =>
                    {
                        await this.AssertError("nameof(`testing`);", UnsupportedNodeError);
                    });
            });

        suite(
            "other",
            () =>
            {
                test(
                    "should throw if passing a spread operator",
                    async () =>
                    {
                        await this.AssertError("nameof(...test);", UnsupportedNodeError);
                    });
            });
    }
}
