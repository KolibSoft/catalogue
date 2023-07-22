class Item {

    constructor(json) {
        this.id = json?.id ?? crypto.randomUUID();
        this.updatedAt = new Date(json?.updatedAt ?? new Date());
    }

    validate(errors) { return true; }

}

export {
    Item
}