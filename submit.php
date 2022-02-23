<?php
include_once "tools.php";
$m = new \stdClass();
$m->msgs = [saveGrid()];
echo json_encode($m);
