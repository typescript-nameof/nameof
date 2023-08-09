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

    class ErrorHandler {
        Process(Error error) void
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
        TransformerFactory~T~ Factory
    }

    class TSLoaderPlugin

    class TSPatchTransformerPlugin {
        <<type>>
        (Program program, PluginConfig? config, TransformerExtras? extras) : TransformerFactory~SourceFile~
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

    ErrorHandler <|-- TSPatchErrorHandler
    TSJestErrorHandler --|> ErrorHandler

    TSPatchErrorHandler --> TSPatchTransformerPlugin
    TSJestTransformerPlugin <-- TSJestErrorHandler

    TTypeScriptTransformerPlugin --> TypeScriptTransformerPlugin
    TSJestTransformerPlugin --> TypeScriptTransformerPlugin
    TypeScriptTransformerPlugin <-- TSPatchTransformerPlugin
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
        Parse(T node) Node
        GetTrailingIdentifier(T node) T
        Dump(OutputNode node) T
        Dump(Array~OutputNode~ nodes) T
    }

    class NameOfTransformer {
        Transform(Node node) Node
        TransformFull(Node node) Node
    }

    class Node {
        string Type
        PathPart LastPart
        Array~PathPart~ Path
    }

    class PropertyAccessNode {
        Node Expression
        string Name
    }

    class IndexedAccessNode {
        Node Object
        Node Index
    }

    class StringLiteralNode {
        string Value
    }

    class NumericLiteralNode {
        number Value
    }

    class TemplateLiteralNode {
        Array~string~ TemplateSpans
        Array~string~ Variables
    }

    class OutputNode {
        <<type>>
    }

    class PathPart {
        string Type
    }

    class RootPathPart {
    }

    class PropertyPathPart {
        string identifier
    }

    class IndexedPathPart {
        var Identifier
    }

    class InterpolationPathPart {
        string VariableName
    }

    Node <|-- IndexedAccessNode
    Node <|-- PropertyAccessNode
    Node <|-- StringLiteralNode
    Node <|-- NumericLiteralNode
    Node <|-- TemplateLiteralNode

    OutputNode <|-- StringLiteralNode
    OutputNode <|-- TemplateLiteralNode

    PathPart <|-- PropertyPathPart
    PropertyPathPart <|-- RootPathPart
    PathPart <|-- IndexedPathPart
    PathPart <|-- InterpolationPathPart
```
