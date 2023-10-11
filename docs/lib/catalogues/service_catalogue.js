import { CatalogueConnector } from "../abstractions/catalogue_connector.js";
import { Change } from "../change.js";
import { DefaultChunkSize } from "../constants.js";
import { Page } from "../page.js";
import { Result } from "../result.js";
import { CatalogueConnectorUtils } from "../utils/catalogue_connector_utils.js";

/**
 * @template TItem 
 * @template TFilters
 * @implements {CatalogueConnector<TItem, TFilters>}
 */
class ServiceCatalogue extends CatalogueConnector {

    /** @type {CatalogueConnector<TItem, TFilters>} */
    #localConnector;

    /** @type {CatalogueConnector<TItem, TFilters>} */
    #remoteConnector;

    /** @type {Change[]} */
    #changes;

    /** @type {CatalogueConnector<TItem, TFilters>} */
    get localConnector() { return this.#localConnector; }

    /** @type {CatalogueConnector<TItem, TFilters>} */
    get remoteConnector() { return this.#remoteConnector; }

    /** @type {Change[]} */
    get changes() { return this.#changes; }

    /** @returns {boolean} */
    get available() { return this.#remoteConnector.available || this.#localConnector.available; }

    /**
     * @param {string} id 
     * @param {TItem?} item 
     * @returns {Promise<Result<TItem?>>}
     */
    async onSyncRemoteAsync(id, item) { return await CatalogueConnectorUtils.syncItem(this.#remoteConnector, id, item); }

    /**
     * @param {string} id 
     * @param {TItem?} item 
     * @returns {Promise<Result<TItem?>>}
     */
    async onSyncLocalAsync(id, item) { return await CatalogueConnectorUtils.syncItem(this.#localConnector, id, item); }

    async syncChangesAsync() {
        if (this.#remoteConnector.available)
            try {
                for (let change of [...this.#changes]) {
                    let get_result = await this.#localConnector.getAsync(change.id);
                    let sync_result = await this.onSyncRemoteAsync(change.id, get_result.data);
                    if (sync_result.ok) {
                        await this.onSyncLocalAsync(change.id, sync_result.data);
                        this.#changes.splice(this.#changes.indexOf(change), 1)
                    }
                    else change.errors = sync_result.errors;
                }
            }
            catch (error) { console.log(error); }
    }

    /**
      * @param {TFilters?} filters 
      * @param {number} pageIndex 
      * @param {number} pageSize 
      * @returns {Promise<Result<Page<TItem>?>>}
      */
    async queryAsync(filters = null, pageIndex = 0, pageSize = DefaultChunkSize) {
        if (this.#remoteConnector.available)
            try {
                let result = await this.#remoteConnector.queryAsync(filters, pageIndex, pageSize);
                if (result.data?.items.length > 0) for (let item of result.data?.items) await this.onSyncLocalAsync(item.id, item);
                return result;
            }
            catch (error) { console.log(error); }
        return await this.#localConnector.queryAsync(filters, pageIndex, pageSize);
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<TItem?>>}
     */
    async getAsync(id) {
        if (this.#remoteConnector.available)
            try {
                let result = await this.#remoteConnector.getAsync(id);
                if (result.ok) await this.onSyncLocalAsync(id, result.data);
                return result;
            }
            catch (error) { console.log(error); }
        return await this.#localConnector.getAsync(id);
    }

    /**
     * @param {TItem} item 
     * @returns {Promise<Result<string>>}
     */
    async insertAsync(item) {
        let result = null;
        if (this.#remoteConnector.available)
            try {
                result = await this.#remoteConnector.insertAsync(item);
                if (result.ok) await this.onSyncLocalAsync(id, result.data);
                return result;
            }
            catch (error) { console.log(error); }
        result = await this.#localConnector.insertAsync(item);
        if (result.Ok) this.#changes.push(new Change({ id: item.id }));
        return result;
    }

    /**
     * @param {string} id 
     * @param {TItem} item 
     * @returns {Promise<Result<boolean>>}
     */
    async updateAsync(id, item) {
        let result = null;
        if (this.#remoteConnector.available)
            try {
                result = await this.#remoteConnector.updateAsync(id, item);
                if (result.ok) await this.onSyncLocalAsync(id, result.data);
                return result;
            }
            catch (error) { console.log(error); }
        result = await this.#localConnector.updateAsync(id, item);
        if (result.Ok) this.#changes.push(new Change({ id: id }));
        return result;
    }

    /**
     * @param {string} id 
     * @returns {Promise<Result<boolean>>}
     */
    async deleteAsync(id) {
        let result = null;
        if (this.#remoteConnector.available)
            try {
                result = await this.#remoteConnector.deleteAsync(id);
                if (result.ok) await this.onSyncLocalAsync(id, null);
                return result;
            }
            catch (error) { console.log(error); }
        result = await this.#localConnector.deleteAsync(id);
        if (result.Ok) this.#changes.push(new Change({ id: id }));
        return result;
    }

    /**
     * 
     * @param {CatalogueConnector<TItem, TFilters>} localConnector 
     * @param {CatalogueConnector<TItem, TFilters>} remoteConnector 
     * @param {Change[]} changes 
     */
    constructor(localConnector, remoteConnector, changes) {
        super();
        this.#localConnector = localConnector;
        this.#remoteConnector = remoteConnector;
        this.#changes = changes;
    }

}

export {
    ServiceCatalogue
}