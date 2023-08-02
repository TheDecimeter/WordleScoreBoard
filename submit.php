<?php
if (!isset($_GET["act"])) {
    return;
}

include_once "tools.php";
$m = new \stdClass();

if ($_GET["act"] == "save") {
    $m->msgs = [saveGrid()];
    $m->version = getExpectedVersion();
    echo json_encode($m);
}
else if ($_GET["act"] == "next") {
    $m->msgs = [getNextWeek()];
    $m->version = getExpectedVersion();
    echo json_encode($m);
}
else if ($_GET["act"] == "prev") {
    $m->msgs = [getPrevWeek()];
    $m->version = getExpectedVersion();
    echo json_encode($m);
}
else if ($_GET["act"] == "delete") {
    $m->msgs = [deleteGrid()];
    $m->version = getExpectedVersion();
    echo json_encode($m);
}
