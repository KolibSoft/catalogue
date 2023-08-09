class CatalogueFilters {

    /** @type {number} */
    pageIndex;

    /** @type {number} */
    pageSize;

    /** @type {string[]} */
    ids;

    /** @type {string} */
    hint;

    constructor(json) {
        this.pageIndex = json?.pageIndex ?? null;
        this.pageSize = json?.pageSize ?? null;
        this.ids = json?.ids ?? null;
        this.hint = json?.hint ?? null;
    }

}

export {
    CatalogueFilters
}