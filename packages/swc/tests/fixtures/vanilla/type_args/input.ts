nameof<Console>();
nameof<NodeJS.ReadStream>();
nameof<(Console)>();
nameof<number>();
nameof<void>();
nameof<import("readline").Interface>();
nameof<typeof process>();

class Test {
    toString() {
        nameof<this>();
    }
}
