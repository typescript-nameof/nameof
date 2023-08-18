import { strictEqual } from "assert";
import { resolve } from "path";
import { ErrorHandler, IErrorHandler } from "@typescript-nameof/common";
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
                                    "Call expression must have one argument or type argument: nameof()");
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
                            "should resolve to string when nesting nameofs",
                            async () =>
                            {
                                await this.Assert("nameof(nameof(testing));", '"testing";');
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
                                await this.AssertError("nameof<import('test')>();", this.GetUnsupportedErrorText('import("test")'));
                            });

                        it(
                            "should throw when someone only uses an import type with typeof",
                            async () =>
                            {
                                await this.AssertError("nameof<typeof import('test')>();", this.GetUnsupportedErrorText('typeof import("test")'));
                            });
                    });

                describe(
                    "computed properties",
                    () =>
                    {
                        it(
                            "should not allow a computed property to be at the end with a number",
                            async () =>
                            {
                                await this.AssertError("nameof(anyProp[0]);", this.GetUnsupportedComputationNodeErrorText("anyProp[0]"));
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
                            "should not allow a computed property to be at the end with a number when using a function",
                            async () =>
                            {
                                await this.AssertError("nameof<MyInterface>(i => i.prop[0]);", this.GetUnsupportedComputationNodeErrorText("(i) => i.prop[0]"));
                            });

                        it(
                            "should not allow an identifier nested in a computed property",
                            async () =>
                            {
                                await this.AssertError("nameof<MyInterface>(i => i.prop[prop[0]]);", this.GetUnsupportedComputationNodeErrorText("(i) => i.prop[prop[0]]"));
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
                                await this.AssertError("nameof([0]);", this.GetUnsupportedErrorText("[0]"));
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
                            "should throw when using an element access expression directly on the object and it is not a string",
                            async () =>
                            {
                                await this.AssertError("nameof<MyInterface>(i => i[0]);", this.GetUnsupportedComputationNodeErrorText("(i) => i[0]"));
                            });

                        it(
                            "should throw when the function doesn't have a period",
                            async () =>
                            {
                                await this.AssertError("nameof<MyInterface>(i => i);", "A property must be accessed on the object: (i) => i");
                            });

                        it(
                            "should throw when the function doesn't have a return statement",
                            async () =>
                            {
                                const errorPrefix = "Cound not find return statement with an expression in function expression: ";

                                const possibleMessages = [
                                    errorPrefix + "{ i; }", // babel
                                    errorPrefix + "{\n    i;\n}" // typescript
                                ];

                                await this.AssertError("nameof<MyInterface>(i => { i; });", ...possibleMessages);
                            });
                    });

                describe(
                    "literals",
                    () =>
                    {
                        it(
                            "should leave the string literal as-is",
                            async () =>
                            {
                                // this allows for nested nameofs
                                await this.Assert('nameof("test");', '"test";');
                            });

                        it(
                            "should transform a numeric literal as a string",
                            async () =>
                            {
                                await this.Assert("nameof(5);", '"5";');
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
                                await this.AssertError(
                                    "nameof(nameof.interpolate(5));",
                                    this.GetUnsupportedErrorText("nameof.interpolate(5)"),
                                    // it will be this for babel because it checks the parent nodes
                                    this.GetUnusedInterpolationErrorText("5"));
                            });
                    });

                describe(
                    "template expression",
                    () =>
                    {
                        it(
                            "should return a no substitution template literal",
                            async () =>
                            {
                                await this.Assert("nameof(`testing`);", "`testing`;");
                            });

                        it(
                            "should return the template expression when it has only a template tail",
                            async () =>
                            {
                                await this.Assert("nameof(`testing${test}final`);", "`testing${test}final`;");
                            });

                        it(
                            "should return the template expression when it has a template middle",
                            async () =>
                            {
                                await this.Assert("nameof(`testing${other}asdf${test}${asdf}final`);", "`testing${other}asdf${test}${asdf}final`;");
                            });

                        it(
                            "should return the template expression when it starts and ends with one",
                            async () =>
                            {
                                await this.Assert("nameof(`${other}`);", "`${other}`;");
                            });

                        it(
                            "should return the template expression when it starts and ends with multiple",
                            async () =>
                            {
                                await this.Assert("nameof(`${other}${asdf}${test}`);", "`${other}${asdf}${test}`;");
                            });

                        it(
                            "should throw when a nameof.interpolate is not used",
                            async () =>
                            {
                                await this.AssertError("nameof(`${nameof.interpolate(other)}`);", this.GetUnusedInterpolationErrorText("other"));
                            });
                    });

                describe(
                    "other",
                    () =>
                    {
                        it(
                            "should ignore spread syntax",
                            async () =>
                            {
                                await this.Assert("nameof(...test);", '"test";');
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
     * @param potentialMessages
     * A set of messages of which at least one is expected to occur.
     */
    protected async AssertError(input: string, ...potentialMessages: string[]): Promise<void>
    {
        let result = await this.Transform(input);
        let babelPath = resolve(__dirname, "..", "..", "babel-transformer", "src", "tests", "test.ts");

        let messages = potentialMessages.flatMap(
            (message) =>
            {
                return [
                    `[ts-nameof]: ${message}`,
                    `[ts-nameof:/file.ts]: ${message}`,
                    `${babelPath}: [ts-nameof:${babelPath}]: ${message}`,
                    `${resolve(__dirname, "..", "..", "babel-macro", "src", "tests", "test.ts")}: ./ts-nameof.macro: [ts-nameof]: ${message}`
                ];
            });

        if (result.errors.length > 0)
        {
            if (!result.errors.some((error) => messages.includes(error.message)))
            {
                throw new Error(
                    `Expected the code ${input} to yield one of the following error messages:\n` +
                    `${JSON.stringify(messages, null, 4)}\n` +
                    "but got\n" +
                    `${JSON.stringify(result.errors.map((error) => error.message), null, 4)}`);
            }
        }
        else
        {
            throw new Error(
                `Expected the code ${JSON.stringify(input)} to cause an error, but returned the following result:\n` +
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
