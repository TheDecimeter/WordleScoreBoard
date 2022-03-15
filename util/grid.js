


//class to handle a grid
class Grid {
    static SkipWords = ["Forgottle", "Missle"];
    constructor(grid) {
        this._gridString = grid;
        this._score = Grid.PARSE_SCORE(this._gridString);
        this._wordleDay = Grid.PARSE_DAY(this._gridString);
        this._wordleWeek = Grid.WORDLE_WEEK(this._wordleDay);
        this._wordleDate = Grid.WORDLE_DATE(this._wordleDay);
    }

    draw() {
        let r = this._gridString.replaceAll("\n", "<BR>");
        r = r.replaceAll("🟨", "<span class = 'boxY'></span>");
        r = r.replaceAll("⬜", "<span class = 'boxW'></span>");
        r = r.replaceAll("🟩", "<span class = 'boxG'></span>");
        r = r.replaceAll("⬛", "<span class = 'boxW'></span>");
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

    static PARSE_SCORE(grid) {
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

    static PARSE_DAY(grid) {
        const t = grid.split(" ");
        const day = t[1];
        if (!day)
            return this.WORDLE_FROM_DATE();
        const r = parseInt(day);
        if (isNaN(r))
            return this.WORDLE_FROM_DATE();
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