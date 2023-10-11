class Change {

    /** @type {string} */
    id;

    /** @type {string[]} */
    errors;

    /**
     * @param {Change} json 
     */
    constructor(json) {
        this.id = json?.id ?? null;
        this.errors = json?.errors ?? [];
        if (!this.id) throw Error("Id can not be null");
    }

}

export {
    Change
}