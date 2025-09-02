nameof(import.meta);
nameof(import.meta.url);
nameof.full(import.meta);
nameof.full(import.meta.url);

function Test() {
    nameof(new.target);
    nameof.full(new.target);
}
