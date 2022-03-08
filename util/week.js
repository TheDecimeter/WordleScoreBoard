//class to hold each grid
class Week {
    constructor(days = null) {
        //user data is a list of days, each data has users keyed to grids

        /** @type{Map<string,User>} */
        this._users = new Map();
        // if (userData != null) {
        //     for (const u in userData)
        //         this._users.set(u, new User(u, userData[u]));
        // }

        /** @type{Map<string,string[]>} */
        let grids = new Map();
        for (const dayObj of days) {
            for (const day in dayObj) {
                for (const user of dayObj[day]) {
                    for (const userName in user) {
                        if (!grids.has(userName))
                            grids.set(userName, []);
                        grids.get(userName).push(user[userName]);
                        // this._users.set(user, userGrid[user]);
                        break;
                    }
                }
                break;
            }
        }

        for (const user of grids) {
            this._users.set(user[0], new User(user[0], user[1]));
        }
    }

    getGridCount() {
        let r = 0;
        for (const user of this.users())
            r += user.grids().length;
        return r;
    }

    addGrid(user, grid) {
        if (this._users.has(user))
            this._users.get(user).addGrid(grid);
        else {
            const u = new User(user, grid)
            this._users.set(u.user(), u);
        }
        return this._users.get(user);
    }

    averageScore() {
        if (this._users.size == 0)
            return 0;
        let score = 0;
        let count = 0;
        for (const user of this._users.values()) {
            score += user.totalScore();
            count += user.grids().length;
        }
        if (count == 0)
            return 0;
        return score / count;
    }

    latestDay() {
        let day = Number.MIN_SAFE_INTEGER;
        for (const user of this._users.values())
            if (user.latestDay() > day)
                day = user.latestDay();
        return day;
    }

    getWordleWeek() {
        if (this._users.size == 0) {
            console.error("Unable to get week number if you have no weeks");
            return null
        }
        for (const u of this._users.values()) {
            console.log(u)
            return u.getWordleWeek();
        }

        console.error("no users to get wordle week from");
        return -1;
    }

    /**
     * @returns an iterator to cycle through each user
     */
    users() {
        let i = 0;
        let users = Array.from(this._users.values());
        users.sort((a, b) => a.compare(b));
        console.log("creating users from ");
        console.log(this._users);
        console.log("creating users ");
        console.log(users);
        //TODO sort by name
        return {
            length: users.length,
            next: function () {
                i++;
                return {
                    done: i > users.length,
                    value: users[i - 1]
                }
            },
            [Symbol.iterator]: function () {
                return this;
            }
        }
    }
}