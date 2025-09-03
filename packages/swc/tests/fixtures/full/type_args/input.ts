nameof<NodeJS.ReadStream>();
nameof.full<(NodeJS.Immediate)>();
nameof.full<import("readline").Interface["close"]>();
nameof.full<typeof process.abort>();

class Test {
    toString() {
        nameof.full<this["toString"]>();
    }
}
