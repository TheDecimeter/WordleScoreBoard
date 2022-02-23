//class that manages all weeks
/**
 * Store weeks and request new ones as necessary
 * 
 * updates the grid with new information
 * periodically checks for updated grids
 */
class WeekManager {

    /**
     * 
     * @param {string} data 
     * @param {HTMLElement} display 
     */
    constructor(data, display) {
        /** @type {Map<number,Week>} */
        this._weeks = new Map();

        /** @type {Week} */
        this._currentWeek = null;
        
        this._display = display;
        this._refreshBoard(data);
    }

    /**
     * update a scoreboard with scores fresh from the server
     * @param {string} weekInfo all the info on ever user for this week
     */
    _refreshBoard(weekInfo) {

    }

    /**
     * see if any board updates have occured
     */
    _queryForBoard() {

    }

    /**
     * add a new grid, and send to the server for an update
     * @param {string} userFieldId the id of the text area which contains the user id
     * @param {string} gridFieldId the id of the text area which contains the grid
     * @param {()=>void} onComplete the id of the text area which contains the user id
     */
    addGrid(userFieldId, gridFieldId, onComplete) {
        //if week exists, add grid to week, otherwise, make a new week

        // const weekNum = Week.getWordleWeek();
        // this._weeks.set(weekNum, week);
        // if (weekNum == this._currentWeek)
        //     this.drawGrid(this._at);

    }

    drawGrid(at) {
        if (at == null)
            return;
    }

    /**
     * add a new grid, and send to the server for an update
     * @param {string} userFieldId the id of the text area which contains the user id
     * @param {string} gridFieldId the id of the text area which contains the grid
     */
    _prepareGrid(userFieldId, gridFieldId) {
        const user = /** @type{HTMLInputElement} */ ($(userFieldId)).value
        const grid = /** @type{HTMLInputElement} */ ($(gridFieldId)).value
        if (user.length > 0)
            localStorage.setItem('WeekManager_UN', user);

        const count = this._currentWeek == null ? 0 : this._currentWeek.getGridCount(); //TODO, plus 1?

        const day = Grid.PARSE_DAY(grid);
        const week = Grid.WORDLE_WEEK(day);

        let form = new FormData();

        form.append("user", encode(user));
        form.append("grid", atob(grid));
        form.append("day", day.toString());
        form.append("week", week.toString());
        form.append("count", count.toString());

        return form;
    }
}