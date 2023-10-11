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

    /**
     * @param {{items: T[], pageIndex: number, pageCount: number}} json 
     */
    constructor(json) {
        this.items = json?.items ?? [];
        this.pageIndex = json?.pageIndex ?? 0;
        this.pageCount = json?.pageCount ?? 0;
    }

}

export {
    Page
}