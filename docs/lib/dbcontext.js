import { DbSet } from "./dbset.js";

class DbContext {

    /** @type {string} */
    name;

    /** @type {number} */
    version;

    /** @type {IDBDatabase} */
    database;

    constructor(name, version) {
        this.name = name;
        this.version = version;
        this.database = null;
    }

    /**
     * @returns {Promise<IDBDatabase>}
     */
    open() {
        return new Promise((resolve, reject) => {
            let request = indexedDB.open(this.name, this.version);
            request.onupgradeneeded = event => {
                this.onUpgrade(event.target.result);
            };
            request.onsuccess = event => {
                this.database = event.target.result;
                resolve(event.target.result)
            };
            request.onerror = event => {
                reject(event.target.error)
            };
        });
    }

    close() {
        if (this.database) {
            this.database.close();
            this.database = null;
        }
    }

    /**
     * @param {string} name 
     * @returns {DbSet}
     */
    set(name) {
        let dbset = new DbSet(this, name);
        return dbset;
    }

    /**
     * @param {IDBDatabase} database 
     */
    onUpgrade(database) { }

}

export {
    DbContext
}