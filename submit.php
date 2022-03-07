<?php
if (!isset($_GET["act"])) {
    return;
}

include_once "tools.php";
$m = new \stdClass();

if ($_GET["act"] == "save") {
    $m->msgs = [saveGrid()];
    echo json_encode($m);
}
if ($_GET["act"] == "next") {
    $m->msgs = [getNextWeek()];
    echo json_encode($m);
}
if ($_GET["act"] == "prev") {
    $m->msgs = [getPrevWeek()];
    echo json_encode($m);
}

