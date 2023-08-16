class UTCUtils {

    /**
     * @param {Date} date 
     * @returns {Date}
     */
    static toUtc(date) {
        date = new Date(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            date.getUTCHours(),
            date.getUTCMinutes(),
            date.getUTCSeconds(),
            date.getUTCMilliseconds()
        );
        return date;
    }

}

export {
    UTCUtils
}