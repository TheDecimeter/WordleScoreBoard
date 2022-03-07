<?php
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
