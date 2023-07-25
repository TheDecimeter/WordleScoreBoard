


//class to handle a grid
class Grid {
    static SkipWords = ["Turdle"];

    /**
     * 
     * @param {string} grid 
     * @param {string | number} day 
     */
    constructor(grid, day = null) {
        this._gridString = Grid.FIX(grid, day);
        this._score = Grid.PARSE_SCORE(this._gridString);
        this._wordleDay = Grid.PARSE_DAY(this._gridString);
        this._wordleWeek = Grid.WORDLE_WEEK(this._wordleDay);
        this._wordleDate = Grid.WORDLE_DATE(this._wordleDay);
        this._gridPix = Grid.CALC_WIDTH_PX(this._gridString);
    }

    gridPix() {
        return Grid.CALC_WIDTH_PX(this._gridString);
        return this._gridPix;
    }

    draw() {
        let r = this._gridString.replaceAll("\n", "<BR>");
        r = r.replaceAll("🟨", "<span class = 'boxGeneric boxY'>&nbsp;</span>");
        r = r.replaceAll("⬜", "<span class = 'boxGeneric boxW'>&nbsp;</span>");
        r = r.replaceAll("🟩", "<span class = 'boxGeneric boxG'>&nbsp;</span>");
        r = r.replaceAll("⬛", "<span class = 'boxGeneric boxW'>&nbsp;</span>"); //some browser is getting this character confused maybe?
        r = r.replaceAll("🟪", "<span class = 'boxGeneric boxP'>&nbsp;</span>");
        r = r.replaceAll("🟫", "<span class = 'boxGeneric boxBr'>&nbsp;</span>");
        r = r.replaceAll("🟥", "<span class = 'boxGeneric boxR'>&nbsp;</span>");
        r = r.replaceAll("🟦", "<span class = 'boxGeneric boxBl'>&nbsp;</span>");
        r = r.replaceAll("🟧", "<span class = 'boxGeneric boxO'>&nbsp;</span>");
        return r;
    }

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
     * @param {string} grid 
     * @returns 
     */
    static PARSE_SCORE(grid) {
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


    static PARSE_DAY(grid, defaultDay = this.WORDLE_FROM_DATE()) {
        if (grid.includes("\n"))
            grid = this.GET_STATS_LINE(grid);
        if (grid == null)
            return defaultDay;
        const t = grid.split(" ");
        const day = t[1];
        if (!day)
            return defaultDay;
        const r = parseInt(day);
        if (isNaN(r))
            return defaultDay;
        return r;
    }

    static WORDLE_DATE(wordleDay) {
        const days = (wordleDay - 226) * 86400000;
        return new Date(this.START_DAY().getTime() + days);
    }

    static WORDLE_FROM_DATE() {
        return 226 + Math.round((this.TODAY().getTime() - this.START_DAY().getTime()) / 86400000);
    }

    static WORDLE_WEEK(wordleDay = this.WORDLE_FROM_DATE()) {
        return Math.floor((wordleDay + 5) / 7) * 7 - 5;
    }

    static TODAY(date = new Date()) {
        const today = new Date();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    static START_DAY() {
        return new Date(2022, 0, 31);
    }

    /**
     * 
     * @param {Date} date 
     * @returns 
     */
    static PRINT_DATE(date) {
        return "<b>" + date.getDate() + " / " + this._month(date.getMonth()) + " / " + date.getFullYear() + "</b>";
    }

    static _month(val) {
        switch (parseInt(val)) {
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
        return "" + (parseInt(val) + 1);
    }

    static FILLER_WORD() {
        return this.SkipWords[Math.floor(Math.random() * this.SkipWords.length)];
    }

    /**
     * 
     * @param {string} grid 
     * @param {number | string} day 
     * @returns the grid with a proper date and score header
     */
    static FIX(grid, day = null) {
        if (grid == null || grid.trim().length == 0)
            return "";
        while (grid.includes("  "))
            grid = grid.replaceAll("  ", " ");
        grid = grid.replace("\nnyt.com/wordle‌", "");
        grid = grid.replace("\nnyt.com/wordle", "");
        let firstLine = this.GET_STATS_LINE(grid);
        if (firstLine != null)
            return grid;
        if (day == null)
            return this.FILLER_WORD() + " " + this.WORDLE_FROM_DATE() + " " + this.CALC_SCORE(grid) + "\n\n" + grid;
        return this.FILLER_WORD() + " " + day + " " + this.CALC_SCORE(grid) + "\n\n" + grid;
    }

    static GET_STATS_LINE(grid) {
        let g = grid.split("\n");
        let score = 0;
        for (const line of g) {
            const l = line.trim();
            if (this.PARSE_SCORE(l) != 0 &&
                this.PARSE_DAY(l, null) != null)
                return l;
        }
        return null;
    }

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

    static CALC_WIDTH_PX(grid) {
        const len = this.DATA_LENGTH(grid);
        return len * 12*2; //10 width + 1 margin on each side;
    }

    /**
     * 
     * @param {string} l the line of data to check
     * @returns true if 
     */
    static IS_DATA_LINE(l) {
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
                        for (const s of this.SQUARES) //squares vary in character length so replace all with a single character
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
    // static IS_SQUARE_CHAR(c, i) {
    //     const x = c.indexOf("🟩");
    //     return c.indexOf("🟨", i) == i ||
    //         c.indexOf("⬜", i) == i ||
    //         c.indexOf("🟩", i) == i ||
    //         c.indexOf("⬛", i) == i ||
    //         c.indexOf("🟪", i) == i ||
    //         c.indexOf("🟫", i) == i ||
    //         c.indexOf("🟥", i) == i ||
    //         c.indexOf("🟦", i) == i ||
    //         c.indexOf("🟧", i) == i;
    // }
    static IS_SQUARE_CHAR(c, i) {
        const x = this._ISSTR("🟩", i, c);
        for (const s of this.SQUARES) {
            if (this._ISSTR(s, i, c))
                return true;
        }
        return false;
        // return this._ISSTR("🟨", i, c)  ||
        //     this._ISSTR("⬜", i, c)  ||
        //     this._ISSTR("🟩", i, c)  ||
        //     this._ISSTR("⬛", i, c)  ||
        //     this._ISSTR("🟪", i, c)  ||
        //     this._ISSTR("🟫", i, c)  ||
        //     this._ISSTR("🟥", i, c)  ||
        //     this._ISSTR("🟦", i, c)  ||
        //     this._ISSTR("🟧", i, c) ;
    }

    static SQUARES = ["🟨", "⬜", "🟩", "⬛", "🟪", "🟫", "🟥", "🟦", "🟧"]

    /**
     * similar to string[at]=="x" but works for unicode
     * @param {string} str - the sample string to check for
     * @param {number} at - the area of the inStr to check at
     * @param {string} inStr - the string to check in
     * @returns 
     */
    static _ISSTR(str, at, inStr) {
        for (let i = 0; i < str.length; ++i)
            if (str[i] != inStr[at + i])
                return false;
        return true;
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
                    value: new Date(startDay.getTime() + i * 86400000),
                    done: i >= length
                }
            },
            [Symbol.iterator]: function () {
                return this;
            }
        }
    }
}