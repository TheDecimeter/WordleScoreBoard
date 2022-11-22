<?php

function getExpectedVersion()
{
    return 5;
}

function getNextWeek()
{
    $week = getWeekAfter($_POST["week"]);
    $count = 0;
    if (isset($_POST["count"])) {
        if ($week == intval($_POST["nweek"])) {
            $count = $_POST["count"];
        }

    }
    $r = new \stdClass();
    $r->to = "client";
    $r->msg = getWeek($week, $count);
    return $r;
}
function getPrevWeek()
{
    $week = getWeekBefore($_POST["week"]);
    $count = 0;
    if (isset($_POST["count"])) {
        if ($week == intval($_POST["nweek"])) {
            $count = $_POST["count"];
        }

    }
    $r = new \stdClass();
    $r->to = "client";
    $r->msg = getWeek($week, $count);
    return $r;
}
function getWeek($week, $count)
{
    $path = "grids/$week";
    $r = new \stdClass();
    $r->msg = [];
    $r->count = countFiles($path);
    $r->to = "client";
    if ($week == null || !file_exists($path) || countFiles($path) == intval($count)) {
        return $r;
    }

    $it = new \FilesystemIterator($path, FilesystemIterator::SKIP_DOTS);
    foreach ($it as $day) {
        array_push($r->msg, getDay($week, $day->getFilename()));
    }

    return $r;
}

function getDay($week, $day)
{
    $r = new \stdClass();
    $r->$day = [];
    $path = "grids/$week/$day";
    $it = new \FilesystemIterator($path);
    foreach ($it as $file) {
        $f = $file->openFile("r");
        if (!$f) {
            continue;
        }

        if ($f->flock(LOCK_SH)) {
            $user = $file->getFilename();
            $g = new \stdClass();
            $g->$user = $f->fread($file->getSize());
            array_push($r->$day, $g);
            $f = null;
        }
    }
    return $r;
}

function getRecentWeek()
{
    $r = -1;
    $it = new \FilesystemIterator("grids/", FilesystemIterator::SKIP_DOTS);
    foreach ($it as $week) {
        $val = intval($it->getFilename());
        if ($val > $r) {
            $r = $val;
        }

    }
    if ($r == -1) {
        return null;
    }

    return strVal($r);
}

function getWeekBefore($fromWeek)
{
    $fromVal = intval($fromWeek);
    $r = strval($fromVal - 1);
    if (file_exists("grids/$r")) {
        return $r;
    }

    $r = -1;
    $it = new \FilesystemIterator("grids/", FilesystemIterator::SKIP_DOTS);
    foreach ($it as $week) {
        $val = intval($it->getFilename());
        if ($val < $fromVal && $val > $r) {
            $r = $val;
        }

    }
    if ($r == -1) {
        return null;
    }

    return strVal($r);
}

function getWeekAfter($fromWeek)
{
    $fromVal = intval($fromWeek);
    $r = strval($fromVal + 1);
    if (file_exists("grids/$r")) {
        return $r;
    }

    $r = PHP_INT_MAX;
    $it = new \FilesystemIterator("grids/", FilesystemIterator::SKIP_DOTS);
    foreach ($it as $week) {
        $val = intval($it->getFilename());
        if ($val > $fromVal && $val < $r) {
            $r = $val;
        }

    }
    if ($r == PHP_INT_MAX) {
        return null;
    }

    return strVal($r);
}

function getData()
{
    //go through all files and put contents of each file into an array (explode name for name of array)
    $r = new \stdClass();
    $r->to = "client";

    $grids = new \stdClass();

    $it = new \FilesystemIterator("grids/");
    foreach ($it as $file) {
        $f = $file->openFile("r");
        if (!$f) {
            continue;
        }

        if ($f->flock(LOCK_SH)) {
            $tokens = explode("-", $file->getFilename());
            $user = $tokens[0];
            $g = new \stdClass();
            $g->date = $tokens[1];
            $g->grid = $f->fread($file->getSize());

            if (isset($grids->$user)) {
                array_push($grids->$user, $g);
            } else {
                $grids->$user = [$g];
            }
            $f = null;
        }
    }
    $r->msg = $grids;
    return $r;
}

function errCheck()
{
    $user = $_POST["user"];
    $grid = $_POST["grid"];

    if ($user == "") {
        $r = new \stdClass();
        $r->fail = true;
        $r->msg = "User name required";
        $r->to = "client";
        return $r;
    }
    if ($grid == "") {
        $r = new \stdClass();
        $r->fail = true;
        $r->msg = "grid required";
        $r->to = "client";
        return $r;
    }
    return null;
}

function countFiles($path)
{
    $size = 0;
    $ignore = array('.', '..');
    $files = scandir($path);
    foreach ($files as $t) {
        if (in_array($t, $ignore)) {
            continue;
        }

        if (is_dir(rtrim($path, '/') . '/' . $t)) {
            $size += countFiles(rtrim($path, '/') . '/' . $t);
        } else {
            $size++;
        }
    }
    return $size;
}

function saveGrid()
{
    $err = errCheck();
    if ($err != null) {
        return $err;
    }

    $day = $_POST["day"];
    $week = $_POST["week"];
    $user = strtolower($_POST["user"]);
    $grid = $_POST["grid"];
    $count = $_POST["count"];

    if (!file_exists(("grids/$week/$day"))) {
        mkdir("grids/$week/$day", 0777, true);
    }

    $name = "grids/$week/$day/$user";
    if (file_exists($name)) {
        err("on $day from " . $_SERVER['REMOTE_ADDR'] . " grid change was attempted for $user");
        $r = new \stdClass();
        $r->fail = true;
        $r->msg = "grid for today was already saved";
        $r->to = "client";
        return $r;
    }

    $f = fopen($name, "w");
    if (!$f) {
        $r = new \stdClass();
        $r->fail = true;
        $r->msg = "failed to open file to save grid";
        $r->to = "client";
        return $r;
    }
    if (flock($f, LOCK_EX)) {
        fwrite($f, $grid);
        fclose($f);
        $r = new \stdClass();
        $r->to = "client";
        $r->msg = getWeek($week, $count);
        return $r;
    }
    $r = new \stdClass();
    $r->fail = true;
    $r->msg = "failed to achieve lock on file to save grid";
    $r->to = "client";
    return $r;
}

function setData()
{
    $day = $_POST["date"];
    $user = strtolower($_POST["user"]);
    $grid = $_POST["grid"];
    if ($user == "machine") {
        err("on $day from " . $_SERVER['REMOTE_ADDR'] . " attempted to upload machine grid");
        $r = new \stdClass();
        $r->fail = true;
        $r->msg = "From one machine to another... you seem more HUMAN than RO-MAN!!!";
        $r->to = "client";
        return $r;
    }
    if ($user == "") {
        $r = new \stdClass();
        $r->fail = true;
        $r->msg = "User name required";
        $r->to = "client";
        return $r;
    }
    if ($grid == "") {
        $r = new \stdClass();
        $r->fail = true;
        $r->msg = "grid required";
        $r->to = "client";
        return $r;
    }

    if ($user == "**mm") {
        $user = "MACHINE";
    }

    $name = "grids/$user-$day";
    if (file_exists($name)) {
        err("on $day from " . $_SERVER['REMOTE_ADDR'] . " grid change was attempted for $user");
        $r = new \stdClass();
        $r->fail = true;
        $r->msg = "grid for today was already saved";
        $r->to = "client";
        return $r;
    }

    $f = fopen($name, "w");
    if (!$f) {
        $r = new \stdClass();
        $r->fail = true;
        $r->msg = "failed to open file to save grid";
        $r->to = "client";
        return $r;
    }
    if (flock($f, LOCK_EX)) {
        fwrite($f, $grid);
        fclose($f);
        $r = new \stdClass();
        $r->msg = getData();
        $r->to = "client";
        return $r;
    }
    $r = new \stdClass();
    $r->fail = true;
    $r->msg = "failed to achieve lock on file to save grid";
    $r->to = "client";
    return $r;
    //save data to a file for today's date
    //if the date already exists, send error back
    //save file "user_day"
    // be sure to adjust special name, and return error if someone tries using "machine" as a name
}

function err($msg)
{
    $name = "err/" . time() . "-" . random_int(1, 10000);
    $f = fopen($name, "w");
    if ($f && flock($f, LOCK_EX)) {
        fwrite($f, $msg);
        fclose($f);
    }
}
