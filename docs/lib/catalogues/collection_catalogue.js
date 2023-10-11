import { CatalogueConnector } from "../abstractions/catalogue_connector.js";
import { DefaultChunkSize } from "../constants.js";
import { Page } from "../page.js";
import { Result } from "../result.js";
import { PageUtils } from "../utils/page_utils.js";

/**
 * @template TItem 
 * @template TFilters
 * @implements {CatalogueConnector<TItem, TFilters>}
 */
class CollectionCatalogue extends CatalogueConnector {

    /** @type {TItem[]} */
    #collection;

    /** @type {string[]} */
    #errors;

    /** @returns {TItem[]} */
    get collection() { return this.#collection; }

    /** @returns {string[]} */
    get errors() { return this.#errors; }

    /** @returns {boolean} */
    get available() { return true; }

    /**
     * @param {TFilters?} filters 
     * @returns {TItem[]}
     */
    async onQueryAsync(filters) { return this.#collection; }

    /**
     * @param {string} id 
     * @returns {TItem?}
     */
    async onGetAsync(id) { return this.#collection.find(x => x.id == id); }

    /**
     * @param {TItem} item 
     * @returns {boolean}
     */
    async onValidateInsertAsync(item) { return true; }

    /**
     * @param {TItem} item 
     * @returns {boolean}
     */
    async onValidateUpdateAsync(item) { return true; }

    /**
     * @param {TItem} item 
     * @returns {boolean}
     */
    async onValidateDeleteAsync(item) { return true; }

    /**
     * @param {TFilters?} filters 
     * @param {number} pageIndex 
     * @param {number} pageSize 
     * @returns {Promise<Result<Page<TItem>?>>}
     */
    async queryAsync(filters = null, pageIndex = 0, pageSize = DefaultChunkSize) {
        this.#errors = [];
        let items = await this.onQueryAsync(filters);
        let page = PageUtils.getPage(items, pageIndex, pageSize);
        return new Result({ data: page });
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem?>>}
     */
    async getAsync(id) {
        this.#errors = [];
        let item = await this.onGetAsync(id);
        return new Result({ data: item });
    }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<TItem?>>}
     */
    async insertAsync(item) {
        this.#errors = [];
        if (!item.validate(this.#errors)) return new Result({ errors: this.#errors });
        let original = this.#collection.find(x => x.id == item.id);
        if (original != null) return new Result({ data: null });
        if (!(await this.onValidateInsertAsync(item))) return new Result({ errors: this.#errors });
        this.#collection.push(item);
        return new Result({ data: item });
    }

    /**
     * @param {string} id 
     * @param {TItem} item 
     * @returns {Promise<Result<TItem?>>}
     */
    async updateAsync(id, item) {
        this.#errors = [];
        if (!item.validate(this.#errors)) return new Result({ errors: this.#errors });
        let original = this.#collection.find(x => x.id == id);
        if (original == null) return new Result({ data: null });
        if (!(await this.onValidateUpdateAsync(item))) return new Result({ errors: this.#errors });
        original.update(item);
        return new Result({ data: original });
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem?>>}
     */
    async deleteAsync(id) {
        this.#errors = [];
        let item = this.#collection.find(x => x.id == item.id);
        if (item == null) return new Result({ data: null });
        if (!(await this.onValidateDeleteAsync(item))) return new Result({ errors: this.#errors });
        this.#collection.splice(this.#collection.indexOf(item), 1);
        return new Result({ data: item });
    }

    /**
     * @param {TItem[]?} collection 
     */
    constructor(collection = null) {
        super();
        this.#collection = collection ?? [];
        this.#errors = [];
    }

}

export {
    CollectionCatalogue
}