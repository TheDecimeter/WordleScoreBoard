//class to hold each grid


class Week {
    /**
     * @param {WeekResponse | null} days
     */
    constructor(days = null) {
        //user data is a list of days, each data has users keyed to grids

        /** @type{Map<string,User>} */
        this._users = new Map();
        // if (userData != null) {
        //     for (const u in userData)
        //         this._users.set(u, new User(u, userData[u]));
        // }

        /** @type{Map<string, UserStruct>} */
        let grids = new Map();
        if (days != null)
            for (const dayObj of days) {
                /** @type{CommentResponse[]} */
                let comments = dayObj.comments || [];
                for (const day in dayObj) {
                    if (day != "comments")
                        for (const user of dayObj[day]) {
                            for (const userName in user) {
                                const userName_lower = userName.toLowerCase();
                                const userName_normalized = User.UNIFORM(userName);
                                if (!grids.has(userName_normalized))
                                    grids.set(userName_normalized, { user: userName, days: [] });

                                grids.get(userName_normalized).days.push({ grid: user[userName], day: day, comments: usersComments(userName_lower, comments) });
                                break;
                            }
                        }
                }
            }

        for (const user of grids.values()) {
            const u = new User(user);
            this._users.set(u.user(), u);
        }
    }

    getGridCount() {
        let r = 0;
        for (const user of this.users())
            r += user.grids().length;
        return r;
    }

    /**
     * 
     * @param {string} user 
     * @param {string} grid 
     * @returns 
     */
    addGrid(user, grid) {
        const uStruct = {
            user: user,
            days: [{
                comments: /**@type{CommentResponse[]}*/([]),
                grid: grid,
                day: "" + Grid.WORDLE_FROM_DATE()
            }]
        }
        const u = new User(uStruct)
        if (this._users.has(u.user()))
            this._users.get(u.user()).addGrid(grid);
        else {
            this._users.set(u.user(), u);
        }
        return this._users.get(u.user());
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
        for (const user of this._users.values()) {
            const latest = user.latestDay();
            if (latest > day)
                day = latest;
        }
        return day;
    }

    getWordleWeek() {
        if (this._users.size == 0) {
            console.error("Unable to get week number if you have no weeks");
            return -1
        }
        for (const u of this._users.values()) {
            console.log(u)
            return u.getWordleWeek();
        }

        console.error("no users to get wordle week from");
        return -1;
    }

    userLength() {
        return this._users.size;
    }
    /**
     * @returns {Iterable<User>} an iterator to cycle through each user
     */
    users() {
        let i = 0;
        let users = Array.from(this._users.values());
        users.sort((a, b) => a.compare(b));
        console.log("creating users from ");
        console.log(this._users);
        console.log("creating users ");
        console.log(users);
        return {
            [Symbol.iterator]() {
                return {
                    next() {
                        i++;
                        return {
                            done: i > users.length,
                            value: users[i - 1]
                        };
                    }
                }
            }
        }
    }
}