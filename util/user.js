//class to hold all grids
class User {
    constructor(user, grids) {
        this._grids = [];
        if (Array.isArray(grids))
            for (const g of grids)
                this._grids.push(new Grid(g));
        else
            this._grids.push(new Grid(grids));
        this._user = user;
    }

    addGrid(grid) {
        this._grids.push(new Grid(grid));
    }

    getWordleWeek() {
        if (this._grids.length == 0) {
            console.error("unable to get wordle week if there are no grids");
            return;
        }
        return this._grids[0]._wordleWeek;
    }


    /**
     *@returns an iterator to cycle through grids from the earliest to the latest
     */
    grids() {
        return {
            next: function () {
                return {
                    done: true,
                    value: ""
                }
            },
            [Symbol.iterator]: function () {
                return this;
            }
        }
    }
}