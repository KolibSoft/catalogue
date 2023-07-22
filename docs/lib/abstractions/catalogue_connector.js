import { CatalogueFilters } from "../catalogue_filters.js";
import { Page } from "../page.js";
import { Result } from "../result.js";

/**
 * @template TItem 
 * @template TFilters
 */
class CatalogueConnector {

    /** @returns {boolean} */
    get available() { throw new Error("Not implemented"); }

    /**
     * @param {TFilters} filters 
     * @returns {Promise<Result<Page<TItem>>>}
     */
    async pageAsync(filters = null) { throw new Error("Not implemented"); }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem>>}
     */
    async getAsync(id) { throw new Error("Not implemented"); }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<string>>}
     */
    async insertAsync(item) { throw new Error("Not implemented"); }

    /**
     * @param {string} id 
     * @param {TItem} item 
     * @returns {Promise<Result<boolean>>}
     */
    async updateAsync(id, item) { throw new Error("Not implemented"); }

    /**
     * @param {string} id 
     * @returns {Promise<Result<boolean>>}
     */
    async deleteAsync(id) { throw new Error("Not implemented"); }

}

export {
    CatalogueConnector
}