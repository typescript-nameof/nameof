class Base {
    get id() {
        return 1;
    }
}

class Test extends Base {
    test() {
        nameof.split(super.id);
    }
}
