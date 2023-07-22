import { Result } from "../result.js";

/**
 * @param {Response} response 
 */
async function handleResult(response) {
    try {
        let result = new Result(await response.json());
        return result;
    } catch { }
    return new Result({ errors: response.statusText.trim().toUpperCase().replace(" ", "_") });
}

export {
    handleResult
}