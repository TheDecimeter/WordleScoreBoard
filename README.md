# WordleScoreBoard

Extremely simple scoreboard I put together for family. 
It was a reasonable success so I figured I'd share it publicly incase anyone else wanted to use it on their own personal server. This is not meant for any wide spread use. 
There is no player validation built in. 
This is really only good for a local group of friends who trust each other.

Uses file system to store data, not a database. So any server with php should be able to handle this with next to no setup.

*This is meant to be on a secret url between yourself and your friends. But you may still wish to __disable PHP execution in the 'grids' folder if your server can execute non ".php" files__*.

Setup Steps:
- Delete the h.txt file from the grids folder
- OPTIONAL Create a values.js file (not needed for classic wordle).
  - This file can specify fields to anchor a score grid's data to the correct dates 
    - `window.firstDay` = a number indicating the first grid of a week (eg: `951`)
    - `window.firstDate` = a string representing the above number's date (eg: `"8/07/2023"`)
    - `window.timesPerDay` = a number representing the times per day the game is played (eg, Wordle would be `1`, Phrazle might be `2`)
    - `window.validateGrid` = a function returning true if a grid is valid. Two arguments are provided, the grid and the stats line. (eg, `(g,s) => !s.includes("Wordle");` would not submit a grid if it contains the word "Wordle" in it's stats line)
    - `window.gridClean` = a function to clean a cleaned up grid string (eg, `(g,s) => g.replace("\n#phrazle\n", "");` can remove some clutter from a phrazle grid)
  - There are also a couple ids easy to add to
    - `document.getElementById("preInstruction")` a span prior to the submit area
    - `document.getElementById("postInstruction")` a span after to the submit area

Example "values.js" for Phrazle Grids from https://solitaired.com/phrazle (NOTE: solitarid does not properly adjust with daylight savings time. So the below configuration will likely be incorrect)
```
window.firstDay = 951;
window.firstDate = "8/07/2023";
window.timesPerDay = 2;
document.title = "Phrazle Board"
/**
 * @param {string} grid - whole grid
 * @param {string} stats - stats line
 * @returns true if grid is to be submitted
 */
window.validateGrid = (grid, stats) => {
    if (stats.includes("Wordle"))
        return window.confirm("This might be a wordle grid, not Phrazle. Are you sure you wish to submit?");
    return true;
}
```
