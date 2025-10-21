test(
    "The name of `nameof` should equal `nameof`",
    () =>
    {
        expect(nameof(nameof)).toBe("nameof");
    });
