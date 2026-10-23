/**
 * Display interface for sending and displaying comments
 */
class GridComment {
    /**
     * Create a new comment manager
     * @param {CommentResponse[]} comments 
     */
    constructor(comments) {
        this._comments = comments;
    }

    /**
     * @returns {string} the button HTML
     */
    drawButton() {
        let r = "";
        const active = this._comments.length > 0
        const currentColor = active ? "#03FF" : "#03F8";
        r += `
        <button class="comment-btn">
        <svg xmlns="http://w3.org" viewBox="0 0 24 24" width="16" height="16" fill="${currentColor}">
            <path d="M12 2C6.48 2 2 6.03 2 11c0 2.76 1.41 5.23 3.65 6.94L4 22l4.88-2.44C10.02 19.83 11 20 12 20c5.52 0 10-4.03 10-9s-4.48-9-10-9zm0 16c-.75 0-1.5-.12-2.2-.34l-.4-.13-2.6 1.3.62-1.87-.27-.29C5.55 14.92 4.5 13.06 4.5 11c0-3.86 3.36-7 7.5-7s7.5 3.14 7.5 7-3.36 7-7.5 7z"/>
        </svg>
        `
        if(active)
            r+=`
        <div class = comment-bubble>${this._comments.length}</div>
        `

        r+=`</button>`

        return r;
    }

}