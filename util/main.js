//set up initial data on the board
//wrap send function

const yer = 0;
const mon = 1;
const day = 2;

function encode(val) {
    let r = encodeURI(val).replaceAll("-", "%2d");
    r = r.replaceAll("=", "%3d");
    r = r.replaceAll("?", "%3f");
    r = r.replaceAll("&", "%26");
    r = r.replaceAll(";", "%3b");
    return r.replaceAll("/", "%2f");
}

function decode(val) {
    let r = val.replaceAll("%2f", "/");
    r = r.replaceAll("%2d", "-");
    r = r.replaceAll("%3d", "=");
    r = r.replaceAll("%3f", "?");
    r = r.replaceAll("%26", "&");
    r = r.replaceAll("%3b", ";");
    return decodeURI(r);
}

function send() {
    const user = document.getElementById("user").value;
    if (user.length > 0)
        localStorage.setItem('username', user);

    document.getElementById("submitButton").disabled = true;
    console.log("send");
    let form = new FormData();
    let dateStr = dateUgly();

    form.append("user", encode(user));
    form.append("grid", encode(document.getElementById("grid").value));
    form.append("date", dateStr);

    Comm.Send("set", form).then(
        (d) => {
            console.log("success data sent " + JSON.stringify(d.msgs[0].msg.msg));
            updateBoard(d.msgs[0].msg.msg);
            document.getElementById("submitButton").disabled = false;

            //{"msgs":[{"msg":{"to":"client","msg":{"dantest":[{"date":"2022_0_30","grid":"Wordle%20225%203\/6%0A%0A%E2%AC%9C%E2%AC%9C%F0%9F%9F%A9%F0%9F%9F%A8%E2%AC%9C%0A%E2%AC%9C%E2%AC%9C%E2%AC%9C%E2%AC%9C%E2%AC%9C%0A%F0%9F%9F%A9%F0%9F%9F%A9%F0%9F%9F%A9%F0%9F%9F%A9%F0%9F%9F%A9"}]}},"to":"client"}]}
        },
        (d) => {
            console.error("data failed to send " + d);
            let msg = "unknown error";
            if (d.msgs !== undefined) {
                if (d.msgs[0] !== undefined)
                    if (d.msgs[0].msg !== undefined)
                        msg = d.msgs[0].msg;
            }
            else if (d.msg != undefined)
                msg = d.msg;
            alert(msg);
            document.getElementById("submitButton").disabled = false;
        }
    )
}

function updateBoard(grids) {
    //clear table of all rows
    const table = document.getElementById("table");
    while (table.firstChild)
        table.removeChild(table.lastChild);

    //sort grids by date
    let users = [];
    for (const userGridList in grids) {
        grids[userGridList].sort((a, b) => dateSorter(a.date, b.date));
        users.push(userGridList);
    }
    users.sort(nameSorter);

    //get list of dates
    let dateSet = new Set();
    for (const userGridList in grids) {
        for (const grid of grids[userGridList]) {
            dateSet.add(grid.date);
        }
    }

    let dates = new Array();
    dateSet.forEach((e) => { dates.push(e) });
    dates.sort(dateSorter);
    let talleyScores = dates.length >= 5 ? 1 : 0;
    let scores = [];
    const avgScore = scoreAvgAll(grids);
    let keyUser = getKeyUser(users);
    if (talleyScores == 1) {
        for (let user of users)
            scores.push(getUserScore(grids[user], dates.length, avgScore));
    }
    console.log("key user " + keyUser);
    console.log(scores);

    let pastDate = talleyScores;
    const now = dateUgly();
    for (let date of dates)
        if (now == date)
            pastDate = false;

    //create empty table
    for (let y = -1; y < users.length; ++y) {
        const row = document.createElement("TR");
        table.appendChild(row);
        for (let x = -1; x < dates.length + talleyScores; ++x) {
            const cell = document.createElement("TD");
            cell.id = cellID(x, y);
            if (x > -1 && y > -1)
                cell.className = "cell";
            row.appendChild(cell);
        }
    }

    //fill dates
    for (let x = 0; x < dates.length; ++x)
        document.getElementById(cellID(x, -1)).innerHTML = datePrint(dates[x]);

    //fill names
    for (let y = 0; y < users.length; ++y)
        document.getElementById(cellID(-1, y)).innerHTML = namePrint(users[y]);

    //fill grids
    for (let y = 0; y < users.length; ++y) {
        const user = users[y];
        let userGrid = 0;
        let played = false;
        for (let x = 0; x < dates.length; ++x) {
            if ((userGrid < grids[user].length)) {
                const grid = grids[user][userGrid];
                const currentDate = datePrint(grid.date);
                if (document.getElementById(cellID(x, -1)).innerHTML == currentDate) {
                    document.getElementById(cellID(x, y)).innerHTML = gridPrint(grid.grid)
                    userGrid++;
                    played = true;
                    continue;
                }
            }
            if ((pastDate || x < dates.length - 1))
                document.getElementById(cellID(x, y)).innerHTML = skip(avgScore)

        }
    }

    //fill scores
    if (talleyScores)
        for (let y = 0; y < users.length; ++y) {

            const grid = grids[users[y]];


            if (pastDate)
                console.log("past date true ")
            if (grid[grid.length - 1].date == dates[dates.length - 1])
                console.log("last user true")
            if (pastDate || grid[grid.length - 1].date == dates[dates.length - 1]) {
                document.getElementById(cellID(dates.length, y)).innerHTML = scores[y];

            }
        }
}

const SkipWords = ["Forgottle", "Skipple", "Wontle", "Whatle?", "Sleeple", "Outle", "Missle"];

function drawGrid(score, chars = ["⬜"]) {
    const fullLines = Math.floor(score);
    const partialLine = Math.floor((score - fullLines) * 5);
    let charCount = 0;

    const char = () => {
        charCount++;
        return chars[charCount % chars.length];
    }

    let grid = "";
    for (let line = 0; line < fullLines; ++line)
        grid += char()+char()+char()+char()+char()+"<BR>";
    for (let c = 0; c < partialLine; ++c)
        grid += char();
    return grid;
}

function skip(avgScore) {
    const fullLines = Math.floor(avgScore);
    const partialLine = Math.floor((avgScore - fullLines) * 5);

    grid = drawGrid(avgScore).replaceAll("⬜", "<span class = 'boxM'></span>");

    return SkipWords[Math.floor(Math.random() * SkipWords.length)] + "&nbsp;" + avgScore.toFixed(2) + "/6<BR>" + grid;
}


function score(grid) {
    const v = grid.split("/")[0].split(" ");
    const n = v[v.length - 1];
    if (n.toLowerCase() == "x")
        return 7;
    const r = parseInt(n);
    // const r = parseInt(grid.split("/")[0].match(/\d+/g)[1]);
    if (isNaN(r))
        return 0;
    return r;
}

function scoreAvgAll(grids) {
    let r = 0;
    let n = 0;
    for (const user in grids)
        for (const grid of grids[user]) {
            r += score(decode(grid.grid));
            n++;
        }
    return r / n;
}

function getKeyUser(users) {
    for (let i = 0; i < users.length; ++i)
        if (users[i] == "MACHINE")
            return i;
    return -1;
}
function getUserScore(grids, length, avg) {
    let r = 0;
    for (let grid of grids)
        r += score(decode(grid.grid));
    const userScore = ((r + avg * (length - grids.length)) / length);
    return userScore.toFixed(2);

}

function img(src) {
    return "<img style = 'border-radius:10%;width:100%' src='" + src + "' alt='" + src + "'>";
}

function cellID(x, y) {
    return "cell" + x + "," + y;
}

function dateSorter(a, b) {
    let dateA = a.split("_");
    let dateB = b.split("_");
    for (let i = 0; i < 3; ++i) {
        dateA[i] = parseInt(dateA[i]);
        dateB[i] = parseInt(dateB[i]);
    }
    if (dateA[yer] != dateB[yer])
        return dateA[yer] - dateB[yer];
    if (dateA[mon] != dateB[mon])
        return dateA[mon] - dateB[mon];
    return dateA[day] - dateB[day];
}

function nameSorter(a, b) {
    let aa = decode(a);
    let bb = decode(b);
    if (aa == "MACHINE")
        return -1;
    if (bb == "MACHINE")
        return 1;

    return aa.localeCompare(bb);
}

function namePrint(name) {
    let n = decode(name);
    if (n.length == 0)
        return "";
    n = n.toLowerCase();
    if (n == "machine") {
        if (getUser() == "rachael")
            return "<span style='color:darkgray;font-size:160%;'><i>Machina</i></span>";
        else
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
    return "<b>" + r + "</b>";
}

function gridPrint(grid) {
    let g = decode(grid);
    g = g.replaceAll("\n", "<BR>");
    g = uniformColor(g);
    return g;
}

function datePrint(date) {
    const parts = date.split("_");
    return "<b>" + parts[day] + " / " + month(parts[mon]) + " / " + parts[yer] + "</b>";
}

function dateUgly() {
    let date = new Date();
    return "" + date.getFullYear() + "_" + date.getMonth() + "_" + date.getDate();
}


function uniformColor(grid) {
    let r = grid.replaceAll("🟨", "<span class = 'boxY'></span>");
    r = r.replaceAll("⬜", "<span class = 'boxW'></span>");
    r = r.replaceAll("🟩", "<span class = 'boxG'></span>");
    r = r.replaceAll("⬛", "<span class = 'boxW'></span>");
    return r;
}

function month(val) {
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

function getUser() {
    const n = localStorage.getItem('username');
    if (n == null)
        return document.getElementById("user").value.toLowerCase();
    return n.toLowerCase();
}