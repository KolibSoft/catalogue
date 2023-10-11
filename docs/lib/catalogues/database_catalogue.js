import { Page } from "../page.js";
import { Result } from "../result.js";
import { PageUtils } from "../utils/page_utils.js";
import { DbContext } from "../database/dbcontext.js";
import { DbSet } from "../database/dbset.js";
import { DefaultChunkSize } from "../constants.js";
import { CatalogueConnector } from "../abstractions/catalogue_connector.js";

/**
 * @template TItem
 * @template TFilters
 * @implements {CatalogueConnector<TItem, TFilters>}
 */
class DatabaseCatalogue extends CatalogueConnector {

    /** @type {(json: {}) => TItem} */
    #creator;

    /** @type {DbContext} */
    #dbContext;

    /** @type {DbSet<TItem>} */
    #dbSet;

    /** @type {string[]} */
    #errors;

    /** @returns {(json: {}) => TItem} */
    get creator() { return this.#creator; }

    /** @returns {DbContext} */
    get dbContext() { return this.#dbContext; }

    /** @returns {DbSet<TItem>} */
    get dbSet() { return this.#dbSet; }

    /** @returns {string[]} */
    get errors() { return this.#errors; }

    /** @returns {boolean} */
    get available() { return 'indexedDB' in window; }

    /**
     * @param {TFilters?} filters 
     * @returns {TItem[]}
     */
    async onQueryAsync(filters) { return await this.#dbSet.filterAsync(x => true); }

    /**
     * @param {string} id 
     * @returns {TItem?}
     */
    async onGetAsync(id) { return await this.#dbSet.getAsync(id); }

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
        if (this.#creator) items = items.map(x => this.#creator(x));
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
        if (this.#creator && item != null) item = this.#creator(item);
        return new Result({ data: item });
    }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<TItem?>>}
     */
    async insertAsync(item) {
        this.#errors = [];
        if (!item.validate(this.#errors)) return new Result({ errors: this.#errors });
        let original = await this.#dbSet.getAsync(item.id);
        if (original != null) return new Result({ data: null });
        if (!(await this.onValidateInsertAsync(item))) return new Result({ errors: this.#errors });
        await this.#dbSet.addAsync(item);
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
        let original = await this.#dbSet.getAsync(id);
        if (original == null) return new Result({ data: null });
        if (this.#creator) original = this.#creator(original);
        if (!(await this.onValidateUpdateAsync(item))) return new Result({ errors: this.#errors });
        original.update(item);
        await this.#dbSet.updateAsync(item);
        return new Result({ data: original });
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem?>>}
     */
    async deleteAsync(id) {
        this.#errors = [];
        let item = await this.#dbSet.getAsync(id)
        if (item == null) return new Result({ data: null });
        if (this.#creator) item = this.#creator(item);
        if (!(await this.onValidateDeleteAsync(item))) return new Result({ errors: this.#errors });
        await this.#dbSet.removeAsync(id);
        return new Result({ data: item });
    }

    /**
     * @param {(json: TItem) => TItem} creator
     * @param {DbContext} dbContext 
     * @param {string} name 
     */
    constructor(creator, dbContext, name) {
        super();
        this.#creator = creator;
        this.#dbContext = dbContext;
        this.#dbSet = dbContext.set(name);
        this.#errors = [];
    }

}

export {
    DatabaseCatalogue
}