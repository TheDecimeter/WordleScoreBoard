//class that manages all weeks
/**
 * Store weeks and request new ones as necessary
 * 
 * updates the grid with new information
 * periodically checks for updated grids
 */
class WeekManager {

    constructor(data, display) {
        this.weeks = new Map();
        this.currentWeek = null;
        this.at = null;
        this.display = display;
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
     * temporarly add a new grid, and send to the server for an update
     * @param {string} user use name
     * @param {string} newGrid grid info
     */
    addGrid(user, newGrid) {
        //if week exists, add grid to week, otherwise, make a new week
        const weekNum = week.getWordleWeek();
        this.weeks.set(weekNum, week);
        if (weekNum == this.currentWeek)
            this.drawGrid(this.at);
    }

    drawGrid(at) {
        if (at == null)
            return;
    }
}