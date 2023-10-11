import { Page } from "./page.js";
import { Result } from "./result.js";
import { QueryStringSerializer } from "./querystring_serializer.js";
import { CatalogueConnector } from "./abstractions/catalogue_connector.js";
import { ResultUtils } from "./utils/result_utils.js";

/**
 * @template TItem 
 * @template TFilters
 * @implements {CatalogueConnector}
 */
class CatalogueService {

    /** @type {(json: {}) => TItem} */
    #creator;

    /** @type {(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>} */
    #fetch;

    /** @type {string} */
    #uri;

    /** @returns {(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>} */
    get fetch() { return this.#fetch; }

    /** @returns {string} */
    get uri() { return this.#uri; }

    /** @returns {(json: {}) => TItem} */
    get creator() { return this.#creator; }

    /** @returns {boolean} */
    get available() { return navigator.onLine; }

    /**
     * @param {TFilters?} filters 
     * @param {number} pageIndex 
     * @param {number} pageSize 
     * @returns {Promise<Result<Page<TItem>?>>}
     */
    async queryAsync(filters = null, pageIndex = 0, pageSize = DefaultChunkSize) {
        let uri = `${this.#uri}${QueryStringSerializer.serialize(filters)}&pageIndex=${pageIndex}&pageSize=${pageSize}`;
        let response = await this.#fetch(uri, {
            method: "GET"
        });
        let result = await ResultUtils.handleResult(response);
        if (this.#creator && result.data) result.data.items = result.data.items.map(x => this.#creator(x));
        return result;
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem?>>}
     */
    async getAsync(id) {
        let uri = `${this.#uri}/${id}`;
        let response = await this.#fetch(uri, {
            method: "GET"
        });
        let result = await ResultUtils.handleResult(response);
        if (this.#creator && result.data) result.data = this.#creator(result.data);
        return result;
    }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<TItem?>>}
     */
    async insertAsync(item) {
        let uri = `${this.#uri}`;
        let response = await this.#fetch(uri, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });
        let result = await ResultUtils.handleResult(response);
        if (this.#creator && result.data) result.data = this.#creator(result.data);
        return result;
    }

    /**
     * @param {string} id 
     * @param {TItem} item 
     * @returns {Promise<Result<TItem?>>}
     */
    async updateAsync(id, item) {
        let uri = `${this.#uri}/${id}`;
        let response = await this.#fetch(uri, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });
        let result = await ResultUtils.handleResult(response);
        if (this.#creator && result.data) result.data = this.#creator(result.data);
        return result;
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem?>>}
     */
    async deleteAsync(id) {
        let uri = `${this.#uri}/${id}`;
        let response = await this.#fetch(uri, {
            method: "DELETE"
        });
        let result = await ResultUtils.handleResult(response);
        if (this.#creator && result.data) result.data = this.#creator(result.data);
        return result;
    }

    /**
     * @param {(json: TItem) => TItem} creator
     * @param {{(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>}} fetch 
     * @param {string} uri 
     */
    constructor(creator, fetch, uri) {
        this.#creator = creator;
        this.#fetch = fetch;
        this.#uri = uri;
    }

}

export {
    CatalogueService
}