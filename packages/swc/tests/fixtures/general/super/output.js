class Base {
    get id() {
        return 1;
    }
}
class Test extends Base {
    test() {
        [
            "super",
            "id"
        ];
    }
}
