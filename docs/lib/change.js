class Change {

    /** @type {string} */
    id;

    /** @type {string[]} */
    errors;

    /**
     * @param {{}} json 
     */
    constructor(json) {
        this.id = json?.id ?? null;
        this.errors = json?.errors ?? [];
        if (!id) throw Error("Id can not be null");
    }

}

export {
    Change
}