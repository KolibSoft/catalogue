/**
 * @template T
 */
class Result {

    /** @type {T} */
    data;

    /** @type {string[]} */
    errors;

    constructor(json) {
        this.data = json?.data ?? null;
        this.errors = json?.errors ?? null;
    }
}

export {
    Result
}