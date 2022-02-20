<!DOCTYPE html>
<html>
    <head>
        <title>
            Leader Board
</title>
<style>
    .cell {
        border: 1px solid black;
        border-radius: 10px;
        padding: 12px;
        min-width:120px;
        width:120px;
    }
    .boxM {
        background-color: white ;
        padding: 10px ;
        display: inline-block;
        border: 1px solid lightgray ;
        border-radius: 10%;
        margin: 1px;
    }
    .boxY {
        background-color: yellow ;
        padding: 10px ;
        display: inline-block;
        border: 1px solid black ;
        border-radius: 10%;
        margin: 1px;
    }
    .boxG {
        background-color: green ;
        padding: 10px ;
        display: inline-block;
        border: 1px solid black ;
        border-radius: 10%;
        margin: 1px;
    }
    .boxW {
        background-color: white ;
        padding: 10px ;
        display: inline-block;
        border: 1px solid black ;
        border-radius: 10%;
        margin: 1px;
    }
    .boxB {
        background-color: #222 ;
        padding: 10px ;
        display: inline-block;
        border: 1px solid black ;
        border-radius: 10%;
        margin: 1px;
    }
    </style>
    </head>
    <body>
        <br><br>
        <div>
            <form id="form">
            <b>Submit:</b> <br><br>
            <input name="user" id="user" placeholder="user name" type="text"><br>
            <textarea name="grid" id="grid" placeholder="paste grid here" cols="30" rows="10"></textarea><br>
            <input id="submitButton" type="button" value = "Submit" onclick="send()">
</form>
<br><br><br>
</div>
<h2>Score Board</h2>
        <div id="board">
            <table><tbody id="table"></tbody></table>
</div>
<script src="util/comm.js"></script>
<script src="util/grid.js"></script>
<script src="util/user.js"></script>
<script src="util/week.js"></script>
<script src="util/weekManager.js"></script>
<script src="util/main.js"></script>
<script>
    //set data
<?php
// set array to data
include_once "tools.php";
echo "var jsonData = " . json_encode(getData()) . ";";
?>
//parse json, go through girds, set name and date
console.log(jsonData.to);
// updateBoard(jsonData.msg);
var ScoreBoard = new WeekManager(jsonData.msg, document.getElementById("table"));
    </script>
</body>
    </html>
