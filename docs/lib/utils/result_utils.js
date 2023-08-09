import { Result } from "../result.js";

class ResultUtils {

    /**
     * @param {Response} response 
     * @returns {Promise<{}>}
     */
    static async handleResult(response) {
        try {
            let result = new Result(await response.json());
            return result;
        } catch { }
        return new Result({ errors: response.statusText.trim().toUpperCase().replace(" ", "_") });
    }

}

export {
    ResultUtils
}