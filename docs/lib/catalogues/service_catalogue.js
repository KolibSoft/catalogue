import { CatalogueFilters } from "../catalogue_filters.js";
import { Page } from "../page.js";
import { Result } from "../result.js";
import { CatalogueConnector } from "../abstractions/catalogue_connector.js";
import { CatalogueConnectorUtils } from "../utils/catalogue_connector_utils.js";

/**
 * @template TItem 
 * @template TFilters
 * @implements {CatalogueConnector}
 */
class ServiceCatalogue {

    /** @type {CatalogueConnector<TItem, TFilters>} */
    localConnector;

    /** @type {CatalogueConnector<TItem, TFilters>} */
    remoteConnector;

    /** @type {{}} */
    changes;

    /** @returns {boolean} */
    get available() { return this.remoteConnector.available || this.localConnector.available; }

    async sync() {
        if (this.remoteConnector.available)
            try {
                await CatalogueConnectorUtils.pushItems(this.localConnector, this.remoteConnector, this.changes);
            } catch { }
    }

    /**
     * @param {TFilters} filters 
     * @returns {Promise<Result<Page<TItem>>>}
     */
    async pageAsync(filters = null) {
        if (this.remoteConnector.available)
            try {
                let result = await this.remoteConnector.pageAsync(filters);
                if (result.data?.items.length > 0) for (let item of result.data?.items) await CatalogueConnectorUtils.syncItem(this.localConnector, item.id, item);
                return result;
            } catch { }
        return await this.localConnector.pageAsync(filters);
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem>>}
     */
    async getAsync(id) {
        if (this.remoteConnector.available)
            try {
                let result = await this.remoteConnector.getAsync(id);
                if (result.errors == null) await CatalogueConnectorUtils.syncItem(this.localConnector, id, result.data);
                return result;
            } catch { }
        return await this.localConnector.getAsync(id);
    }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<string>>}
     */
    async insertAsync(item) {
        let result = null;
        if (this.remoteConnector.available)
            try {
                result = await this.remoteConnector.insertAsync(item);
                if (result.data != null) await this.getAsync(result.data);
                return result;
            } catch { }
        result = await this.localConnector.insertAsync(item);
        if (result.data != null) this.changes[result.data] = null;
        return result;
    }

    /**
     * @param {string} id 
     * @param {TItem} item 
     * @returns {Promise<Result<boolean>>}
     */
    async updateAsync(id, item) {
        let result = null;
        if (this.remoteConnector.available)
            try {
                result = await this.remoteConnector.updateAsync(id, item);
                if (result.data == true) await this.getAsync(id);
                return result;
            } catch { }
        result = await this.localConnector.updateAsync(id, item);
        if (result.data == true) this.changes[id] = null;
        return result;
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<boolean>>}
     */
    async deleteAsync(id) {
        let result = null;
        if (this.remoteConnector.available)
            try {
                result = await this.remoteConnector.deleteAsync(id);
                if (result.data == true) await this.getAsync(id);
                return result;
            } catch { }
        result = await this.localConnector.deleteAsync(id);
        if (result.data == true) this.changes[id] = null;
        return result;
    }

    /**
     * 
     * @param {CatalogueConnector<TItem, TFilters>} localConnector 
     * @param {CatalogueConnector<TItem, TFilters>} remoteConnector 
     * @param {Set<Change>} changes 
     */
    constructor(localConnector, remoteConnector, changes) {
        this.localConnector = localConnector;
        this.remoteConnector = remoteConnector;
        this.changes = changes;
    }

}

export {
    ServiceCatalogue
}