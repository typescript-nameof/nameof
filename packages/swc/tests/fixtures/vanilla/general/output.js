"console";
"log";
"this";
class Employee {
    #id;
    /** @param {number} id */ constructor(id){
        this.#id = id;
    }
    toString() {
        return `Employee with ${"#id"} ${this.#id}`;
    }
}
