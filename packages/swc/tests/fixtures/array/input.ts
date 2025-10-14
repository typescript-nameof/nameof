nameof.array(console, process);
nameof.array([console, process]);
nameof.array(() => [Number, String]);
nameof.array((x: Console) => [x.log, nameof.full((_) => x.clear)]);
nameof.array<Console, String>();
nameof.array<[unknown, undefined]>();
