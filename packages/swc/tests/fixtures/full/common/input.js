nameof.full(process.argv);
nameof.full((x) => x["prop"]);
nameof.full((console) => console.log);
nameof.full((console) => console.log.bind);
nameof.full((x) => console.log);
