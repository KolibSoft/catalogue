/**
 * @template T
 */
class Page {

    /** @type {T[]} */
    items;

    /** @type {number} */
    pageIndex;

    /** @type {number} */
    pageCount;

    constructor(json) {
        this.items = json?.items ?? null;
        this.pageIndex = json?.pageIndex ?? null;
        this.pageCount = json?.pageCount ?? null;
    }

}

export {
    Page
}