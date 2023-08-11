import { CatalogueConnector } from "../abstractions/catalogue_connector.js";
import { CatalogueFilters } from "../catalogue_filters.js";
import { Page } from "../page.js";
import { CatalogueStatics } from "../catalogue_statics.js";
import { Result } from "../result.js";
import { PageUtils } from "../utils/page_utils.js";
import { DbContext } from "../dbcontext.js";
import { DbSet } from "../dbset.js";

/**
 * @template TItem
 * @template TFilters
 * @implements {CatalogueConnector}
 */
class DatabaseCatalogue {

    /** @type {(json: {}) => TItem} */
    #creator;

    /** @type {DbContext} */
    #dbContext;

    /** @type {DbSet<TItem>} */
    #dbset;

    /** @type {string[]} */
    #errors;

    /** @returns {(json: {}) => TItem} */
    get creator() { return this.#creator; }

    /** @returns {DbContext} */
    get dbContext() { return this.#dbContext; }

    /** @returns {DbSet<TItem>} */
    get dbset() { return this.#dbset; }

    /** @returns {string[]} */
    get errors() { return this.#errors; }

    /** @returns {boolean} */
    get available() { return 'indexedDB' in window; }

    /**
     * @param {TItem[]} items 
     * @param {TFilters} filters 
     * @returns {TItem[]}
     */
    async queryItems(items, filters) { return items; }

    /**
     * @param {TItem} item 
     * @returns {boolean}
     */
    async validateInsert(item) { return true; }

    /**
     * @param {TItem} item 
     * @returns {boolean}
     */
    async validateUpdate(item) { return true; }

    /**
     * @param {TItem} item 
     * @returns {boolean}
     */
    async validateDelete(item) { return true; }

    /**
     * @param {TFilters} filters 
     * @returns {Promise<Result<Page<TItem>>>}
     */
    async pageAsync(filters = null) {
        this.#errors = [];
        let items = await this.#dbset.filter(item => {
            if (filters?.changesAt && item.updatedAt < filters.changesAt) return false;
            if (filters?.ids?.length && !(filters.ids.includes(item.id))) return false;
            return true;
        });
        items = await this.queryItems(items, filters);
        let page = PageUtils.getPage(items, filters?.pageIndex ?? 0, filters?.pageSize ?? CatalogueStatics.DefaultChunkSize);
        if (this.#creator) page.items = page.items.map(x => this.#creator(x));
        return new Result({
            data: new Page({
                items: page.items,
                pageIndex: page.pageIndex,
                pageCount: page.pageCount
            })
        });
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem>>}
     */
    async getAsync(id) {
        this.#errors = [];
        let item = await this.#dbset.get(id);
        if (this.#creator && item) item = this.#creator(item);
        return new Result({
            data: item
        });
    }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<string>>}
     */
    async insertAsync(item) {
        this.#errors = [];
        if (item.validate && !item.validate(this.#errors)) return new Result({ errors: this.#errors });
        if (await this.#dbset.get(item.id)) {
            this.#errors.push(CatalogueStatics.RepeatedItem);
            return new Result({ errors: this.#errors });
        }
        if (!(await this.validateInsert(item))) return new Result({ errors: this.#errors });
        await this.#dbset.add(item);
        return new Result({ data: item.id });
    }

    /**
     * @param {string} id 
     * @param {TItem} item 
     * @returns {Promise<Result<boolean>>}
     */
    async updateAsync(id, item) {
        this.#errors = [];
        if (item.validate && !item.validate(this.#errors)) return new Result({ errors: this.#errors });
        let original = await this.#dbset.get(id);
        if (original == null) {
            this.#errors.push(CatalogueStatics.NoItem);
            return new Result({ errors: this.#errors });
        }
        if (item.UpdatedAt < original.UpdatedAt) return new Result({ data: false });
        if (!(await this.validateUpdate(item))) return new Result({ errors: this.#errors });
        await this.#dbset.update(item);
        return new Result({ data: true });
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<boolean>>}
     */
    async deleteAsync(id) {
        this.#errors = [];
        let item = this.#dbset.get(id);
        if (item == null) {
            this.#errors.push(CatalogueStatics.NoItem);
            return new Result({ errors: this.#errors });
        }
        if (!(await this.validateDelete(item))) return new Result({ errors: this.#errors });
        await this.#dbset.remove(id);
        return new Result({ data: true });
    }

    /**
     * @param {(json: {}) => TItem} creator
     * @param {DbContext} dbContext 
     * @param {string} name 
     */
    constructor(creator, dbContext, name) {
        this.#creator = creator;
        this.#dbContext = dbContext;
        this.#dbset = dbContext.set(name);
        this.#errors = [];
    }

}

export {
    DatabaseCatalogue
}