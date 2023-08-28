import { ok, strictEqual } from "node:assert";
import { Project } from "ts-morph";
import { nameOf } from "ts-nameof-proxy";
import { Diagnostic, Node, SourceFile } from "typescript";
import { TypeScriptErrorHandler } from "../../Diagnostics/TypeScriptErrorHandler.cjs";
import { ITypeScriptContext } from "../../Transformation/ITypeScriptContext.cjs";
import { TypeScriptFeatures } from "../../Transformation/TypeScriptFeatures.cjs";

/**
 * Registers tests for the {@linkcode TypeScriptErrorHandler} class.
 */
export function TypeScriptErrorHandlerTests(): void
{
    suite(
        TypeScriptErrorHandler.name,
        () =>
        {
            /**
             * Provides an implementation of the {@linkcode TypeScriptErrorHandler} class for testing.
             */
            class TestTypeScriptErrorHandler extends TypeScriptErrorHandler
            {
                /**
                 * @inheritdoc
                 */
                public override get Features(): TypeScriptFeatures
                {
                    return super.Features;
                }

                /**
                 * @inheritdoc
                 *
                 * @param node
                 * The node related to the error.
                 *
                 * @param context
                 * The context of the operation.
                 *
                 * @param error
                 * The error to create a diagnostic for.
                 *
                 * @returns
                 * The diagnostic for the specified {@linkcode error}.
                 */
                public override GetDiagnostic(node: Node, context: ITypeScriptContext, error: Error): Diagnostic
                {
                    return super.GetDiagnostic(node, context, error);
                }
            }

            let errorHandler: TestTypeScriptErrorHandler;
            let context: ITypeScriptContext;
            let sourceFile: SourceFile;
            let node: Node;

            setup(
                () =>
                {
                    errorHandler = new TestTypeScriptErrorHandler(new TypeScriptFeatures());
                    sourceFile = new Project().createSourceFile("/file.ts", "let x = 10").compilerNode as any;
                    node = sourceFile.getChildren()[0];

                    context = {
                        file: sourceFile
                    };
                });

            suite(
                nameOf<TestTypeScriptErrorHandler>((errorHandler) => errorHandler.GetDiagnostic),
                () =>
                {
                    let error: Error;
                    let diagnostic: Diagnostic;

                    setup(
                        () =>
                        {
                            error = new Error("This is a test.");
                            diagnostic = errorHandler.GetDiagnostic(node, context, error);
                        });

                    test(
                        "Checking whether the diagnostic is categorizes as an error…",
                        () =>
                        {
                            strictEqual(diagnostic.category, errorHandler.Features.TypeScript.DiagnosticCategory.Error);
                        });

                    test(
                        "Checking whether the message of the error is included in the diagnostic…",
                        () =>
                        {
                            strictEqual(diagnostic.messageText, error.message);
                        });

                    test(
                        "Checking whether the location of the node is included if available…",
                        () =>
                        {
                            ok(diagnostic.file !== undefined);
                            ok(diagnostic.start !== undefined);
                            ok(diagnostic.length !== undefined);

                            context.file = undefined as any;
                            diagnostic = errorHandler.GetDiagnostic(node, context, error);
                            ok(diagnostic.file === undefined);
                            ok(diagnostic.start === undefined);
                            ok(diagnostic.length === undefined);
                        });
                });
        });
}
