nameof<NodeJS.ReadStream>();
nameof.full<(NodeJS.Immediate)>();
nameof.full<import("readline").Interface["close"]>();
nameof.full<typeof process.abort>();
nameof.full<typeof process.argv[0]>();

class Test {
    toString() {
        nameof.full<this["toString"]>();
    }
}
