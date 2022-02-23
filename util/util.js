
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