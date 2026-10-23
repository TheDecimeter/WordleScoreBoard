<!DOCTYPE html>
<html>

<head>
    <title>
        Leader Board
    </title>
    <link rel="stylesheet" href="styles.css">
</head>

<body>
    <br><br>
    <span id="preInstruction"></span>
    <div>
        <form id="form">
            <b>Submit:</b> <br><br>
            <input name="user" id="user" placeholder="user name" type="text"><br>
            <textarea name="grid" id="grid" placeholder="paste grid here" cols="30" rows="10"></textarea><br>
            <input id="submitButton" type="button" value="Submit" onclick="ScoreBoard.addGrid('user','grid')">
            <input id="deleteButton" type="button" value="">

            <br><br>


        </form>
        <br><br><br>
    </div>

    <span id="postInstruction"></span>

    <div class = "header">
    <span class="title">Score Board</span>
    <span class ="pages">
    <input id="prevButton" type="button" value="<" onclick="ScoreBoard.queryForBoard(-1)">
            <span id ="weekDisplay"></span>
            <input id="nextButton" type="button" value=">" onclick="ScoreBoard.queryForBoard(1)">
    </span>
    </div>
    <br><br>
    <div id="board">
        <table>
            <tbody id="table"></tbody>
        </table>
    </div>
    <script src="values.js"></script>
    <script src="util/comm.js"></script>
    <script src="util/cmnt.js"></script>
    <script src="util/grid.js?7"></script>
    <script src="util/user.js?7"></script>
    <script src="util/week.js?7"></script>
    <script src="util/weekManager.js?7"></script>
    <script src="util/util.js?7"></script>
    <script>

        //set data
        console.log("start");
        <?php
// set array to data
include_once "tools.php";

//if you see PHP errors here, you may need to remove h.txt from /grids
$deleteDelay = strval(floor(getDeleteDelay() / 2));
$expectedVersion = strval(getExpectedVersion());
$thisWeek = getRecentWeek();
$weekData = getWeek($thisWeek, 0);
$thisWeekJSON = json_encode($weekData);
$onlyOneDay = count($weekData->msg) < 2;
$lastWeek = getWeekBefore($thisWeek);
$lastWeekJSON = json_encode(getWeek($lastWeek, 0));

echo "</script>\n<script>\n";

echo "const deleteDelay = " . $deleteDelay . ";\n";
echo "const expectedVersion = " . $expectedVersion . ";\n";
echo "const thisWeek = " . $thisWeekJSON . ";\n";

if ($onlyOneDay) {
    echo "const lastWeek = " . $lastWeekJSON . ";\n";
} else {
    echo "const lastWeek = null;\n";
}
?>
        //parse json, go through girds, set name and date
        console.log("data");
        console.log(thisWeek);
        console.log(lastWeek);
        
        ScoreBoard = new WeekManager(expectedVersion, thisWeek, lastWeek,
         document.getElementById("table"),
         document.getElementById("weekDisplay"),
         document.getElementById("submitButton"),
         document.getElementById("prevButton"),
         document.getElementById("nextButton"),
         document.getElementById("deleteButton"),
         deleteDelay);


         function process(event){
            const selectedFiles = [...event.target.files];
  console.log(selectedFiles);


for(const file of selectedFiles){
  const reader = new FileReader();
  reader.addEventListener('load', (event) => {
    console.log(" name "+reader.xFileName);
    console.log(" text "+User.DECODE(event.target.result));
    download(User.DECODE(event.target.result), reader.xFileName)
  });

  reader.xFileName = file.name;
  reader.readAsText(file);
}

        }

        function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}


    </script>
</body>

</html>