import * as Catalogue from "../lib/main.js"

class SettingsModel extends Catalogue.Item {

    /** @type {string} */
    value;

    /** @type {boolean} */
    active;

    /**
     * @param {string[]?} errors 
     * @returns {boolean}
     */
    validate(errors = null) {
        let valid = super.validate(errors);
        if (!this.value) {
            errors?.push("EMPTY_VALUE");
            valid = false;
        }
        return valid;
    }

    /**
     * @param {SettingsModel} newState 
     */
    update(newState) {
        super.update(newState);
        this.value = newState.value;
        this.active = newState.active;
    }

    /**
     * @param {SettingsModel} json 
     */
    constructor(json) {
        super(json);
        this.value = json?.value ?? "";
        this.active = json?.active ?? false;
    }

}

class SettingsContext extends Catalogue.DbContext {

    /**
     * @param {IDBDatabase} database
     */
    onUpgrade(database) {
        database.createObjectStore("settings", {
            keyPath: "id",
        });
    }

    constructor(name, version) {
        super(name, version)
    }

}

console.log(Catalogue.QueryStringSerializer.serialize({
    pageIndex: 0,
    pageSize: 10,
    clean: true,
    ids: [
        crypto.randomUUID(),
        crypto.randomUUID(),
        crypto.randomUUID(),
    ],
    changesAt: new Date()
}));

let uri = "http://localhost:5033/settings";
let settingsContext = new SettingsContext("database_2", 2);
let localConnector = new Catalogue.DatabaseCatalogue(json => new SettingsModel(json), settingsContext, "settings");
let remoteConnector = new Catalogue.CatalogueService(json => new SettingsModel(json), (a, b) => fetch(a, b), uri);
let changes = JSON.parse(localStorage.changes ?? "[]");
console.log(changes);

let connector = new Catalogue.ServiceCatalogue(localConnector, remoteConnector, changes);
await connector.syncChangesAsync();

let item = new SettingsModel();
item.id = crypto.randomUUID();
item.value = "NEW VALUE";

console.log(await connector.queryAsync());
console.log(await connector.insertAsync(item));
console.log(await connector.queryAsync());
item.value = "CHANGED";
console.log(await connector.updateAsync(item.id, item));
console.log(await connector.getAsync(item.id));
console.log(await connector.queryAsync());
// console.log(await connector.deleteAsync(item.id));
console.log(await connector.queryAsync());

console.log(changes);
localStorage.changes = JSON.stringify(changes);
