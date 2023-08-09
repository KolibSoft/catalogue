class PageUtils {

    /**
     * @param {[]} items 
     * @param {number} pageIndex 
     * @param {number} pageSize 
     * @returns {[]}
     */
    static getPage(items, pageIndex, pageSize) {
        pageIndex = parseInt(Math.max(0, pageIndex));
        pageSize = parseInt(Math.max(1, pageSize));
        var itemsCount = items.length;
        var pageCount = parseInt(itemsCount / pageSize);
        if (itemsCount % pageSize > 0) pageCount += 1;
        items = items.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize);
        return {
            items: items,
            pageIndex: pageIndex,
            pageCount: pageCount
        };
    }

}

export {
    PageUtils
}