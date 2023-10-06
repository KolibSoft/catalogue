import { DbContext } from "../lib/database/dbcontext.js";

class MyContext extends DbContext {

    constructor() {
        super("database", 2);
    }

    /**
     * @param {IDBDatabase} database 
     */
    onUpgrade(database) {
        database.createObjectStore("test", { keyPath: "id" });
    }

}

let dbContext = new MyContext();
let dbSet = dbContext.set("test");

await dbSet.addAsync({ id: 123, value: "MY VALUE" });
let item = await dbSet.getAsync(123);
console.log(item);

item.value = "CHANGED";
await dbSet.updateAsync(item);
console.log(await dbSet.getAsync(123));

await dbSet.removeAsync(123);
console.log(await dbSet.getAsync(123));


