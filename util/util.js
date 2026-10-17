
/**
 * 
 * @param {string | HTMLElement} elem the string id or html element
 * @returns htmlElement
 */
function $(elem) {
    if (typeof elem == "string" || elem instanceof String)
        //@ts-ignore
        return document.getElementById(elem);
    return elem;
}

/**
 * Get the value of an HTMLInputElement
 * @param {string | HTMLElement} elem the string id or html element
 * returns some string value
 */
function val(elem) {
    return /** @type{HTMLInputElement} */ ($(elem)).value;
}


function encode(val) {
    let r = encodeURI(val).replaceAll("-", "%2d");
    r = r.replaceAll("=", "%3d");
    r = r.replaceAll("?", "%3f");
    r = r.replaceAll("&", "%26");
    r = r.replaceAll(";", "%3b");
    return r.replaceAll("/", "%2f");
}

function decode(val) {
    let r = val.replaceAll("%2f", "/");
    r = r.replaceAll("%2d", "-");
    r = r.replaceAll("%3d", "=");
    r = r.replaceAll("%3f", "?");
    r = r.replaceAll("%26", "&");
    r = r.replaceAll("%3b", ";");
    return decodeURI(r);
}

/**
 * Validates the grid input.
 * @param {HTMLInputElement} gridFieldId - The input element for the grid.
 * @returns {string|null} - The validated grid or null if it's invalid.
 */
function gridValidation(gridFieldId) {
    const wellFormedGrid = Grid.FIX(gridFieldId.value)

    // @ts-ignore
    if (window.validateGrid) {
        const firstLine = Grid.GET_STATS_LINE(wellFormedGrid);
        // @ts-ignore
        if (!window.validateGrid(wellFormedGrid, firstLine))
            return null;
    }

    return wellFormedGrid;
}

/**
 * Creates a FormData object from an object.
 * @param {any} data - The data object to convert.
 * @returns {FormData} - The FormData object.
 */
function createForm(data) {
    const form = new FormData();
    for (let key in data) {
        form.append(key, data[key].toString());
    }
    return form;
}