import { Page } from "../page.js";
import { Result } from "../result.js";

/**
 * @interface
 * @template TItem 
 * @template TFilters
 */
class CatalogueConnector {

    /** @returns {boolean} */
    get available() { throw new Error("Not implemented"); }

    /**
       * @param {TFilters?} filters 
       * @param {number} pageIndex 
       * @param {number} pageSize 
       * @returns {Promise<Result<Page<TItem>?>>}
       */
    async queryAsync(filters = null, pageIndex = 0, pageSize = DefaultChunkSize) { throw new Error("Not implemented"); }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem?>>}
     */
    async getAsync(id) { throw new Error("Not implemented"); }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<TItem?>>}
     */
    async insertAsync(item) { throw new Error("Not implemented"); }

    /**
     * @param {string} id 
     * @param {TItem} item 
     * @returns {Promise<Result<TItem?>>}
     */
    async updateAsync(id, item) { throw new Error("Not implemented"); }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem?>>}
     */
    async deleteAsync(id) { throw new Error("Not implemented"); }

}

export {
    CatalogueConnector
}