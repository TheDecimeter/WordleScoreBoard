<?php
include_once "tools.php";
$m = new \stdClass();
$m->msgs = [setData()];
echo json_encode($m);