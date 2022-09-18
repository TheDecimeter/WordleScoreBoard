//class to hold all grids
class User {
    /**
     * 
     * @param {string} user username
     * @param {{"grid":string, "day":string} []} grids grid data for all of the user grids
     */
    constructor(user, grids) {
        /** @type Grid[] */
        this._grids = [];
        if (Array.isArray(grids))
            for (const g of grids)
                this._grids.push(new Grid(g.grid, g.day));
        // else
        //     this._grids.push(new Grid(grids.grid, grids.day));

        this._user = User.UNIFORM(user);
        this._grids.sort((a, b) => a._wordleDate.getTime() - b._wordleDate.getTime());
    }

    static UNIFORM(name) {
        return User.NORMALIZE_NAME(User.DECODE(name).trim());
    }

    static NORMALIZE_NAME(n) {
        if (n == null || n.length == 0)
            return "";
        n = n.toLowerCase();
        if (n == "machine") {
            return "<span style='color:darkgray;'><i>MACHINE</i></span>";
        }
        let nt = n.split(" ");

        let r = "";
        for (let nn of nt) {
            if (nn.length == 0)
                continue;
            r += nn.charAt(0).toUpperCase();
            if (nn.length > 1)
                r += nn.substring(1, nn.length);
            r += " ";
        }
        return "<b>" + r.trim() + "</b>";
    }

    addGrid(grid) {
        this._grids.push(new Grid(grid));
        this._grids.sort((a, b) => a._wordleDate.getTime() - b._wordleDate.getTime());
    }

    getWordleWeek() {
        if (this._grids.length == 0) {
            console.error("unable to get wordle week if there are no grids");
            return;
        }
        return this._grids[0]._wordleWeek;
    }

    user() {
        return this._user;
    }

    totalScore() {
        let score = 0;
        for (const grid of this._grids)
            score += grid._score;
        return score;
    }

    score(averageScore, days) {
        const playedDays = this._grids.length;
        if (playedDays == 0)
            return 0;
        if (playedDays >= 4)
            return this.totalScore() / playedDays;
        return (this.totalScore() + averageScore * (days - playedDays)) / days;
    }

    drawMissed(averageScore, days) {
        const playedDays = this._grids.length;
        if (playedDays == 0)
            return "";
        let score = 0;
        let prefix = "";
        if (playedDays >= 4) {
            score = this.totalScore() / playedDays;
            prefix = "Player Average"
        }
        else {
            score = averageScore;
            prefix = "Game Average"
        }
        return "<span class = 'missedTxt'>" + prefix + "</span><BR>" + Grid.DRAW_EMPTY(score, ["\t"]).replaceAll("\t", "<span class = 'boxM'></span>");
    }
    drawFinal(averageScore, days) {
        return Grid.DRAW_EMPTY(this.score(averageScore, days), ["\t"]).replaceAll("\t", "<span class = 'boxM'></span>");
    }

    /**
     * compare this user to another by name (for sorting)
     * @param {User} other 
     * @returns a number
     */
    compare(other) {
        return this._user.localeCompare(other._user);
    }

    earliestDay() {
        return this._grids[0]._wordleDay;
    }

    latestDay() {
        return this._grids[this._grids.length - 1]._wordleDay;
    }

    /**
     * @param weekFrom {number} the week start number, if specified this iterator will return days
     * with nulls in place of missing days
     * @returns an iterator to cycle through grids from the earliest to the latest
     */
    grids(weekFrom = null) {
        let dayAt = 0;
        if (weekFrom != null)
            dayAt = weekFrom - 1;
        let i = 0;
        let unique = new Set();
        let grids = this._grids.filter(g => {
            if (unique.has(g._wordleDay)) {
                console.log("filtering " + this._user + " " + g._wordleDay);
                return false;
            }
            unique.add(g._wordleDay);
            return true;
        });

        return {
            length: grids.length,
            next: function () {
                if (i >= grids.length)
                    return {
                        done: true,
                        value: null
                    }
                if (weekFrom != null) {
                    dayAt++;
                    if (grids[i]._wordleDay != dayAt)
                        return {
                            done: false,
                            value: null
                        }
                }
                i++;
                return {
                    done: false,
                    value: grids[i - 1]
                }
            },
            [Symbol.iterator]: function () {
                return this;
            }
        }
    }

    /**
     * 
     * @param {string} val 
     * @returns 
     */
    static ENCODE(val) {
        val = val.trim();
        let r = encodeURI(val).replaceAll("-", "%2d");
        r = r.replaceAll("=", "%3d");
        r = r.replaceAll("?", "%3f");
        r = r.replaceAll("&", "%26");
        r = r.replaceAll(";", "%3b");
        return r.replaceAll("/", "%2f");
    }

    /**
     * 
     * @param {string} val 
     * @returns 
     */
    static DECODE(val) {
        let r = val.replaceAll("%2f", "/");
        r = r.replaceAll("%2d", "-");
        r = r.replaceAll("%3d", "=");
        r = r.replaceAll("%3f", "?");
        r = r.replaceAll("%26", "&");
        r = r.replaceAll("%3b", ";");
        return decodeURI(r);
    }
}