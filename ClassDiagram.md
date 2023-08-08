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