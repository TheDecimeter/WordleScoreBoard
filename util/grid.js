


//class to handle a grid
class Grid {
    static SkipWords = ["Forgottle", "Missle"];
    constructor(grid) {
        this._gridString = grid;
        this._score = Grid.PARSE_SCORE(grid);
        this._wordleDay = Grid.PARSE_DAY(grid);
        this._wordleWeek = Grid.WORDLE_WEEK(this._wordleDay);
        this._wordleDate = Grid.WORDLE_DATE(this._wordleDay);
    }

    draw() {
        let r = this._gridString.replaceAll("🟨", "<span class = 'boxY'></span>");
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
        return 226 + ((this.TODAY().getTime() - this.START_DAY().getTime()) / 86400000);
    }

    static WORDLE_WEEK(wordleDay = this.WORDLE_FROM_DATE()) {
        return Math.floor((wordleDay + 5) / 7);
    }

    static TODAY(date = new Date()) {
        const today = new Date();
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    static START_DAY() {
        return new Date(2022, 0, 31);
    }
}