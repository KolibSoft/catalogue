import { InvalidId, InvalidModification, NoGuid } from "./constants.js";

class Item {

    /** @type {string} */
    id;

    /** @type {Date} */
    modifiedAt;

    /**
     * @param {string[]?} errors 
     * @returns {boolean}
     */
    validate(errors = null) {
        let valid = true;
        if (this.id == NoGuid) {
            errors?.push(InvalidId);
            valid = false;
        }
        if (this.modifiedAt > new Date()) {
            errors?.push(InvalidModification);
            valid = false;
        }
        return valid;
    }

    /**
     * @param {Item} newState 
     */
    update(newState) {
        if (this.id == NoGuid) this.id = newState.id;
        this.modifiedAt = newState.modifiedAt;
    }

    /**
     * @param {{id: string, modifiedAt: Date}} json 
     */
    constructor(json) {
        this.id = json?.id ?? NoGuid;
        this.modifiedAt = new Date(json?.modifiedAt ?? new Date());
    }

}

export {
    Item
}