import { CatalogueConnector } from "../abstractions/catalogue_connector.js";
import { CatalogueFilters } from "../catalogue_filters.js";
import { Page } from "../page.js";
import { CatalogueStatics } from "../catalogue_statics.js";
import { Result } from "../result.js";
import { PageUtils } from "../utils/page_utils.js";

/**
 * @template TItem 
 * @template TFilters
 * @implements {CatalogueConnector}
 */
class CollectionCatalogue {

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
        let items = this.#collection;
        if (filters?.changesAt) items = items.filter(x => x.updatedAt >= filters.changesAt);
        if (filters?.ids?.length) items = items.filter(x => filters.ids.includes(x.id));
        items = await this.queryItems(items, filters);
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
        this.#errors = [];
        let item = this.#collection.find(x => x.id == id);
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
        if (this.#collection.some(x => x.id == item.id)) {
            this.#errors.push(CatalogueStatics.RepeatedItem);
            return new Result({ errors: this.#errors });
        }
        if (!(await this.validateInsert(item))) return new Result({ errors: this.#errors });
        this.#collection.push(item);
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
        let original = this.#collection.find(x => x.id == item.id);
        if (original == null) {
            this.#errors.push(CatalogueStatics.NoItem);
            return new Result({ errors: this.#errors });
        }
        if (item.UpdatedAt < original.UpdatedAt) return new Result({ data: false });
        if (!(await this.validateUpdate(item))) return new Result({ errors: this.#errors });
        original.update(item);
        return new Result({ data: true });
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<boolean>>}
     */
    async deleteAsync(id) {
        this.#errors = [];
        let item = this.#collection.find(x => x.id == item.id);
        if (item == null) {
            this.#errors.push(CatalogueStatics.NoItem);
            return new Result({ errors: this.#errors });
        }
        if (!(await this.validateDelete(item))) return new Result({ errors: this.#errors });
        this.#collection.splice(this.#collection.indexOf(item), 1);
        return new Result({ data: true });
    }

    /**
     * @param {TItem[]} collection 
     */
    constructor(collection) {
        this.#collection = collection;
        this.#errors = [];
    }

}

export {
    CollectionCatalogue
}