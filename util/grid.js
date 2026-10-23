//class to handle a grid


const colorClass = ["Y", "W", "G", "W", "P", "Br", "R", "Bl", "O"];
const SQUARES = ["🟨", "⬜", "🟩", "⬛", "🟪", "🟫", "🟥", "🟦", "🟧"]

class Grid {

    // @ts-ignore
    static SkipWords = window.skipWords ? window.skipWords : ["Turdle"];

    /**
     * 
     * @param {string | DayStruct} grid 
     * @param {string | number | null} day 
     * @param {CommentResponse[]} comments
     */
    constructor(grid, day = null, comments = []) {
        if (typeof grid != "string") {
            day = grid.day;
            comments = grid.comments || [];
            grid = grid.grid;
        }
        this._gridString = Grid.FIX(grid, day);
        this._score = Grid.PARSE_SCORE(this._gridString);
        this._wordleNum = Grid.PARSE_DAY(this._gridString);
        this._wordleWeek = Grid.WORDLE_WEEK(this._wordleNum);
        this._wordleDate = Grid.WORDLE_DATE(this._wordleNum);
        this._gridPix = Grid.CALC_WIDTH_PX(this._gridString);
        this._comments = new GridComment(comments);

        if (comments.length > 0)
            console.log(`comments found in ${day}`, comments);
        else
            console.log(`no comments found on ${day}`)
    }

    gridPix() {
        return this._gridPix;
    }

    draw() {
        let gridLines = this._gridString.split("\n");
        for (let i = 0; i < gridLines.length; ++i) {
            const line = gridLines[i];
            if (Grid.IS_DATA_LINE(line)) {
                gridLines[i] = line.replaceAll(' ', Grid._squareBox("Trans", "&nbsp;"))
            }
        }

        let r = gridLines.join("<BR>");
        for (let i = 0; i < SQUARES.length; ++i)
            r = r.replaceAll(SQUARES[i], Grid._squareBox(colorClass[i], SQUARES[i]))
        r = r.replaceAll("⬛", "⬜");

        r += this._comments.drawButton();


        return r;
    }

    /**
     * @param {string} colorClass
     * @param {string} squareChar
     */
    static _squareBox(colorClass, squareChar) {
        return `<span class = 'boxGeneric box${colorClass}'><span class = 'invisible'>${squareChar}</span></span>`;
    }

    /**
     * @param {number} score
     */
    static DRAW_EMPTY(score, chars = ["⬜"]) {
        const fullLines = Math.floor(score);
        const partialLine = Math.floor((score - fullLines) * 5);
        let charCount = 0;

        const char = () => {
            charCount++;
            return chars[charCount % chars.length];
        }

        let grid = "";
        for (let line = 0; line < fullLines; ++line)
            grid += char() + char() + char() + char() + char() + "<BR>";
        for (let c = 0; c < partialLine; ++c)
            grid += char();
        return grid;
    }

    /**
     * 
     * @param {string | null} grid 
     * @returns 
     */
    static PARSE_SCORE(grid) {
        if (grid == null)
            return 0;
        if (grid.includes("\n"))
            grid = this.GET_STATS_LINE(grid);
        if (grid == null)
            return 0;
        const firstLine = grid.split("/")[0].split(" ");
        const num = firstLine[firstLine.length - 1];
        if (!num)
            return 0;
        if (num.toLowerCase() == "x")
            return 7;
        const r = parseInt(num);
        if (isNaN(r))
            return 0;
        return r;
    }

    /**
     * 
     * @param {string | null} grid 
     * @param {number | null} defaultDay 
     * @returns 
     */
    static PARSE_DAY(grid, defaultDay = this.WORDLE_FROM_DATE()) {
        if (grid == null)
            return defaultDay;
        if (grid.includes("\n"))
            grid = this.GET_STATS_LINE(grid);
        if (grid == null)
            return defaultDay;
        const t = grid.split(" ");
        const day = t[1];
        if (!day)
            return defaultDay;
        const r = parseInt(day.replace(".", "").replace(",", ""));
        if (isNaN(r))
            return defaultDay;
        return r;
    }


    // @ts-ignore
    static _DAY_OFFSET = window.dayOffset != null ? window.dayOffset : null;
    // @ts-ignore
    static _DAY = window.firstDay != null ? window.firstDay : 758;
    // @ts-ignore
    static _DATE = window.firstDate != null ? new Date(window.firstDate) : new Date(2023, 6, 17);
    // @ts-ignore
    static TIMES_PER_DAY = window.timesPerDay != null ? window.timesPerDay : 1;

    /**
     * @param {number | null} wordleDay
     */
    static WORDLE_DATE(wordleDay) {
        if (wordleDay == null)
            return new Date(this.START_DAY());
        const days = Math.floor((wordleDay - this._DAY) / this.TIMES_PER_DAY);
        const r = new Date(this.START_DAY());
        r.setDate(this.START_DAY().getDate() + days);
        return r;
    }

    static WORDLE_FROM_DATE(day = this.TODAY()) {
        const fromDay = day.getTime();
        const startDay = this.START_DAY().getTime()
        const millisFromToday = fromDay - startDay;

        return this._DAY + Math.round((millisFromToday) / 86400000) * this.TIMES_PER_DAY;
    }

    static WORDLE_WEEK(wordleDay = this.WORDLE_FROM_DATE()) {
        if (this._DAY_OFFSET == null)
            this._DAY_OFFSET = this.FIND_WORDLE_WEEK_OFFSET(this._DAY);
        const offsetDay = wordleDay + this._DAY_OFFSET;
        const normalizedOffset = Math.floor((offsetDay) / (7 * this.TIMES_PER_DAY))
        const returnToWeek = (7 * this.TIMES_PER_DAY);
        const weekDays = normalizedOffset * returnToWeek
        return weekDays - this._DAY_OFFSET;
    }

    /**
     * Helper function to determine what the day offset should be
     * @param {number} firstDayNumber - the number of teh wordle grid which is the first of the week
     * @returns the wordle offset or -1 if it can't be found
     */
    static FIND_WORDLE_WEEK_OFFSET(firstDayNumber) {
        const tmp = this._DAY_OFFSET;
        try {
            for (let day = 0; day < this.TIMES_PER_DAY * 7; ++day) {
                this._DAY_OFFSET = day;
                if (this.WORDLE_WEEK(firstDayNumber) == firstDayNumber)
                    return day;
            }
        }
        finally {
            this._DAY_OFFSET = tmp;
        }
        console.error(`no offset found`)
        return 0;
    }

    static TODAY(date = new Date()) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    static START_DAY() {
        return this._DATE;
        // return new Date(2022, 0, 31);
    }

    /**
     * 
     * @param {Date} date 
     * @returns 
     */
    static PRINT_DATE(date) {
        return "<b>" + date.getDate() + " / " + this._month(date.getMonth()) + " / " + date.getFullYear() + "</b>";
    }

    /**
     * @param {string | number} val
     */
    static _month(val) {
        const nVal = typeof val == "string" ? parseInt(val) : val;
        switch (nVal) {
            case 0: return "JAN";
            case 1: return "FEB";
            case 2: return "MAR";
            case 3: return "APR";
            case 4: return "MAY";
            case 5: return "JUN";
            case 6: return "JLY";
            case 7: return "AUG";
            case 8: return "SEP";
            case 9: return "OCT";
            case 10: return "NOV";
            case 11: return "DEC";
        }
        return "" + (nVal + 1);
    }

    static FILLER_WORD() {
        return this.SkipWords[Math.floor(Math.random() * this.SkipWords.length)];
    }

    /**
     * Standardize formatting of the grid, remove promo text, etc
     * @param {string} grid 
     * @param {number | string | null} day 
     * @returns the grid with a proper date and score header
     */
    static FIX(grid, day = null) {
        if (grid == null || grid.trim().length == 0)
            return "";
        while (grid.includes("  "))
            grid = grid.replaceAll("  ", " ");

        grid = grid.replaceAll("\r", "");
        const firstLine = this.GET_STATS_LINE(grid);

        // @ts-ignore
        if (window.gridClean)
            // @ts-ignore
            grid = window.gridClean(grid, firstLine);
        else {
            grid = grid.replace("\nnyt.com/wordle‌", "");
            grid = grid.replace("\nnyt.com/wordle", "");
            grid = grid.replace(`\n#phrazle\n\nhttps://solitaired.com/phrazle`, "");
        }

        //remove duplicate line breaks between grid lines (phrazle)
        let gridLines = grid.split("\n")
        gridLines = gridLines.filter((v, i) => {
            if (v == firstLine)
                return false;
            if (v.length > 0)
                return true;
            if (Grid.IS_DATA_LINE(gridLines[i + 1])) {
                return false;
            }
            return true;
        });

        grid = gridLines.join("\n");

        //check that there is a first line with stats, if not, create one
        if (firstLine != null)
            return firstLine + "\n\n" + grid;
        if (day == null)
            return this.FILLER_WORD() + " " + this.WORDLE_FROM_DATE() + " " + this.CALC_SCORE(grid) + "\n\n" + grid;
        return this.FILLER_WORD() + " " + day + " " + this.CALC_SCORE(grid) + "\n\n" + grid;
    }

    /**
     * @param {string} grid
     */
    static GET_STATS_LINE(grid) {
        let g = grid.split("\n");
        for (const line of g) {
            const l = line.trim();
            if (this.PARSE_SCORE(l) != 0 &&
                this.PARSE_DAY(l, null) != null)
                return l;
        }
        return null;
    }

    /**
     * @param {string} grid
     */
    static CALC_SCORE(grid) {
        let g = grid.split("\n");
        let score = 0;
        for (const line of g) {
            const l = line.trim();
            if (this.IS_DATA_LINE(l))
                score++;
        }
        if (score == 0)
            return "X/6";
        return score + "/6";
    }

    /**
     * @param {string} grid
     */
    static CALC_WIDTH_PX(grid) {
        const len = this.DATA_LENGTH(grid);
        if (!len)
            return 0;
        return len * 26; //10 width + 1 margin on each side;
    }

    /**
     * 
     * @param {string} l the line of data to check
     * @returns true if 
     */
    static IS_DATA_LINE(l) {
        if (l == null)
            return false;
        return this.IS_SQUARE_CHAR(l, 0);
    }

    /**
     * 
     * @param {string} grid - a string representation of the grid
     */
    static DATA_LENGTH(grid) {
        let g = grid.split("\n");
        for (const line of g) {
            const l = line.trim();
            if (this.IS_DATA_LINE(l)) {
                let end = l.length - 1
                for (; end >= 0; --end)
                    if (this.IS_SQUARE_CHAR(l, end)) {
                        let sub = l.substring(0, end + 1);
                        for (const s of SQUARES) //squares vary in character length so replace all with a single character
                            sub = sub.replaceAll(s, " ");
                        return sub.length;
                    }
            }
        }
    }

    /**
     * see if a  character is a 
     * @param {string} c the string to check the character of
     * @param {number} i the index to check
     * @returns true if the character at the index is a square
     */
    static IS_SQUARE_CHAR(c, i) {
        for (const s of SQUARES) {
            if (c.includes(s, i))
                return true;
        }
        return false;
    }

    /**
     * Get dates from a date
     * @param {Date} startDay 
     * @param {number} length 
     * @returns 
     */
    static DATES_FROM_DATE(startDay, length = 7) {
        let i = -1;
        return {
            length: length,
            next: function () {
                i++;
                return {
                    value: new Date(startDay.getTime() + Math.floor(i / Grid.TIMES_PER_DAY) * 86400000),
                    done: i >= length
                }
            },
            [Symbol.iterator]: function () {
                return this;
            }
        }
    }
}