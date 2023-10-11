class QueryStringSerializer {

    /**
     * @param {any} object 
     * @returns {string}
     */
    static serialize(object) {
        let params = new URLSearchParams();
        for (let key in object) {
            let value = object[key];
            if (value != null) {
                if (Array.isArray(value)) {
                    let items = value;
                    for (let item of items) {
                        if (item != null) {
                            value = JSON.stringify(item);
                            if (value.startsWith("\"") && value.endsWith("\"")) value = value.substring(1, value.length - 1);
                            params.append(key, value);
                        }
                    }
                }
                else {
                    value = JSON.stringify(value);
                    if (value.startsWith("\"") && value.endsWith("\"")) value = value.substring(1, value.length - 1);
                    params.append(key, value);
                }
            }
        }
        let queryString = params.toString();
        if (queryString.length > 0) return `${queryString}`;
        return "";
    }

}

export {
    QueryStringSerializer
}