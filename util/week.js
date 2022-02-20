//class to hold each grid
class Week {
    constructor(userData = null) {
        this._users = new Map();
        if (userData != null) {
            for (const u in userData)
                this._users.set(u, new User(u, userData[u]));
        }
    }

    addGrid(user, grid) {
        if (this._users.has(user))
            this.users.addGrid(grid);
        else
            this._users.set(user, new User(u, grid));
    }

    getWordleWeek() {
        if (this._users.size == 0) {
            console.error("Unable to get week number if you have no weeks");
            return null
        }
        return this._users.getWordleWeek();
    }

    /**
     *@returns an iterator to cycle from the earliest days to the latest
     */
    dates() {
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

    /**
     * @returns an iterator to cycle through each user
     */
    users() {
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