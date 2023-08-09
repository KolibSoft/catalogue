class Item {

    /**
     * @param {string[]} errors 
     * @returns {boolean}
     */
    validate(errors) { return true; }

    /**
     * @param {{}} json 
     */
    constructor(json) {
        this.id = json?.id ?? crypto.randomUUID();
        this.updatedAt = new Date(json?.updatedAt ?? new Date());
    }

}

export {
    Item
}