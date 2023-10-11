import { Result } from "../result.js";

class ResultUtils {

    /**
     * @param {Response} response 
     * @returns {Promise<{}>}
     */
    static async handleResult(response) {
        try {
            let result = new Result(await response.json());
            if(result != null) result = new Result(result);
            return result;
        }
        catch (error) { console.log(error); }
        return new Result({ errors: response.statusText.trim().toUpperCase().replace(" ", "_") });
    }

}

export {
    ResultUtils
}