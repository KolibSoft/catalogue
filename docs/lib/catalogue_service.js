import { CatalogueFilters } from "./catalogue_filters.js";
import { Page } from "./page.js";
import { Result } from "./result.js";
import * as QueryStringSerializer from "./querystring_serializer.js";
import * as ResultUtils from "./utils/result_utils.js";
import { CatalogueConnector } from "./abstractions/catalogue_connector.js";

/**
 * @template TItem 
 * @template TFilters
 * @implements {CatalogueConnector}
 */
class CatalogueService {

    /** @type {(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>} */
    fetch;

    /** @type {string} */
    uri;

    /**
     * @param {{(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>}} fetch 
     * @param {string} uri 
     */
    constructor(fetch, uri) {
        this.fetch = fetch;
        this.uri = uri;
    }

    /** @returns {boolean} */
    get available() { return navigator.onLine; }

    /**
     * @param {TFilters} filters 
     * @returns {Promise<Result<Page<TItem>>>}
     */
    async pageAsync(filters = null) {
        let uri = `${this.uri}${QueryStringSerializer.serialize(filters)}`;
        let response = await fetch(uri, {
            method: "GET"
        });
        let result = await ResultUtils.handleResult(response);
        return result;
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem>>}
     */
    async getAsync(id) {
        let uri = `${this.uri}/${id}`;
        let response = await fetch(uri, {
            method: "GET"
        });
        let result = await ResultUtils.handleResult(response);
        return result;
    }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<string>>}
     */
    async insertAsync(item) {
        let uri = `${this.uri}`;
        let response = await fetch(uri, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });
        let result = await ResultUtils.handleResult(response);
        return result;
    }

    /**
     * @param {string} id 
     * @param {TItem} item 
     * @returns {Promise<Result<boolean>>}
     */
    async updateAsync(id, item) {
        let uri = `${this.uri}/${id}`;
        let response = await fetch(uri, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(item)
        });
        let result = await ResultUtils.handleResult(response);
        return result;
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<boolean>>}
     */
    async deleteAsync(id) {
        let uri = `${this.uri}/${id}`;
        let response = await fetch(uri, {
            method: "DELETE"
        });
        let result = await ResultUtils.handleResult(response);
        return result;
    }

}

export {
    CatalogueService
}