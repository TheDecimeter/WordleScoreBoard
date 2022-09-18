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
     * @param {number} version the client version
     * @param {{msg:any}} laterWeekData data for the week furthest forward in time
     * @param {{msg:any}} earlierWeekData data for the week before the later week
     * @param {HTMLElement} display 
     * @param {HTMLElement} wordleDate 
     * @param {HTMLButtonElement} submitButton submit button element
     * @param {HTMLButtonElement} prevButton submit button element
     * @param {HTMLButtonElement} nextButton submit button element
     */
    constructor(version, laterWeekData, earlierWeekData, display, wordleDate, submitButton, prevButton, nextButton) {
        this._managerVersion = version;
        /** @type {Map<number,Week>} */
        this._weeks = new Map();
        /** @type {Week} */
        let mostRecentWeek = null;
        if (laterWeekData != null && laterWeekData.msg != null && laterWeekData.msg.length > 0)
            mostRecentWeek = this._setWeek(laterWeekData.msg);
        if (earlierWeekData != null && earlierWeekData.msg != null && earlierWeekData.msg.length > 0)
            this._setWeek(earlierWeekData.msg);

        /** @type {Week} */
        this._currentWeek = null;

        this._wordleDate = wordleDate;
        this._display = display;
        this._prevButton = prevButton;
        this._nextButton = nextButton;
        // this._refreshBoard(data);
        this._submitButton = submitButton;
        this._at = Grid.WORDLE_WEEK();

        if (laterWeekData == null && earlierWeekData == null)
            return;

        if (mostRecentWeek == null)
            return;
        if (!this._weeks.has(this._at))
            this._at = Grid.WORDLE_WEEK(mostRecentWeek.latestDay());

        console.log(" at " + this._at)
        this.drawGrid();
    }

    _setWeek(weekData) {
        const week = new Week(weekData);
        this._weeks.set(week.getWordleWeek(), week);
        return week;
    }

    /**
     * update a scoreboard with scores fresh from the server
     * @param {{msg:any[]}} weekInfo all the info on ever user for this week
     */
    _refreshBoard(weekInfo) {
        console.log("refreshing board weekinfo:")
        console.log(weekInfo);
        if (weekInfo != null && weekInfo.msg != null && weekInfo.msg.length > 0) {
            const w = this._setWeek(weekInfo.msg);
            this._at = Grid.WORDLE_WEEK(w.latestDay());
            this.drawGrid();
        }
        else
            this.drawGrid();
    }

    /**
     * see if any board updates have occured
     * @param {number} dir, direction of travel (1 or -1)
     */
    queryForBoard(dir) {
        this._prevButton.disabled = true;
        this._nextButton.disabled = true;
        const data = this._prepareDir(dir);
        const act = dir < 0 ? "prev" : "next";
        if (data.nWeekGuess != -1) {
            this._at = data.nWeekGuess;
            this._updateWeekDisplay();
        }
        this._addGrid(act, data.data, (d) => {
            this._refreshBoard(d.msgs[0].msg);
            this._prevButton.disabled = false;
            this._nextButton.disabled = false;
        });
    }

    /**
     * add a new grid, and send to the server for an update
     * @param {string} userFieldId the id of the text area which contains the user id
     * @param {string} gridFieldId the id of the text area which contains the grid
     */
    addGrid(userFieldId, gridFieldId) {
        const data = this._prepareGrid(userFieldId, gridFieldId);
        this._submitButton.disabled = true;
        this._addGrid("save", data, (d) => {
            this._refreshBoard(d.msgs[0].msg);
            this._submitButton.disabled = false;
        });
    }

    /**
     * add a new grid, and send to the server for an update
     * @param {string} action what the server should do
     * @param {FormData} data the data to send
     * @param {(d:any)=>void} onComplete the function to do on completion
     */
    _addGrid(action, data, onComplete) {
        //if week exists, add grid to week, otherwise, make a new week

        // const weekNum = Week.getWordleWeek();
        // this._weeks.set(weekNum, week);
        // if (weekNum == this._currentWeek)
        //     this.drawGrid(this._at);
        Comm.Send(action, data).then(
            (d) => {
                console.log("got data back from server");
                //if at== data.week, drawgrid
                console.log(d);
                if (d.version != undefined && d.version != this._managerVersion)
                    window.location.reload();
                onComplete(d);
            },
            (d) => {
                console.error("data failed to send " + d);
                let msg = "unknown error";
                if (d.msgs !== undefined) {
                    if (d.msgs[0] !== undefined)
                        if (d.msgs[0].msg !== undefined)
                            msg = d.msgs[0].msg;
                }
                else if (d.msg != undefined)
                    msg = d.msg;
                alert(msg);
                this._submitButton.disabled = false;
            }
        )
    }

    drawGrid() {
        if (this._at == null)
            return;

        const week = this._weeks.get(this._at);
        if (week == null)
            return;
        const latestDay = week.latestDay();
        const dayCount = (latestDay - this._at) + 1;
        const averageScore = week.averageScore();

        this._updateWeekDisplay();
        if (dayCount >= 5)
            this._createEmptyTable(week, dayCount + 1);
        else
            this._createEmptyTable(week, dayCount);

        let y = 0;
        for (const user of this._weeks.get(this._at).users()) {
            let x = 0;
            for (const grid of user.grids(this._at)) {
                if (grid != null) {
                    document.getElementById(this._cellID(x, y)).innerHTML = grid.draw();
                }
                else
                    document.getElementById(this._cellID(x, y)).innerHTML = user.drawMissed(averageScore, dayCount);
                x++;
            }
            for (; x < dayCount; ++x) {
                document.getElementById(this._cellID(x, y)).innerHTML = user.drawMissed(averageScore, dayCount);
            }
            y++;
        }

        //fill scores
        if (dayCount >= 5) {
            y = 0;
            for (const user of this._weeks.get(this._at).users()) {
                document.getElementById(this._cellID(dayCount, y)).innerHTML = user.score(averageScore, dayCount).toFixed(2);
                y++;
            }
        }
    }


    _updateWeekDisplay(week = this._at) {
        this._wordleDate.innerHTML = week.toString();
    }

    /**
     * 
     * @param {Week} week 
     * @param {number} dayCount 
     */
    _createEmptyTable(week, dayCount) {
        while (this._display.firstChild)
            this._display.removeChild(this._display.lastChild);

        let userCount = week.users().length;
        for (let y = -1; y < userCount; ++y) {
            const row = document.createElement("TR");
            this._display.appendChild(row);
            for (let x = -1; x < dayCount; ++x) {
                const cell = document.createElement("TD");
                cell.id = this._cellID(x, y);
                if (x > -1 && y > -1)
                    cell.className = "cell";
                row.appendChild(cell);
            }
        }

        if (dayCount > 5)
            dayCount--;
        let i = 0;
        for (const date of Grid.DATES_FROM_DATE(Grid.WORDLE_DATE(this._at), dayCount)) {
            console.log("date " + i + " " + dayCount)
            document.getElementById(this._cellID(i, -1)).innerHTML = Grid.PRINT_DATE(date);
            i++;
        }

        i = 0;
        for (const user of week.users()) {
            document.getElementById(this._cellID(-1, i)).innerHTML = user.user();
            i++;
        }
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y 
     * @returns 
     */
    _cellID(x, y) {
        return "cell" + x + "," + y;
    }

    /**
     * add a new grid, and send to the server for an update
     * @param {string} userFieldId the id of the text area which contains the user id
     * @param {string} gridFieldId the id of the text area which contains the grid
     */
    _prepareGrid(userFieldId, gridFieldId) {
        const user = User.ENCODE(/** @type{HTMLInputElement} */($(userFieldId)).value);
        const grid = Grid.FIX(/** @type{HTMLInputElement} */($(gridFieldId)).value);
        if (user.length > 0)
            localStorage.setItem('WeekManager_UN', user);


        let count = 1;
        if (this._at != null && this._weeks.get(this._at) != null) {
            const week = this._weeks.get(this._at);
            week.addGrid(user, grid);
            count = week.getGridCount();
        }

        const day = Grid.PARSE_DAY(grid);
        const week = Grid.WORDLE_WEEK(day);

        let form = new FormData();
        console.warn("sending request " + count);

        form.append("user", user);
        form.append("grid", grid);
        form.append("day", day.toString());
        form.append("week", week.toString());
        form.append("count", count.toString());

        return form;
    }

    _prepareDir(dir) {
        let form = new FormData();
        form.append("week", this._at.toString());
        const nWeek = this._getWeekFrom(dir);
        if (nWeek != -1) {
            console.warn("adding nWeek" + nWeek + " " + this._weeks.get(nWeek).getGridCount().toString())
            form.append("nweek", nWeek.toString());
            form.append("count", this._weeks.get(nWeek).getGridCount().toString());
        }

        return { data: form, nWeekGuess: nWeek };
    }

    /**
     * 
     * @param {number} dir 
     * @returns 
     */
    _getWeekFrom(dir) {
        if (this._weeks.has(this._at + dir * 7))
            return this._at + dir * 7;
        if (dir < 0) {
            let curval = -1;
            for (let week of this._weeks) {
                if (week[0] > curval && week[0] < this._at)
                    curval = week[0]
            }
            return curval;
        }
        else {
            let curval = Number.MAX_SAFE_INTEGER;
            for (let week of this._weeks) {
                if (week[0] < curval && week[0] > this._at)
                    curval = week[0]
            }
            if (curval == Number.MAX_SAFE_INTEGER)
                return -1;
            return curval;
        }
    }
}