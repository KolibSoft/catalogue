class CatalogueFilters {

    /** @type {number} */
    pageIndex;

    /** @type {number} */
    pageSize;

    /** @type {string[]} */
    ids;

    constructor(json) {
        this.pageIndex = json?.pageIndex ?? null;
        this.pageSize = json?.pageSize ?? null;
        this.ids = json?.ids ?? null;
    }

}

export {
    CatalogueFilters
}