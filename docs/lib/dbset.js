import { DbContext } from "./dbcontext.js";

/**
 * @template T
 */
class DbSet {

    /** @type {DbContext} */
    dbContext;

    /** @type {string} */
    name;

    constructor(dbContext, name) {
        this.dbContext = dbContext;
        this.name = name;
    }

    /**
     * @param {(item: T) => boolean} selector 
     * @returns {Promise<T[]>}
     */
    filter(selector) {
        return new Promise(async (resolve, reject) => {
            let idb = await this.dbContext.open();
            let transaction = idb.transaction([this.name], "readwrite");
            let store = transaction.objectStore(this.name);
            let request = store.openCursor();
            let items = [];
            request.onsuccess = event => {
                let cursor = event.target.result;
                if (cursor) {
                    let item = cursor.value;
                    if (selector(item)) {
                        items.push(item);
                    }
                    cursor.continue();
                } else {
                    idb.close();
                    resolve(items);
                }
            };
            request.onerror = event => {
                idb.close();
                reject(event.target.error);
            };
        });
    }

    /**
     * @param {any} id 
     * @returns {Promise<T>}
     */
    get(id) {
        return new Promise(async (resolve, reject) => {
            let idb = await this.dbContext.open();
            let transaction = idb.transaction([this.name], "readwrite");
            let store = transaction.objectStore(this.name);
            let request = store.get(id);
            request.onsuccess = event => {
                let item = event.target.result;
                idb.close();
                resolve(item);
            };
            request.onerror = event => {
                idb.close();
                reject(event.target.error);
            };
        });
    }

    /**
     * @param {T} item 
     * @returns {Promise<void>}
     */
    add(item) {
        return new Promise(async (resolve, reject) => {
            let idb = await this.dbContext.open();
            let transaction = idb.transaction([this.name], "readwrite");
            let store = transaction.objectStore(this.name);
            let request = store.add(item);
            request.onsuccess = event => {
                idb.close();
                resolve();
            };
            request.onerror = event => {
                idb.close();
                reject(event.target.error);
            };
        });
    }

    /**
     * @param {T} item 
     * @returns {Promise<void>}
     */
    update(item) {
        return new Promise(async (resolve, reject) => {
            let idb = await this.dbContext.open();
            let transaction = idb.transaction([this.name], "readwrite");
            let store = transaction.objectStore(this.name);
            let request = store.put(item);
            request.onsuccess = event => {
                idb.close();
                resolve();
            };
            request.onerror = event => {
                idb.close();
                reject(event.target.error);
            };
        });
    }

    /**
     * @param {any} id 
     * @returns {Promise<void>}
     */
    remove(id) {
        return new Promise(async (resolve, reject) => {
            let idb = await this.dbContext.open();
            let transaction = idb.transaction([this.name], "readwrite");
            let store = transaction.objectStore(this.name);
            let request = store.delete(id);
            request.onsuccess = event => {
                idb.close();
                resolve();
            };
            request.onerror = event => {
                idb.close();
                reject(event.target.error);
            };
        });
    }

}

export {
    DbSet
}