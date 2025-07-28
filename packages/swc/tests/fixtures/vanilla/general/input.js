nameof(console);
nameof(console.log);
nameof(this);

class Employee {
    #id;

    /** @param {number} id */
    constructor(id) {
        this.#id = id;
    }

    toString() {
        return `Employee with ${nameof(this.#id)} ${this.#id}`;
    }
}
