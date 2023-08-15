## Plugins

```mermaid
classDiagram
    class BabelTransformer {
        Transform(NodePath path) void
        Visitor
    }

    class BabelPlugin {
        <<type>>
        (BabelAPI babel) : Visitor
    }

    class IErrorHandler {
        <<interface>>
        Process(SourceFile file, Node node, Error error) void
    }

    class TSPatchErrorHandler {
        TSPatchErrorHandler(PluginConfig? config, TransformerExtras? extras)
    }

    class TSJestErrorHandler {
        TSPatchErrorHandler(TsCompilerInstance? compiler)
    }

    class TypeScriptTransformerPlugin {
        TypeScriptTransformerPlugin()
        TypeScriptTransformerPlugin(ErrorHandler errorHandler)
        TypeScript TypeScript
        TransformerFactory~T~ Factory
    }

    class TSLoaderPlugin

    class TSPatchPlugin {
        <<type>>
        (Program program, PluginConfig? config, TransformerExtras? extras) : TransformerFactory~SourceFile~
    }

    class TSPatchTransformerPlugin {
    }

    class TTypeScriptTransformerPlugin {
        <<type>>
        (Program program, getProgram() => Program) : TransformerFactory~SourceFile~
    }

    class TSJestTransformerPlugin {
        number version
        string name
        factory(TsCompilerInstance compilerInstance, object? options) TransformerFactory~SourceFile~
    }

    class TransformerFactory~T~ {
        <<type>>
        (TransformationContext context) : Transformer~T~
    }

    class Transformer~T~ {
        (T node) : T
    }

    IErrorHandler <|-- TSPatchErrorHandler
    TSJestErrorHandler --|> IErrorHandler

    TSPatchErrorHandler --> TSPatchPlugin
    TSJestTransformerPlugin <-- TSJestErrorHandler

    TypeScriptTransformerPlugin <|-- TSPatchTransformerPlugin

    TTypeScriptTransformerPlugin --> TypeScriptTransformerPlugin
    TSJestTransformerPlugin --> TypeScriptTransformerPlugin
    TSPatchTransformerPlugin <-- TSPatchPlugin
    TypeScriptTransformerPlugin <-- TSLoaderPlugin

    TransformerFactory <-- TypeScriptTransformerPlugin

    TransformerFactory --> Transformer
    BabelPlugin --> BabelTransformer
```

## Transformers

```mermaid
classDiagram
    class IAdapter~T~ {
        <<interface>>
        HandleError(Error error) void
        Parse(T node) Node~T~
        GetTrailingIdentifier(T node) T
        Dump(OutputNode node) T
        Dump(Array~OutputNode~ nodes) T
    }

    class NameofNodeTransformer~T~ {
        IAdapter~T~ adapter
        Transform(Node node) NameofResult~T~
        TransformFull(Node node) NameofResult~T~
    }

    IAdapter <-- NameofNodeTransformer
```

## Nodes
```mermaid
classDiagram
    class Node~T~ {
        string Type
        T source
        PathPart LastPart
        Array~PathPart~ Path
    }

    class IdentifierNode~T~ {
        string Name
    }

    class CallExpressionNode~T~ {
        Node Expression
        T[] TypeArguments
        T[] Arguments
    }

    class PropertyAccessNode~T~ {
        Node Expression
        string Name
    }

    class IndexedAccessNode~T~ {
        Node Expression
        Node Index
    }

    class StringLiteralNode~T~ {
        string Value
    }

    class NumericLiteralNode~T~ {
        number Value
    }

    class FunctionNode~T~ {
        T[] arguments
        T body
    }

    class UnsupportedNode~T~ {
    }

    Node <|-- IdentifierNode
    Node <|-- IndexedAccessNode
    Node <|-- PropertyAccessNode
    Node <|-- StringLiteralNode
    Node <|-- NumericLiteralNode
    Node <|-- FunctionNode
    Node <|-- UnsupportedNode
```

## Results

```mermaid
classDiagram
    class PathPart {
        <<type>>
    }

    class Accessor {
        string type
        string|number Value
    }

    class PropertyAccessor {
    }

    class IndexedAccessor {
    }

    class InterpolationAccessor~T~ {
        T node
        string VariableName
    }

    class ResultType {
        <<enum>>
        Plain
        Template
    }

    class IResult {
        <<interface>>
        ResultType type
    }

    class IPlainResult {
        <<interface>>
        string name
    }

    class ITemplateResult~T~ {
        <<interface>>
        string[] templateParts
        T[] nodes
    }

    class NameofResult~T~ {
        <<type>>
    }

    Accessor <|-- PropertyAccessor
    Accessor <|-- IndexedAccessor
    PropertyAccessor <-- PathPart
    IndexedAccessor <-- PathPart
    InterpolationAccessor <-- PathPart

    ResultType <-- IResult
    IResult <|-- IPlainResult
    IResult <|-- ITemplateResult

    IPlainResult <-- NameofResult
    ITemplateResult <-- NameofResult
```
