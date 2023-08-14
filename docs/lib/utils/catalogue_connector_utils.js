import { CatalogueConnector } from "../abstractions/catalogue_connector.js";

class CatalogueConnectorUtils {

    /**
     * @template TItem
     * @template TFilters
     * @param {CatalogueConnector<TItem, TFilters>} catalogueConnector 
     * @param {string} id 
     * @param {TItem} item 
     */
    static async syncItem(catalogueConnector, id, item) {
        let original = (await catalogueConnector.getAsync(id)).data;
        if (original == null) {
            if (item == null) return null;
            else return (await catalogueConnector.insertAsync(item)).errors;
        } else {
            if (item == null) return (await catalogueConnector.deleteAsync(id)).errors;
            else if (item.updateAt < original.updateAt) return null;
            else return (await catalogueConnector.updateAsync(id, item)).errors;
        }
    }

    /**
     * @template TItem
     * @template TFilters
     * @param {CatalogueConnector<TItem, TFilters>} dstConnector 
     * @param {CatalogueConnector<TItem, TFilters>} srcConnector 
     * @param {{}} changes 
     */
    static async pullItems(dstConnector, srcConnector, changes) {
        for (let id of Object.keys(changes)) {
            var item = (await srcConnector.getAsync(id)).data;
            let errors = await CatalogueConnectorUtils.syncItem(dstConnector, id, item);
            if (errors == null) delete changes[id];
            else changes[id] = errors;
        }
    }

    /**
     * @template TItem
     * @template TFilters
     * @param {CatalogueConnector<TItem, TFilters>} dstConnector 
     * @param {CatalogueConnector<TItem, TFilters>} srcConnector 
     * @param {{}} changes 
     */
    static async pushItems(srcConnector, dstConnector, changes) {
        for (let id of Object.keys(changes)) {
            var item = (await srcConnector.getAsync(id)).data;
            let errors = await CatalogueConnectorUtils.syncItem(dstConnector, id, item);
            if (errors == null) delete changes[id];
            else changes[id] = errors;
        }
    }

}

export {
    CatalogueConnectorUtils
}