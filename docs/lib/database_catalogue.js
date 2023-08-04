import { CatalogueConnector } from "./abstractions/catalogue_connector.js";
import { CatalogueFilters } from "./catalogue_filters.js";
import { Page } from "./page.js";
import * as CatalogueStatics from "./catalogue_statics.js";
import { Result } from "./result.js";
import * as PageUtils from "./utils/page_utils.js";
import { DbContext } from "./dbcontext.js";
import { DbSet } from "./dbset.js";

/**
 * @template TItem
 * @template TFilters
 * @implements {CatalogueConnector}
 */
class DatabaseCatalogue {

    /** @type {DbContext} */
    dbContext;

    /** @type {DbSet<TItem>} */
    dbset;

    /** @type {string[]} */
    errors;

    /**
     * @param {DbContext} dbContext 
     * @param {string} name 
     */
    constructor(dbContext, name) {
        this.dbContext = dbContext;
        this.dbset = dbContext.set(name);
        this.errors = [];
    }

    /** @returns {boolean} */
    get available() { return true; }

    /**
     * @param {TItem[]} items 
     * @param {TFilters} filters 
     * @returns {TItem[]}
     */
    queryItems(items, filters) { return items; }

    /**
     * @param {TItem} item 
     * @returns {boolean}
     */
    validateInsert(item) { return true; }

    /**
     * @param {TItem} item 
     * @returns {boolean}
     */
    validateUpdate(item) { return true; }

    /**
     * @param {TItem} item 
     * @returns {boolean}
     */
    validateDelete(item) { return true; }

    /**
     * @param {TFilters} filters 
     * @returns {Promise<Result<Page<TItem>>>}
     */
    async pageAsync(filters = null) {
        this.errors = [];
        let items = await this.dbset.filter(item => {
            if (filters?.changesAt && item.updatedAt < filters.changesAt) return false;
            if (filters?.ids?.length && !(filters.ids.includes(item.id))) return false;
            return true;
        });
        items = this.queryItems(items, filters);
        let page = PageUtils.getPage(items, filters?.pageIndex ?? 0, filters?.pageSize ?? CatalogueStatics.DefaultChunkSize);
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
        this.errors = [];
        let item = await this.dbset.get(id);
        return new Result({
            data: item
        });
    }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<string>>}
     */
    async insertAsync(item) {
        this.errors = [];
        if (item.validate && !item.validate(this.errors)) return new Result({ errors: this.errors });
        if (await this.dbset.get(item.id)) {
            this.errors.push(CatalogueStatics.RepeatedItem);
            return new Result({ errors: this.errors });
        }
        if (!this.validateInsert(item)) return new Result({ errors: this.errors });
        await this.dbset.add(item);
        return new Result({ data: item.id });
    }

    /**
     * @param {string} id 
     * @param {TItem} item 
     * @returns {Promise<Result<boolean>>}
     */
    async updateAsync(id, item) {
        this.errors = [];
        if (item.validate && !item.validate(this.errors)) return new Result({ errors: this.errors });
        let original = await this.dbset.get(id);
        if (original == null) {
            this.errors.push(CatalogueStatics.NoItem);
            return new Result({ errors: this.errors });
        }
        if (item.UpdatedAt < original.UpdatedAt) return new Result({ data: false });
        if (!this.validateUpdate(item)) return new Result({ errors: this.errors });
        await this.dbset.update(item);
        return new Result({ data: true });
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<boolean>>}
     */
    async deleteAsync(id) {
        this.errors = [];
        let item = this.dbset.get(id);
        if (item == null) {
            this.errors.push(CatalogueStatics.NoItem);
            return new Result({ errors: this.errors });
        }
        if (!this.validateDelete(item)) return new Result({ errors: this.errors });
        await this.dbset.remove(id);
        return new Result({ data: true });
    }

}

export {
    DatabaseCatalogue
}