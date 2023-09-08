import { deepStrictEqual, doesNotThrow, notDeepStrictEqual, ok, strictEqual, throws } from "node:assert";
import cloneDeep from "lodash.clonedeep";
import { createSandbox, match, SinonMatcher, SinonSandbox, SinonStub, SinonStubbedInstance } from "sinon";
import { nameOf } from "ts-nameof-proxy";
import { ArrayLiteral, CallExpression, FunctionData, Identifier, IndexAccess, Interpolation, NumericLiteral, PropertyAccess, State, StateKind } from "./State.js";
import { TestAdapter } from "./TestAdapter.js";
import { CustomError } from "../../Diagnostics/CustomError.cjs";
import { IndexOutOfBoundsError } from "../../Diagnostics/IndexOutOfBoundsError.cjs";
import { IndexParsingError } from "../../Diagnostics/IndexParsingError.cjs";
import { InvalidArgumentCountError } from "../../Diagnostics/InvalidArgumentCountError.cjs";
import { InvalidDefaultCallError } from "../../Diagnostics/InvalidDefaultCallError.cjs";
import { InvalidSegmentCallError } from "../../Diagnostics/InvalidSegmentCallError.cjs";
import { MissingPropertyAccessError } from "../../Diagnostics/MissingPropertyAccessError.cjs";
import { NestedNameofError } from "../../Diagnostics/NestedNameofError.cjs";
import { SegmentNotFoundError } from "../../Diagnostics/SegmentNotFoundError.cjs";
import { UnsupportedAccessorTypeError } from "../../Diagnostics/UnsupportedAccessorTypeError.cjs";
import { UnsupportedFunctionError } from "../../Diagnostics/UnsupportedFunctionError.cjs";
import { UnsupportedNodeError } from "../../Diagnostics/UnsupportedNodeError.cjs";
import { UnsupportedScenarioError } from "../../Diagnostics/UnsupportedScenarioError.cjs";
import { NameofFunction } from "../../NameofFunction.cjs";
import { NameofResult } from "../../NameofResult.cjs";
import { ResultType } from "../../ResultType.cjs";
import { FunctionNode } from "../../Serialization/FunctionNode.cjs";
import { IdentifierNode } from "../../Serialization/IdentifierNode.cjs";
import { IIdentifier } from "../../Serialization/IIdentifier.cjs";
import { IIndexAccessor } from "../../Serialization/IIndexAccessor.cjs";
import { IInterpolation } from "../../Serialization/IInterpolation.cjs";
import { IPropertyAccessor } from "../../Serialization/IPropertyAccessor.cjs";
import { IUnsupportedPath } from "../../Serialization/IUnsupportedPath.cjs";
import { NameofCall } from "../../Serialization/NameofCall.cjs";
import { NodeKind } from "../../Serialization/NodeKind.cjs";
import { NumericLiteralNode } from "../../Serialization/NumericLiteralNode.cjs";
import { PathKind } from "../../Serialization/PathKind.cjs";
import { PathPart } from "../../Serialization/PathPart.cjs";
import { PathPartCandidate } from "../../Serialization/PathPartCandidate.cjs";
import { StringLiteralNode } from "../../Serialization/StringLiteralNode.cjs";
import { Adapter } from "../../Transformation/Adapter.cjs";
import { INodeLocation } from "../../Transformation/INodeLocation.cjs";
import { ITransformationContext } from "../../Transformation/ITransformationContext.cjs";
import { TransformerFeatures } from "../../Transformation/TransformerFeatures.cjs";

/**
 * Registers tests for the {@linkcode Adapter} class.
 */
export function AdapterTests(): void
{
    suite(
        Adapter.name,
        () =>
        {
            let nameofName = "nameof";
            let sandbox: SinonSandbox;
            let adapter: SinonStubbedInstance<TestAdapter>;
            let features: SinonStubbedInstance<TransformerFeatures<State, any>>;
            let validInput: CallExpression;
            let consoleLog: PropertyAccess;
            let functionNode: FunctionData;
            let identifier: IdentifierNode<State>;
            let stringLiteral: StringLiteralNode<State>;
            let nameofCall: NameofCall<State>;
            let interpolation: Interpolation;
            let expressionWithInterpolation: IndexAccess;
            let identifierPath: IIdentifier<State>;
            let propertyAccessPath: IPropertyAccessor<State>;
            let indexAccessPath: IIndexAccessor<State>;
            let interpolationPath: IInterpolation<State>;
            let unsupportedPath: IUnsupportedPath<State>;

            suiteSetup(
                () =>
                {
                    sandbox = createSandbox();
                });

            setup(
                () =>
                {
                    let consoleNode: Identifier = {
                        type: NodeKind.IdentifierNode,
                        name: "console"
                    };

                    features = sandbox.createStubInstance(TransformerFeatures);
                    adapter = new TestAdapter(features) as SinonStubbedInstance<TestAdapter>;

                    identifier = new IdentifierNode(consoleLog, consoleNode.name);

                    stringLiteral = new StringLiteralNode(
                        {
                            type: NodeKind.StringLiteralNode,
                            value: consoleNode.name
                        },
                        consoleNode.name);

                    consoleLog = {
                        type: NodeKind.PropertyAccessNode,
                        expression: consoleNode,
                        propertyName: "log"
                    };

                    validInput = {
                        type: NodeKind.CallExpressionNode,
                        expression: {
                            type: NodeKind.IdentifierNode,
                            name: adapter.GetNameofName({})
                        },
                        arguments: [
                            consoleNode
                        ],
                        typeArguments: []
                    };

                    functionNode = {
                        type: NodeKind.FunctionNode,
                        parameters: [],
                        body: consoleLog
                    };

                    nameofCall = {
                        source: validInput,
                        arguments: [],
                        typeArguments: []
                    };

                    interpolation = {
                        type: NodeKind.InterpolationNode,
                        node: stringLiteral.Source
                    };

                    expressionWithInterpolation = {
                        type: NodeKind.IndexAccessNode,
                        expression: consoleLog,
                        index: interpolation
                    };

                    adapter.Extract = sandbox.stub();
                    adapter.Extract.returnsArg(0);

                    identifierPath = {
                        type: PathKind.Identifier,
                        source: consoleNode,
                        value: consoleNode.name
                    };

                    propertyAccessPath = {
                        type: PathKind.PropertyAccess,
                        source: consoleLog,
                        value: consoleLog.propertyName
                    };

                    indexAccessPath = {
                        type: PathKind.IndexAccess,
                        source: consoleLog,
                        value: consoleLog.propertyName
                    };

                    interpolationPath = {
                        type: PathKind.Interpolation,
                        source: interpolation,
                        node: interpolation.node
                    };

                    unsupportedPath = {
                        type: PathKind.Unsupported,
                        source: validInput
                    };
                });

            teardown(
                () =>
                {
                    sandbox.restore();
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetNameofName),
                () =>
                {
                    test(
                        `Checking whether the result equals \`${nameofName}\` by default…`,
                        () =>
                        {
                            strictEqual(adapter.GetNameofName({}), nameofName);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.StoreOriginal),
                () =>
                {
                    test(
                        "Checking whether the object changes when storing the original into it…",
                        () =>
                        {
                            let newNode = stringLiteral.Source;
                            let before = cloneDeep(newNode);
                            deepStrictEqual(newNode, before);
                            adapter.StoreOriginal(identifier.Source, newNode);
                            notDeepStrictEqual(newNode, before);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetOriginal),
                () =>
                {
                    test(
                        "Checking whether the original node of a replacement can be fetched properly…",
                        () =>
                        {
                            let original = identifier.Source;
                            let newNode = stringLiteral.Source;
                            adapter.StoreOriginal(original, newNode);
                            strictEqual(adapter.GetOriginal(newNode), original);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.IsMutated),
                () =>
                {
                    test(
                        "Checking whether nodes which have originals stored in them are detected properly…",
                        () =>
                        {
                            let newNode = stringLiteral.Source;
                            ok(!adapter.IsMutated(newNode, {}));
                            adapter.StoreOriginal(identifier.Source, newNode);
                            ok(adapter.IsMutated(newNode, {}));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.Transform),
                () =>
                {
                    test(
                        "Checking whether only valid calls are transformed…",
                        () =>
                        {
                            for (let invalid of [stringLiteral.Source, identifier.Source])
                            {
                                let input = cloneDeep(invalid);
                                deepStrictEqual(adapter.Transform(invalid, {}), input);
                            }

                            let input = cloneDeep(validInput);
                            notDeepStrictEqual(adapter.Transform(validInput, {}), input);
                        });

                    test(
                        "Checking whether internal errors are reported properly…",
                        () =>
                        {
                            let error = sandbox.createStubInstance(UnsupportedNodeError);
                            let reportAction = sandbox.stub(error, "ReportAction");
                            sandbox.replaceGetter(error, "ReportAction", () => reportAction);
                            sandbox.stub(adapter, "ParseInternal");
                            adapter.ParseInternal = sandbox.stub();
                            adapter.ParseInternal.throws(error);
                            ok(!reportAction.called);
                            adapter.Transform(validInput, {});
                            ok(reportAction.calledOnce);
                        });

                    test(
                        "Checking whether other errors are forwarded properly…",
                        () =>
                        {
                            let message = "This is an error.";
                            let error = new Error("Test error");
                            sandbox.stub(adapter, "ReportError");
                            sandbox.stub(adapter, "ParseInternal");

                            let assertions: Array<[any, SinonMatcher]> = [
                                [
                                    message,
                                    match(
                                        (error: any) =>
                                        {
                                            return error instanceof Error &&
                                                error.message === message;
                                        })
                                ],
                                [error, match.same(error)]
                            ];

                            for (let assertion of assertions)
                            {
                                let stub = adapter.ReportError.withArgs(match.any, match.any, assertion[1]);
                                ok(!stub.called);
                                adapter.ParseInternal.callsFake(() => { throw assertion[0]; });
                                adapter.Transform(validInput, {});
                                ok(stub.calledOnce);
                            }
                        });

                    test(
                        "Checking whether an array node is returned if an array result is appropriate…",
                        () =>
                        {
                            for (let functionName of [NameofFunction.Array, NameofFunction.Split])
                            {
                                strictEqual(
                                    adapter.Transform(
                                        {
                                            type: NodeKind.CallExpressionNode,
                                            expression: {
                                                type: NodeKind.PropertyAccessNode,
                                                expression: {
                                                    type: NodeKind.IdentifierNode,
                                                    name: adapter.GetNameofName({})
                                                },
                                                propertyName: functionName
                                            },
                                            typeArguments: [],
                                            arguments: [
                                                consoleLog
                                            ]
                                        },
                                        {}).type,
                                    StateKind.ArrayLiteral);
                            }
                        });

                    test(
                        "Checking whether the original node is saved after the transformation…",
                        () =>
                        {
                            let before = validInput;
                            let after = adapter.Transform(before, {});
                            ok(adapter.IsMutated(after, {}));
                            strictEqual(adapter.GetOriginal(after), before);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ReportError),
                () =>
                {
                    test(
                        "Checking whether the error is forwarded to the transformer features properly…",
                        () =>
                        {
                            let item = consoleLog;
                            let context: ITransformationContext<State> = {};
                            let location: INodeLocation = {};
                            let error = new Error();
                            adapter.GetLocation = sandbox.stub();
                            adapter.GetLocation.withArgs(item, context).returns(location);
                            adapter.ReportError(item, context, error);
                            ok(features.ReportError.calledWithExactly(location, item, context, error));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.StoreOriginal),
                () =>
                {
                    test(
                        "Checking whether the original node can be stored in another node…",
                        () =>
                        {
                            let original = consoleLog;
                            let newNode = stringLiteral.Source;
                            adapter.StoreOriginal(original, newNode);
                            strictEqual((newNode as any)[adapter.OriginalSymbol], original);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetOriginal),
                () =>
                {
                    test(
                        "Checking whether the stored original can be received…",
                        () =>
                        {
                            let original = consoleLog;
                            let newNode = stringLiteral.Source;
                            adapter.StoreOriginal(original, newNode);
                            strictEqual(adapter.GetOriginal(newNode), original);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetNameofCall),
                () =>
                {
                    /**
                     * Asserts that the specified {@linkcode call} contains the expected data of the {@linkcode node}.
                     *
                     * @param node
                     * The original node.
                     *
                     * @param call
                     * The resulting {@linkcode NameofCall}.
                     *
                     * @param functionName
                     * The name of the function which is expected to be requested.
                     */
                    function assertCorrectCallData(node: CallExpression, call?: NameofCall<State>, functionName?: string): void
                    {
                        if (functionName)
                        {
                            strictEqual(call?.function, functionName);
                        }

                        strictEqual(call?.source, node);
                        deepStrictEqual(call?.arguments, node.arguments);
                        deepStrictEqual(call?.typeArguments, node.typeArguments);
                    }

                    test(
                        "Checking whether default calls are interpreted properly…",
                        () =>
                        {
                            let call = adapter.GetNameofCall(validInput, {});
                            ok(call);
                            assertCorrectCallData(validInput, call);
                        });

                    test(
                        `Checking whether no result is returned if \`${nameofName}\` is not accessed…`,
                        () =>
                        {
                            validInput.expression = {
                                ...validInput.expression,
                                type: NodeKind.IdentifierNode,
                                name: "myNameof"
                            };

                            strictEqual(adapter.GetNameofCall(validInput, {}), undefined);
                        });

                    test(
                        "Checking whether call expressions are parsed…",
                        () =>
                        {
                            let assertions: Array<[NodeKind, boolean]> = [
                                [NodeKind.CallExpressionNode, true],
                                [NodeKind.IdentifierNode, false]
                            ];

                            for (let assertion of assertions)
                            {
                                let node: CallExpression = {
                                    ...validInput,
                                    type: assertion[0] as any
                                };

                                let call = adapter.GetNameofCall(node, {});

                                if (assertion[1])
                                {
                                    assertCorrectCallData(node, call);
                                }
                                else
                                {
                                    strictEqual(call, undefined);
                                }
                            }
                        });

                    test(
                        `Checking whether member access expressions are detected properly if they are part of a \`nameof.${NameofFunction.Typed}\` call…`,
                        () =>
                        {
                            let root: CallExpression = {
                                ...validInput,
                                expression: {
                                    type: NodeKind.PropertyAccessNode,
                                    expression: {
                                        type: NodeKind.IdentifierNode,
                                        name: "nameof"
                                    },
                                    propertyName: NameofFunction.Typed
                                },
                                typeArguments: [],
                                arguments: [
                                    {
                                        type: NodeKind.IdentifierNode,
                                        name: "console"
                                    }
                                ]
                            };

                            let assertions = [
                                {
                                    type: NodeKind.PropertyAccessNode,
                                    expression: root,
                                    propertyName: "log"
                                },
                                {
                                    type: NodeKind.IndexAccessNode,
                                    expression: root,
                                    index: {
                                        type: NodeKind.StringLiteralNode,
                                        value: "warn"
                                    }
                                }
                            ] as State[];

                            for (let assertion of assertions)
                            {
                                let call = adapter.GetNameofCall(assertion, {});
                                ok(call);
                                strictEqual(call.source, assertion);
                                strictEqual(call.function, NameofFunction.Typed);
                                deepStrictEqual(call.typeArguments, []);
                                deepStrictEqual(call.arguments, [assertion]);
                            }
                        });

                    for (let type of [NodeKind.PropertyAccessNode, NodeKind.IndexAccessNode])
                    {
                        test(
                            `Checking whether nameof functions indicated by ${type === NodeKind.PropertyAccessNode ? "property" : "index"} accessors are detected properly…`,
                            () =>
                            {
                                for (let nameofFunction of [NameofFunction.Array, NameofFunction.Full, NameofFunction.Interpolate])
                                {
                                    let node = {
                                        ...validInput
                                    };

                                    if (type === NodeKind.PropertyAccessNode)
                                    {
                                        node.expression = {
                                            type,
                                            expression: validInput.expression,
                                            propertyName: nameofFunction
                                        };
                                    }
                                    else
                                    {
                                        node.expression = {
                                            type: NodeKind.IndexAccessNode,
                                            expression: validInput.expression,
                                            index: {
                                                type: NodeKind.StringLiteralNode,
                                                value: nameofFunction
                                            }
                                        };
                                    }

                                    let call = adapter.GetNameofCall(node, {});
                                    assertCorrectCallData(node, call, nameofFunction);
                                }
                            });
                    }
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetTargets),
                () =>
                {
                    test(
                        "Checking whether arguments take priority over type arguments…",
                        () =>
                        {
                            nameofCall.arguments = [identifier.Source, identifier.Source];
                            nameofCall.typeArguments = [validInput, validInput];
                            strictEqual(adapter.GetTargets(nameofCall), nameofCall.arguments);

                            nameofCall.arguments = [];
                            strictEqual(adapter.GetTargets(nameofCall), nameofCall.typeArguments);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ProcessNameofCall),
                () =>
                {
                    test(
                        "Checking whether the corresponding method is called for each function…",
                        () =>
                        {
                            let arrayMethod = nameOf<TestAdapter>((adapter) => adapter.ProcessArray) as keyof TestAdapter;

                            let assertions = [
                                [
                                    undefined,
                                    nameOf<TestAdapter>((adapter) => adapter.ProcessDefault)
                                ],
                                [
                                    NameofFunction.Full,
                                    nameOf<TestAdapter>((adapter) => adapter.ProcessFull)
                                ],
                                [
                                    NameofFunction.Split,
                                    nameOf<TestAdapter>((adapter) => adapter.ProcessSplit)
                                ],
                                [
                                    NameofFunction.Array,
                                    arrayMethod
                                ],
                                [
                                    NameofFunction.LegacyArray,
                                    arrayMethod
                                ],
                                [
                                    NameofFunction.Interpolate,
                                    nameOf<TestAdapter>((adapter) => adapter.ProcessInterpolate)
                                ],
                                [
                                    "garbage",
                                    undefined
                                ]
                            ] as Array<[NameofFunction | undefined, keyof TestAdapter]>;

                            sandbox.stub(adapter, arrayMethod);

                            for (let assertion of assertions)
                            {
                                nameofCall.function = assertion[0];

                                if (assertion[1])
                                {
                                    let context = {};

                                    if (assertion[1] !== arrayMethod)
                                    {
                                        sandbox.stub(adapter, assertion[1]);
                                    }

                                    let stub = adapter[assertion[1]] as SinonStub;
                                    adapter.ProcessNameofCall(nameofCall, context);
                                    ok(stub.calledWith(nameofCall, context));
                                }
                                else
                                {
                                    throws(
                                        () => adapter.ProcessNameofCall(nameofCall, {}),
                                        UnsupportedFunctionError);
                                }
                            }
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ProcessDefault),
                () =>
                {
                    test(
                        "Checking whether errors are thrown if too many arguments are given…",
                        () =>
                        {
                            let node = consoleLog;
                            nameofCall.arguments = [];
                            nameofCall.typeArguments = [node];
                            doesNotThrow(() => adapter.ProcessDefault(nameofCall, {}));

                            nameofCall.arguments = [node];
                            nameofCall.typeArguments = [];
                            doesNotThrow(() => adapter.ProcessDefault(nameofCall, {}));

                            nameofCall.arguments = [node, node];
                            throws(() => adapter.ProcessDefault(nameofCall, {}), InvalidDefaultCallError);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ProcessFull),
                () =>
                {
                    setup(
                        () =>
                        {
                            nameofCall.arguments = [consoleLog];
                        });

                    test(
                        "Checking whether results without interpolations are produced properly…",
                        () =>
                        {
                            strictEqual(adapter.ProcessFull(nameofCall, {}).type, ResultType.Plain);
                        });

                    test(
                        "Checking whether results with interpolations are produced properly…",
                        () =>
                        {
                            nameofCall.arguments = [
                                {
                                    type: NodeKind.IndexAccessNode,
                                    expression: nameofCall.arguments[0],
                                    index: {
                                        type: NodeKind.InterpolationNode,
                                        node: stringLiteral.Source
                                    }
                                }
                            ];

                            strictEqual(adapter.ProcessFull(nameofCall, {}).type, ResultType.Template);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ProcessSplit),
                () =>
                {
                    test(
                        "Checking whether interpolation nodes are unsupported…",
                        () =>
                        {
                            nameofCall.arguments = [expressionWithInterpolation];

                            throws(() => adapter.ProcessSplit(nameofCall, {}), UnsupportedScenarioError);
                        });

                    test(
                        "Checking whether the full name is split into parts…",
                        () =>
                        {
                            nameofCall.arguments = [consoleLog];
                            ok(Array.isArray(adapter.ProcessSplit(nameofCall, {})));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ProcessArray),
                () =>
                {
                    test(
                        "Checking whether the name of a single passed node is determined properly…",
                        () =>
                        {
                            let args = [
                                consoleLog
                            ];

                            nameofCall.arguments = args;
                            let result = adapter.ProcessArray(nameofCall, {});
                            strictEqual(result.length, 1);
                            strictEqual(result[0].type, ResultType.Plain);
                            strictEqual(result[0].text, consoleLog.propertyName);
                        });

                    test(
                        "Checking whether tne names of multiple passed nodes are determined properly…",
                        () =>
                        {
                            let consoleWarn: PropertyAccess = {
                                ...consoleLog,
                                type: NodeKind.PropertyAccessNode,
                                propertyName: "warn"
                            };

                            let args = [
                                consoleLog,
                                consoleWarn
                            ];

                            nameofCall.arguments = args;

                            ok(
                                adapter.ProcessArray(nameofCall, {}).every(
                                    (result, index) =>
                                    {
                                        return result.type === ResultType.Plain &&
                                            result.text === args[index].propertyName;
                                    }));
                        });

                    test(
                        "Checking whether passing a function requires an array return type…",
                        () =>
                        {
                            throws(
                                () =>
                                {
                                    adapter.ProcessArray(
                                        {
                                            ...nameofCall,
                                            arguments: [
                                                {
                                                    type: NodeKind.FunctionNode,
                                                    parameters: [
                                                        "console"
                                                    ],
                                                    body: {
                                                        type: NodeKind.StringLiteralNode,
                                                        value: "console"
                                                    }
                                                }
                                            ]
                                        },
                                        {});
                                },
                                UnsupportedNodeError);

                            doesNotThrow(
                                () =>
                                {
                                    adapter.ProcessArray(
                                        {
                                            ...nameofCall,
                                            arguments: [
                                                {
                                                    type: NodeKind.FunctionNode,
                                                    parameters: [
                                                        "console"
                                                    ],
                                                    body: {
                                                        type: StateKind.ArrayLiteral,
                                                        elements: []
                                                    }
                                                }
                                            ]
                                        },
                                        {});
                                });
                        });

                    test(
                        "Checking whether elements of function parameters must be accessed…",
                        () =>
                        {
                            let param = "o";

                            let array: ArrayLiteral = {
                                type: StateKind.ArrayLiteral,
                                elements: []
                            };

                            let func: FunctionData = {
                                type: NodeKind.FunctionNode,
                                parameters: [
                                    param
                                ],
                                body: array
                            };

                            nameofCall.arguments = [func];

                            let identifier: Identifier = {
                                type: NodeKind.IdentifierNode,
                                name: param
                            };

                            let expression: State = {
                                type: NodeKind.PropertyAccessNode,
                                expression: identifier,
                                propertyName: "prop1"
                            };

                            doesNotThrow(
                                () =>
                                {
                                    array.elements = [expression];
                                    adapter.ProcessArray(nameofCall, {});
                                });

                            throws(
                                () =>
                                {
                                    array.elements = [identifier];
                                    adapter.ProcessArray(nameofCall, {});
                                });
                        });

                    for (let generated of [false, true])
                    {
                        test(
                            `Checking whether string and template literals are ${generated ? "unsupported by default" : "supported when generated by previous `nameof` calls"}…`,
                            () =>
                            {
                                let array: ArrayLiteral = {
                                    type: StateKind.ArrayLiteral,
                                    elements: []
                                };

                                let func: FunctionData = {
                                    type: NodeKind.FunctionNode,
                                    parameters: [],
                                    body: array
                                };

                                let expressions: State[] = [
                                    {
                                        type: NodeKind.StringLiteralNode,
                                        value: ""
                                    },
                                    {
                                        type: StateKind.TemplateLiteral
                                    }
                                ];

                                for (let expression of expressions)
                                {
                                    let method: typeof throws | typeof doesNotThrow;

                                    if (generated)
                                    {
                                        method = doesNotThrow;
                                        adapter.StoreOriginal(expression, expression);
                                    }
                                    else
                                    {
                                        method = throws;
                                    }

                                    method(
                                        () =>
                                        {
                                            nameofCall.arguments = [expression];
                                            adapter.ProcessArray(nameofCall, {});
                                        });

                                    method(
                                        () =>
                                        {
                                            nameofCall.arguments = [func];
                                            array.elements = [expression];
                                            adapter.ProcessArray(nameofCall, {});
                                        });
                                }
                            });
                    }
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ProcessInterpolate),
                () =>
                {
                    test(
                        "Checking whether interpolation calls are stored in the context…",
                        () =>
                        {
                            let context: ITransformationContext<State> = {};

                            let interpolation: Interpolation = {
                                type: NodeKind.InterpolationNode,
                                node: stringLiteral.Source
                            };

                            nameofCall.source = interpolation;
                            adapter.ProcessInterpolate(nameofCall, context);
                            deepStrictEqual(context.interpolationCalls, [interpolation]);

                            adapter.ProcessInterpolate(nameofCall, context);
                            deepStrictEqual(context.interpolationCalls, [interpolation, interpolation]);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ProcessSegment),
                () =>
                {
                    let context: ITransformationContext<State>;

                    setup(
                        () =>
                        {
                            context = {};
                            nameofCall.arguments = [];
                            nameofCall.typeArguments = [];

                            sandbox.stub(adapter, "ProcessSingle").callThrough();
                            sandbox.stub(adapter, "GetPath").callThrough();
                            sandbox.stub(adapter, "GetPathSegments").callThrough();
                        });

                    test(
                        "Checking whether passing no argument and type argument causes an error…",
                        () =>
                        {
                            throws(
                                () =>
                                {
                                    adapter.ProcessSegment(nameofCall, {});
                                },
                                InvalidSegmentCallError);
                        });

                    test(
                        "Checking whether passing too many arguments causes an error…",
                        () =>
                        {
                            let assertions: Array<[State[], State[]]> = [
                                [[consoleLog, consoleLog, consoleLog], []],
                                [[], [consoleLog, consoleLog]]
                            ];

                            for (let assertion of assertions)
                            {
                                nameofCall.arguments = assertion[0];
                                nameofCall.typeArguments = assertion[1];
                                throws(() => adapter.ProcessSegment(nameofCall, {}), InvalidSegmentCallError);
                            }
                        });

                    test(
                        "Checking whether single arguments are processed properly…",
                        () =>
                        {
                            nameofCall.arguments = [consoleLog];
                            nameofCall.typeArguments = [];
                            adapter.ProcessSegment(nameofCall, context);
                            ok(adapter.ProcessSingle.calledWith(nameofCall, consoleLog, context));
                            ok(adapter.GetPathSegments.calledWith(nameofCall, match.any, 0, match.number, context));
                        });

                    test(
                        "Checking whether single type arguments are processed properly…",
                        () =>
                        {
                            nameofCall.arguments = [];
                            nameofCall.typeArguments = [consoleLog];
                            adapter.ProcessSegment(nameofCall, context);
                            ok(adapter.ProcessSingle.calledWith(nameofCall, consoleLog, context));
                            ok(adapter.GetPathSegments.calledWith(nameofCall, match.any, 0, match.number, context));
                        });

                    test(
                        "Checking whether arguments have precedence over type arguments…",
                        () =>
                        {
                            nameofCall.arguments = [validInput.expression];
                            nameofCall.typeArguments = [consoleLog];
                            adapter.ProcessSegment(nameofCall, context);
                            ok(adapter.ProcessSingle.calledWith(nameofCall, validInput.expression, context));
                            ok(adapter.GetPathSegments.calledWith(nameofCall, match.any, 0, match.number, context));
                        });

                    test(
                        "Checking whether the index parameter is handled properly…",
                        () =>
                        {
                            let index = 1337;
                            adapter.GetPath.callsFake(() => []);

                            let numericLiteral: NumericLiteral = {
                                type: NodeKind.NumericLiteralNode,
                                value: index
                            };

                            let nodeFilter = (node: NumericLiteralNode<State>): boolean =>
                            {
                                return node.Value === index;
                            };

                            nameofCall.arguments = [
                                consoleLog,
                                numericLiteral
                            ];

                            adapter.ProcessSegment(nameofCall, context);
                            ok(adapter.ProcessSingle.calledWith(nameofCall, consoleLog, context));

                            ok(
                                adapter.GetPath.calledWith(
                                    nameofCall,
                                    match.any,
                                    match(nodeFilter)));

                            nameofCall.arguments = [numericLiteral];
                            nameofCall.typeArguments = [consoleLog];
                            adapter.ProcessSegment(nameofCall, context);
                            ok(adapter.ProcessSingle.calledWith(nameofCall, consoleLog, context));

                            ok(
                                adapter.GetPath.calledWith(
                                    nameofCall,
                                    match.any,
                                    match(nodeFilter)));
                        });

                    test(
                        "Checking whether passing a non number as index causes throws an error…",
                        () =>
                        {
                            nameofCall.arguments = [consoleLog, consoleLog];
                            throws(() => adapter.ProcessSegment(nameofCall, context), IndexParsingError);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ProcessSingle),
                () =>
                {
                    test(
                        "Checking whether the expression path is returned by default…",
                        () =>
                        {
                            let node = adapter.ParseInternal(consoleLog, {});
                            deepStrictEqual(adapter.ProcessSingle(nameofCall, consoleLog, {}), node.Path);
                        });

                    test(
                        `Checking whether function nodes are forwarded to the \`${nameOf<TestAdapter>((a) => a.ProcessFunctionBody)}\` method…`,
                        () =>
                        {
                            sandbox.stub(adapter, "ProcessFunctionBody");
                            adapter.ProcessSingle(nameofCall, functionNode, {});

                            ok(adapter.ProcessFunctionBody.calledWith(
                                match(
                                    (node: FunctionNode<State>) =>
                                    {
                                        return node.Source === functionNode;
                                    }),
                                functionNode.body,
                                {}));
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ProcessFunctionBody),
                () =>
                {
                    let parsedFunction: FunctionNode<State>;

                    setup(
                        () =>
                        {
                            parsedFunction = adapter.ParseInternal(functionNode, {}) as FunctionNode<State>;
                        });

                    test(
                        "Checking whether the full node path is returned if the variable is unrelated to the function parameters…",
                        () =>
                        {
                            let path = adapter.ParseInternal(consoleLog, {}).Path;
                            deepStrictEqual(adapter.ProcessFunctionBody(parsedFunction, consoleLog, {}), path);
                        });

                    test(
                        "Checking whether function parameters are stripped from the path…",
                        () =>
                        {
                            let param = "o";

                            let accessNode: PropertyAccess = {
                                type: NodeKind.PropertyAccessNode,
                                expression: {
                                    type: NodeKind.IdentifierNode,
                                    name: param
                                },
                                propertyName: "toString"
                            };

                            let [_, ...path] = adapter.ParseInternal(accessNode, {}).Path;
                            functionNode.parameters = [param];
                            parsedFunction = adapter.ParseInternal(functionNode, {}) as FunctionNode<State>;
                            deepStrictEqual(adapter.ProcessFunctionBody(parsedFunction, accessNode, {}), path);
                        });

                    test(
                        "Checking whether an error is thrown if no property of a function parameter has been accessed…",
                        () =>
                        {
                            let param = "o";

                            let identifier: Identifier = {
                                type: NodeKind.IdentifierNode,
                                name: param
                            };

                            functionNode.parameters = [param];
                            parsedFunction = adapter.ParseInternal(functionNode, {}) as FunctionNode<State>;
                            throws(() => adapter.ProcessFunctionBody(parsedFunction, identifier, {}), MissingPropertyAccessError);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.ParseNode),
                () =>
                {
                    let interpolationCall: CallExpression;

                    setup(
                        () =>
                        {
                            interpolationCall = {
                                type: NodeKind.CallExpressionNode,
                                expression: {
                                    type: NodeKind.PropertyAccessNode,
                                    expression: {
                                        type: NodeKind.IdentifierNode,
                                        name: adapter.GetNameofName({})
                                    },
                                    propertyName: NameofFunction.Interpolate
                                },
                                typeArguments: [],
                                arguments: [
                                    consoleLog
                                ]
                            };

                            sandbox.stub(adapter, "ParseInternal");
                            adapter.ParseInternal.callThrough();
                        });

                    test(
                        "Checking whether interpolation calls are handled by this method…",
                        () =>
                        {
                            let result = adapter.ParseNode(interpolationCall, {});
                            strictEqual(result.Type, NodeKind.InterpolationNode);
                            strictEqual(result.Source, interpolationCall);
                            strictEqual(result.Expression, consoleLog);
                        });

                    test(
                        "Checking whether passing too many arguments to an interpolation call throws an error…",
                        () =>
                        {
                            interpolationCall.arguments = [consoleLog, consoleLog];
                            throws(() => adapter.ParseNode(interpolationCall, {}), InvalidArgumentCountError);
                        });

                    test(
                        `Checking whether other nodes are forwarded to the \`${nameOf<TestAdapter>((a) => a.ParseInternal)}\` method…`,
                        () =>
                        {
                            let context = {};
                            adapter.ParseNode(consoleLog, context);
                            ok(adapter.ParseInternal.calledWith(consoleLog, context));
                        });

                    test(
                        "Checking whether internal errors are returned as unsupported nodes…",
                        () =>
                        {
                            let error = new CustomError(adapter, validInput, {}, "");
                            adapter.ParseInternal.throws(error);
                            let result = adapter.ParseNode(consoleLog, {});
                            strictEqual(result.Type, NodeKind.UnsupportedNode);
                            strictEqual(result.Source, consoleLog);
                            strictEqual(result.Reason, error);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.DumpArray),
                () =>
                {
                    let items: Array<NameofResult<State>>;

                    setup(
                        () =>
                        {
                            items = [
                                {
                                    type: ResultType.Plain,
                                    text: "console"
                                },
                                {
                                    type: ResultType.Template,
                                    expressions: [consoleLog],
                                    templateParts: [
                                        "this.is[",
                                        "].a.test"
                                    ]
                                }
                            ];

                            sandbox.stub(adapter, "Dump");
                            sandbox.stub(adapter, "CreateArrayLiteral");
                            adapter.Dump.callThrough();
                            adapter.CreateArrayLiteral.callThrough();
                        });

                    test(
                        `Checking whether all items are dumped using the \`${nameOf<TestAdapter>((a) => a.Dump)}\` method…`,
                        () =>
                        {
                            adapter.DumpArray(items);

                            for (let item of items)
                            {
                                ok(adapter.Dump.calledWith(item));
                            }
                        });

                    test(
                        `Checking whether the result is generated using the \`${nameOf<TestAdapter>((a) => a.CreateArrayLiteral)}\` method…`,
                        () =>
                        {
                            let expected = consoleLog;
                            adapter.CreateArrayLiteral.callsFake(() => expected);
                            strictEqual(adapter.DumpArray(items), expected);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetName),
                () =>
                {
                    test(
                        "Checking whether the name of the last node is returned…",
                        () =>
                        {
                            for (let pathPart of [identifierPath, propertyAccessPath, indexAccessPath])
                            {
                                let path = [interpolationPath, interpolationPath, unsupportedPath, pathPart];
                                let result = adapter.GetName(nameofCall, path, {});
                                strictEqual(result.type, ResultType.Plain);
                                strictEqual(result.text, pathPart.value.toString());
                            }
                        });

                    test(
                        "Checking whether getting the name of an interpolation node throws an error…",
                        () =>
                        {
                            throws(
                                () => adapter.GetName(nameofCall, [propertyAccessPath, interpolationPath], {}),
                                UnsupportedScenarioError);
                        });

                    test(
                        "Checking whether a custom error is shown instead of the default one if the specified path is empty…",
                        () =>
                        {
                            throws(
                                () =>
                                {
                                    doesNotThrow(
                                        () => adapter.GetName(nameofCall, [], {}),
                                        SegmentNotFoundError);
                                },
                                CustomError);
                        });

                    test(
                        "Checking whether other errors are forwarded…",
                        () =>
                        {
                            let error = new Error("We have a 2319!");
                            sandbox.stub(adapter, "GetPathSegments");
                            adapter.GetPathSegments.throws(error);
                            throws(() => adapter.GetName(nameofCall, [], {}), error);
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetPath),
                () =>
                {
                    let path: Array<PathPart<State>>;

                    setup(
                        () =>
                        {
                            path = [propertyAccessPath, propertyAccessPath, propertyAccessPath];
                            sandbox.stub(adapter, "GetPathSegments").callThrough();
                        });

                    /**
                     * Creates a node with the specified {@linkcode value}.
                     *
                     * @param value
                     * The value of the node.
                     *
                     * @returns
                     * The newly created node.
                     */
                    function getIndexNode(value: number): NumericLiteralNode<State>
                    {
                        let source: NumericLiteral = {
                            type: NodeKind.NumericLiteralNode,
                            value
                        };

                        return new NumericLiteralNode(source, value);
                    }

                    test(
                        "Checking whether the index is interpreted properly…",
                        () =>
                        {
                            for (let i = -path.length; i < path.length; i++)
                            {
                                let context = {};
                                let index: number;
                                let count: number;

                                if (i >= 0)
                                {
                                    index = i;
                                    count = path.length - i;
                                }
                                else
                                {
                                    index = path.length + i;
                                    count = -i;
                                }

                                adapter.GetPath(nameofCall, path, getIndexNode(i), context);
                                ok(adapter.GetPathSegments.calledWith(nameofCall, path, index, count, context));
                            }
                        });

                    test(
                        "Checking whether an error is thrown if the index is out of bounds…",
                        () =>
                        {
                            for (let i of [-path.length - 1, path.length + 1])
                            {
                                throws(
                                    () =>
                                    {
                                        adapter.GetPath(nameofCall, path, getIndexNode(i), {});
                                    },
                                    IndexOutOfBoundsError);
                            }
                        });
                });

            suite(
                nameOf<TestAdapter>((adapter) => adapter.GetPathSegments),
                () =>
                {
                    let path: Array<PathPartCandidate<State>>;
                    let transformedPath: PathPartCandidate<State>;

                    setup(
                        () =>
                        {
                            let node = stringLiteral.Source;
                            adapter.StoreOriginal(consoleLog.expression, node);

                            path = [
                                {
                                    ...propertyAccessPath,
                                    value: "console"
                                },
                                {
                                    ...propertyAccessPath,
                                    value: "log"
                                },
                                {
                                    ...propertyAccessPath,
                                    value: "bind"
                                }
                            ];

                            transformedPath = {
                                type: PathKind.Unsupported,
                                source: node
                            };
                        });

                    test(
                        "Checking whether an error is thrown if the index or the amount is out of bounds…",
                        () =>
                        {
                            for (let i = 0; i <= path.length; i++)
                            {
                                let count = (path.length - i) + 1;

                                throws(
                                    () => adapter.GetPathSegments(nameofCall, path, i, count, {}),
                                    SegmentNotFoundError);
                            }

                            throws(
                                () => adapter.GetPathSegments(nameofCall, path, path.length, 0, {}),
                                SegmentNotFoundError);
                        });

                    test(
                        "Checking whether unsupported nodes and accessors throw an error…",
                        () =>
                        {
                            let error = new CustomError(adapter, unsupportedPath.source, {}, "It's a trap!");
                            path[0] = unsupportedPath;

                            throws(
                                () => adapter.GetPathSegments(nameofCall, path, 0, path.length, {}),
                                UnsupportedNodeError);

                            unsupportedPath.isAccessor = true;

                            throws(
                                () => adapter.GetPathSegments(nameofCall, path, 0, path.length, {}),
                                UnsupportedAccessorTypeError);

                            unsupportedPath.reason = error;

                            throws(
                                () => adapter.GetPathSegments(nameofCall, path, 0, path.length, {}),
                                error);
                        });

                    test(
                        "Checking whether an error is thrown if the requested segment contains a `nameof` call…",
                        () =>
                        {
                            for (let i = 0; i < path.length; i++)
                            {
                                let pathPrefix = new Array(i).fill(interpolationPath);

                                for (let j = i; j < path.length; j++)
                                {
                                    path = [...pathPrefix, ...new Array(path.length - j).fill(propertyAccessPath)];
                                    doesNotThrow(() => adapter.GetPathSegments(nameofCall, path, i, path.length - i, {}));
                                    path[j] = transformedPath;

                                    throws(
                                        () => adapter.GetPathSegments(nameofCall, path, i, path.length - i, {}),
                                        NestedNameofError);
                                }
                            }
                        });

                    test(
                        "Checking whether the requested segment of the path is returned…",
                        () =>
                        {
                            for (let i = 0; i < path.length; i++)
                            {
                                for (let j = i + 1; j <= path.length; j++)
                                {
                                    let count = j - i;
                                    let segment = path.slice(i, j);

                                    deepStrictEqual(
                                        adapter.GetPathSegments(nameofCall, path, i, count, {}),
                                        segment);
                                }
                            }
                        });
                });
        });
}
