import { CatalogueConnector } from "../abstractions/catalogue_connector.js";
import { Result } from "../result.js";

class CatalogueConnectorUtils {

    /**
     * @template TItem
     * @template TFilters
     * @param {CatalogueConnector<TItem, TFilters>} catalogueConnector 
     * @param {string} id 
     * @param {TItem?} item 
     */
    static async syncItem(catalogueConnector, id, item) {
        let original = (await catalogueConnector.getAsync(id)).data;
        if (original == null) {
            if (item == null) return new Result({ data: null });
            else return await catalogueConnector.insertAsync(item);
        } else {
            if (item == null) return await catalogueConnector.deleteAsync(id);
            else if (item.modifiedAt < original.modifiedAt) return new Result({ data: original });
            else return await catalogueConnector.updateAsync(id, item);
        }
    }

}

export {
    CatalogueConnectorUtils
}