/**
 * @template T
 */
class Result {

    /** @type {T?} */
    data;

    /** @type {string[]} */
    errors;

    get ok() { return this.errors.length == 0; }

    /**
     * @param {Result} json 
     */
    constructor(json) {
        this.data = json?.data ?? null;
        this.errors = json?.errors ?? [];
    }

}

export {
    Result
}