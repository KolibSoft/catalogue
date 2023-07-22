import { CatalogueConnector } from "./abstractions/catalogue_connector.js";
import { CatalogueFilters } from "./catalogue_filters.js";
import { Page } from "./page.js";
import * as CatalogueStatics from "./catalogue_statics.js";
import { Result } from "./result.js";
import * as PageUtils from "./utils/page_utils.js";

/**
 * @template TItem 
 * @template TFilters
 * @implements {CatalogueConnector}
 */
class CollectionCatalogue {

    /** @type {TItem[]} */
    collection;

    /** @type {string[]} */
    errors;

    /**
     * @param {TItem[]} collection 
     */
    constructor(collection) {
        this.collection = collection;
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
        let items = this.collection;
        if (filters?.ids?.length) items = items.filter(x => filters.ids.includes(x.id));
        if (filters != null) items = this.queryItems(items, filters);
        let page = PageUtils.getPage(items, filters?.pageIndex ?? 0, filters?.pageSize ?? CatalogueStatics.DefaultChunkSize);
        return new Result({
            data: new Page({
                items: page.items,
                pageIndex: page.pageIndex,
                pageCount: page.pageCount,
                changesAt: new Date()
            })
        });
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem>>}
     */
    async getAsync(id) {
        this.errors = [];
        let item = this.collection.find(x => x.id == id);
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
        if (this.collection.some(x => x.id == item.id)) {
            this.errors.push(CatalogueStatics.RepeatedItem);
            return new Result({ errors: this.errors });
        }
        if (!this.validateInsert(item)) return new Result({ errors: this.errors });
        this.collection.push(item);
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
        let original = this.collection.find(x => x.id == item.id);
        if (original == null) {
            this.errors.push(CatalogueStatics.NoItem);
            return new Result({ errors: this.errors });
        }
        if (item.UpdatedAt < original.UpdatedAt) return new Result({ data: false });
        if (!this.validateUpdate(item)) return new Result({ errors: this.errors });
        original.update(item);
        return new Result({ data: true });
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<boolean>>}
     */
    async deleteAsync(id) {
        this.errors = [];
        let item = this.collection.find(x => x.id == item.id);
        if (item == null) {
            this.errors.push(CatalogueStatics.NoItem);
            return new Result({ errors: this.errors });
        }
        if (!this.validateDelete(item)) return new Result({ errors: this.errors });
        this.collection.splice(this.collection.indexOf(item), 1);
        return new Result({ data: true });
    }

}

export {
    CollectionCatalogue
}