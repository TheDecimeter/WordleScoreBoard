/**
 * Get an HTML element
 * @param {string | HTMLElement} elem the string id or html element
 * @returns {HTMLElement} the HTML element.
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
 * @returns {any} some string value, or null if elem isn't a HTMLInputElement
 */
function val(elem) {
    if (!elem)
        return null;
    return /** @type{HTMLInputElement} */($(elem)).value;
}

/**
 * Validates the grid input.
 * @param {string} gridFieldValue - The input element for the grid.
 * @returns {string|null} - The validated grid or null if it's invalid.
 */
function gridValidation(gridFieldValue) {
    const wellFormedGrid = Grid.FIX(gridFieldValue)

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

/**
 * get a list of usernames atted in a string of text
 * @param {string} text 
 * @returns {string[]} the list of user names found in the text
 */
function extractUsernames(text) {
    // Regex matches '@' followed by letters, numbers, or underscores
    const regex = /\B@[a-zA-Z0-9_]+/g;
    const matches = text.match(regex);

    // remove the @ symbol
    return matches ? matches.map(username => username.substring(1)) : [];
}

/**
 * get a list of commments for the user's grid
 * @param {string} userName_lower the username we're looking for in the comments
 * @param {CommentResponse[]} comments the comments
 * @returns {CommentResponse[]} a list of comments for the specified user 
 */
function usersComments(userName_lower, comments) {
    const r = comments.filter(c => c.name.startsWith(userName_lower));
    return r;
}

/**
 * get a list of commments directed at a user
 * @param {string} userName_lower the username we're looking for in the comments
 * @param {CommentResponse[]} comments the comments
 * @returns {CommentResponse[]} a list of comments for the specified user 
 */
function userDirectedComments(userName_lower, comments) {
    const r = comments.filter(c => {
        extractUsernames(c.message)
            .map(n => n.toLowerCase())
            .includes(userName_lower)
    })
    return r;
}