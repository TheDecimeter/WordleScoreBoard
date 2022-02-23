//class to hold each grid
class Week {
    constructor(userData = null) {
        /** @type{Map<string,User>} */
        this._users = new Map();
        if (userData != null) {
            for (const u in userData)
                this._users.set(u, new User(u, userData[u]));
        }
    }

    getGridCount() {
        return 0;
    }

    addGrid(user, grid) {
        if (this._users.has(user))
            this._users.get(user).addGrid(grid);
        else
            this._users.set(user, new User(user, grid));
    }

    getWordleWeek() {
        if (this._users.size == 0) {
            console.error("Unable to get week number if you have no weeks");
            return null
        }
        for(const u of this._users.values())
            return u.getWordleWeek();

        console.error("no users to get wordle week from");
        return -1;
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