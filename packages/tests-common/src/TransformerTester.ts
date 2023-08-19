import { strictEqual } from "assert";
import { ErrorHandler, IErrorHandler, InvalidDefaultCallError, MissingImportTypeQualifierError, MissingPropertyAccessError, NestedNameofError, NoReturnExpressionError, UnsupportedAccessorTypeError, UnsupportedNodeError, UnsupportedScenarioError } from "@typescript-nameof/common";
import { Project } from "ts-morph";
import { INameofOutput } from "./INameofOutput";
import { TestErrorHandler } from "./TestErrorHandler";

/**
 * Provides the functionality to transform source code.
 *
 * @template T
 * The type of the node which are being transformed.
 */
export abstract class TransformerTester<TNode, TContext = Record<string, never>>
{
    /**
     * A project for formatting code.
     */
    private project = new Project();

    /**
     * Gets a project for formatting code.
     */
    public get Project(): Project
    {
        return this.project;
    }

    /**
     * Registers common tests.
     */
    public RegisterCommon(): void
    {
        describe(
            "nameof",
            () =>
            {
                describe(
                    "bad call expressions",
                    () =>
                    {
                        it(
                            "should throw if someone does not provide arguments or type arguments",
                            async () =>
                            {
                                await this.AssertError(
                                    "nameof();",
                                    InvalidDefaultCallError);
                            });
                    });

                describe(
                    "argument",
                    () =>
                    {
                        it(
                            "should get the result of an identifier",
                            async () =>
                            {
                                await this.Assert("nameof(myObj);", '"myObj";');
                            });

                        it(
                            "should get the result of the this keyword",
                            async () =>
                            {
                                await this.Assert("nameof(this);", '"this";');
                            });

                        it(
                            "should get the result of a property access expression",
                            async () =>
                            {
                                await this.Assert("nameof(myObj.prop);", '"prop";');
                            });

                        it(
                            "should get the result of an expression with a parenthesized expression",
                            async () =>
                            {
                                await this.Assert("nameof((myObj).prop);", '"prop";');
                            });

                        it(
                            "should get the result of an expression with a type assertion",
                            async () =>
                            {
                                await this.Assert("nameof((myObj as any).prop);", '"prop";');
                            });

                        it(
                            "should get the result of a property access expression with null assertion operators",
                            async () =>
                            {
                                await this.Assert("nameof(myObj!.prop!);", '"prop";');
                            });

                        it(
                            "should get the result of an identifier with a dollar sign",
                            async () =>
                            {
                                await this.Assert("nameof(myObj.$prop);", '"$prop";');
                            });

                        it(
                            "should throw if nameof calls are nested inside of nameof() calls",
                            async () =>
                            {
                                await this.AssertError("nameof(nameof(testing));", NestedNameofError);
                            });
                    });

                describe(
                    "type parameter",
                    () =>
                    {
                        it(
                            "should get the result of an identifier",
                            async () =>
                            {
                                await this.Assert("nameof<Test>();", '"Test";');
                            });

                        it(
                            "should get the result of a fully qualified name",
                            async () =>
                            {
                                await this.Assert("nameof<This.Is.A.Test>();", '"Test";');
                            });

                        it(
                            "should get an identifier with a dollar sign",
                            async () =>
                            {
                                await this.Assert("nameof<Test$>();", '"Test$";');
                            });

                        it(
                            "should handle when someone uses an import type as not the last node",
                            async () =>
                            {
                                await this.Assert("nameof<import('test').prop>();", '"prop";');
                            });

                        it(
                            "should throw when someone only uses an import type",
                            async () =>
                            {
                                await this.AssertError("nameof<import('test')>();", MissingImportTypeQualifierError);
                            });

                        it(
                            "should throw when someone only uses an import type with typeof",
                            async () =>
                            {
                                await this.AssertError("nameof<typeof import('test')>();", UnsupportedNodeError, MissingImportTypeQualifierError);
                            });
                    });

                describe(
                    "computed properties",
                    () =>
                    {
                        it(
                            "should allow numeric computed properties",
                            async () =>
                            {
                                await this.Assert("nameof(anyProp[0]);", '"0";');
                            });

                        it(
                            "should get after the period",
                            async () =>
                            {
                                await this.Assert("nameof(anyProp[0].prop);", '"prop";');
                            });

                        it(
                            "should get the string inside the computed property",
                            async () =>
                            {
                                await this.Assert('nameof(obj["prop"]);', '"prop";');
                            });

                        it(
                            "should get the string inside the computed property for a function",
                            async () =>
                            {
                                await this.Assert('nameof<MyInterface>(i => i["prop"]);', '"prop";');
                            });

                        it(
                            "should not allow numeric computed properties using a function",
                            async () =>
                            {
                                await this.Assert("nameof<MyInterface>(i => i.prop[0]);", '"0";');
                            });

                        it(
                            "should not allow an identifier nested in a computed property",
                            async () =>
                            {
                                await this.AssertError("nameof<MyInterface>(i => i.prop[prop[0]]);", UnsupportedAccessorTypeError);
                            });
                    });

                describe(
                    "array",
                    () =>
                    {
                        it(
                            "should not allow only an array",
                            async () =>
                            {
                                await this.AssertError("nameof([0]);", UnsupportedNodeError);
                            });

                        it(
                            "should allow getting an array's property",
                            async () =>
                            {
                                await this.Assert("nameof([].length);", '"length";');
                            });
                    });

                describe(
                    "with function",
                    () =>
                    {
                        it(
                            "should get the last string",
                            async () =>
                            {
                                await this.Assert("nameof<MyInterface>(i => i.prop1.prop2);", '"prop2";');
                            });

                        it(
                            "should get from the return statement",
                            async () =>
                            {
                                // no reason for people to do this, but don't bother complaining
                                await this.Assert("nameof<MyInterface>(i => { console.log('test'); return i.prop1.prop2; });", '"prop2";');
                            });

                        it(
                            "should handle when someone uses an import type",
                            async () =>
                            {
                                await this.Assert("nameof<import('test')>(x => x.Foo);", '"Foo";');
                            });

                        it(
                            "should get when using an element access expression directly on the object",
                            async () =>
                            {
                                await this.Assert('nameof<MyInterface>(i => i["prop1"]);', '"prop1";');
                            });

                        it(
                            "should allow numeric computed properties",
                            async () =>
                            {
                                await this.Assert("nameof<MyInterface>(i => i[0]);", '"0";');
                            });

                        it(
                            "should throw when the function doesn't have a period",
                            async () =>
                            {
                                await this.AssertError("nameof<MyInterface>(i => i);", MissingPropertyAccessError);
                            });

                        it(
                            "should throw when the function doesn't have a return statement",
                            async () =>
                            {
                                await this.AssertError("nameof<MyInterface>(i => { i; });", NoReturnExpressionError);
                            });
                    });

                describe(
                    "literals",
                    () =>
                    {
                        it(
                            "should throw if trying to parse a string literal",
                            async () =>
                            {
                                await this.AssertError('nameof("test");', UnsupportedNodeError);
                            });

                        it(
                            "should throw if trying to parse a numeric literal",
                            async () =>
                            {
                                await this.AssertError("nameof(5);", UnsupportedNodeError);
                            });
                    });

                describe(
                    "interpolate",
                    () =>
                    {
                        it(
                            "should throw when providing nameof.interpolate to nameof",
                            async () =>
                            {
                                await this.AssertError("nameof(nameof.interpolate(5));", UnsupportedScenarioError);
                            });
                    });

                describe(
                    "template expression",
                    () =>
                    {
                        it(
                            "should throw when trying to parse a template literal",
                            async () =>
                            {
                                await this.AssertError("nameof(`testing`);", UnsupportedNodeError);
                            });
                    });

                describe(
                    "other",
                    () =>
                    {
                        it(
                            "should throw if passing a spread operator",
                            async () =>
                            {
                                await this.AssertError("nameof(...test);", UnsupportedNodeError);
                            });
                    });
            });
    }

    /**
     * Transforms the specified {@linkcode code}.
     *
     * @param code
     * The code to transform.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    protected async Transform(code: string): Promise<INameofOutput>
    {
        let output: string | undefined;
        let errorHandler = new TestErrorHandler(this.DefaultErrorHandler);

        try
        {
            output = await this.Format(await this.Run(await this.Preprocess(code), errorHandler));
        }
        catch
        { }

        return {
            errors: [...errorHandler.Errors],
            output
        };
    }

    /**
     * Formats the specified {@linkcode code}.
     *
     * @param code
     * The code to format.
     *
     * @returns
     * The formatted code.
     */
    protected async Format(code?: string): Promise<string | undefined>
    {
        if (code)
        {
            let file = this.Project.createSourceFile(
                "/file.ts",
                code,
                {
                    overwrite: true
                });

            file.formatText(
                {
                    ensureNewLineAtEndOfFile: true
                });

            return file.getText().replace(/[\s\S]$/, "");
        }
        else
        {
            return undefined;
        }
    }

    /**
     * Runs the transformation of the specified {@linkcode code}.
     *
     * @param code
     * The code to transform.
     *
     * @param errorHandler
     * A component for reporting errors.
     *
     * @returns
     * The transformed representation of the specified {@linkcode code}.
     */
    protected abstract Run(code: string, errorHandler?: IErrorHandler<TNode, TContext>): Promise<string>;

    /**
     * Pre-processes the specified {@linkcode code}.
     *
     * @param code
     * The code to pre-process.
     *
     * @returns
     * Pre-processes the specified {@linkcode code}.
     */
    protected async Preprocess(code: string): Promise<string>
    {
        return code;
    }

    /**
     * Asserts the output of a transformation.
     *
     * @param input
     * The input of the transformation.
     *
     * @param expected
     * The expected output of the transformation.
     */
    protected async Assert(input: string, expected: string): Promise<void>
    {
        let result = await this.Transform(input);

        if (result.errors.length > 0)
        {
            let messages = result.errors.length === 1 ?
                result.errors[0].message :
                JSON.stringify(result.errors.map((error) => error.message));

            throw new Error(
                `Expected \`${input}\` to transform to \`${expected}\`, but got ${result.errors.length === 1 ? "an error" : "errors"}:\n${messages}`);
        }

        strictEqual(
            (await this.Transform(input)).output,
            await this.Format(expected));
    }

    /**
     * Asserts the occurrence of an error with the specified {@linkcode message}.
     *
     * @param input
     * The input of the transformation.
     *
     * @param errorClasses
     * The classes of the expected error.
     */
    protected async AssertError(input: string, ...errorClasses: Array<new (...args: any[]) => Error>): Promise<void>
    {
        let result = await this.Transform(input);
        let errorNames: string | undefined;

        if (errorClasses.length > 0)
        {
            if (errorClasses.length === 1)
            {
                errorNames = `${errorClasses[0].name}`;
            }
            else
            {
                let classes = errorClasses.map((errorClass) => `\`${errorClass.name}\``);
                let lastClass = classes.pop();
                errorNames = `${classes.join(", ")} or ${lastClass}`;
            }
        }

        if (result.errors.length > 0)
        {
            if (errorClasses.length > 0)
            {
                if (
                    !result.errors.some((error) => errorClasses.some((errorClass) => error.name === errorClass.name)))
                {
                    throw new Error(
                        `Expected the code ${input} to yield an error with the name ${errorNames}, but got:\n` +
                        JSON.stringify(result.errors.map((error) => `${error.name}: ${error.message}`), null, 4));
                }
            }
        }
        else
        {
            let errorDescriptor = errorNames ? `a ${errorNames}` : "an";

            throw new Error(
                `Expected the code ${JSON.stringify(input)} to cause ${errorDescriptor} error, but returned the following result:\n` +
                `${JSON.stringify(result.output)}`);
        }
    }

    /**
     * Gets the error message which is expected for unsupported nodes.
     *
     * @param nodeText
     * The text of the incorrect node.
     *
     * @returns
     * The expected error message.
     */
    protected GetUnsupportedErrorText(nodeText: string): string
    {
        return `The node \`${nodeText}\` is not supported in this scenario.`;
    }

    /**
     * Gets the error message which is expected for unsupported computation nodes.
     *
     * @param nodeText
     * The text of the incorrect node.
     *
     * @returns
     * The expected error message.
     */
    protected GetUnsupportedComputationNodeErrorText(nodeText: string): string
    {
        return `First accessed property must not be computed except if providing a string: ${nodeText}`;
    }

    /**
     * Gets the error message which is expected for unused interpolation calls.
     *
     * @param nodeText
     * The text of the incorrect node.
     *
     * @returns
     * The expected error message.
     */
    protected GetUnusedInterpolationErrorText(nodeText: string): string
    {
        return `Found a nameof.interpolate that did not exist within a nameof.full call expression: nameof.interpolate(${nodeText})`;
    }

    /**
     * Gets the default error handler of the transformer under test.
     */
    protected get DefaultErrorHandler(): IErrorHandler<TNode, TContext>
    {
        return new ErrorHandler();
    }
}
