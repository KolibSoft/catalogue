import * as Catalogue from "../lib/main.js"

class SettingsContext extends Catalogue.DbContext {

    constructor(name, version) {
        super(name, version)
    }

    /**
     * @param {IDBDatabase} database
     */
    onUpgrade(database) {
        database.createObjectStore("settings", {
            keyPath: "id",
        });
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
let settingsContext = new SettingsContext("database", 2);
let localConnector = new Catalogue.DatabaseCatalogue(settingsContext, "settings");
let remoteConnector = new Catalogue.CatalogueService((a, b) => fetch(a, b), uri);
let changes = JSON.parse(localStorage.changes ?? "{}");
console.log(changes);

let connector = new Catalogue.ServiceCatalogue(localConnector, remoteConnector, changes);
await connector.sync();

let item = new Catalogue.Item();
item.value = "NEW VALUE";

console.log(await connector.pageAsync());
console.log(await connector.insertAsync(item));
console.log(await connector.pageAsync());
item.value = "CHANGED";
console.log(await connector.updateAsync(item.id, item));
console.log(await connector.getAsync(item.id));
console.log(await connector.pageAsync());
// console.log(await connector.deleteAsync(item.id));
console.log(await connector.pageAsync());

console.log(changes);
localStorage.changes = JSON.stringify(changes);
