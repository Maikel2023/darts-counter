<?php



$ret = new stdClass();

class Timer
{
    private $timeLeft;
    private $startTime;
    private $status;

    public function __construct($startTime)
    {
        $timeLeftFile = "timeleft.txt";
        if (file_exists($timeLeftFile)) {
            $this->timeLeft = (INT) file_get_contents($timeLeftFile);
        } else {
            $this->timeLeft = $startTime;
        }
        $statusFile = "timerstatus.txt";
        if (file_exists($statusFile)) {
            $this->status = file_get_contents($statusFile);
        } else {
            $this->status = "stopped";
        }
        $startTimeFile = "starttime.txt";
        if (file_exists($startTimeFile)) {
            $this->startTime = (INT) file_get_contents($startTimeFile);
        }
    }

    private function saveTimeLeft($timeLeft)
    {
        $this->timeLeft = $timeLeft;
        file_put_contents("timeleft.txt", $timeLeft);
    }

    public function reset()
    {
        $this->stop();
        $this->saveTimeLeft(100 * 60 * 60);
    }

    public function start()
    {
        $this->saveStatus("running");
        $startTimeFile = "starttime.txt";
        file_put_contents($startTimeFile, time());
    }

    public function stop()
    {
        $this->saveStatus("stopped");
        $startTimeFile = "starttime.txt";
        $startTime = (INT) file_get_contents($startTimeFile);

        $runningTime = time() - $startTime;
        $this->saveTimeLeft($this->timeLeft - $runningTime);
    }

    public function getStatus()
    {
        return $this->status;
    }

    public function saveStatus($status)
    {
        $timerStatusFile = "timerstatus.txt";
        $this->status = file_put_contents($timerStatusFile, $status);
    }

    public function isRunning()
    {
        if ($this->status == "running") {
            return true;
        }
        return false;
    }

    public function getTimeLeft()
    {
        if ($this->status == "running") {
            return $this->timeLeft - (time() - $this->startTime);
        }
        return $this->timeLeft;
    }
}

if (isset($_POST["ajax"]) && $_POST["ajax"] == "1") {
    $json = $_POST["data"] ?? "{}";
    $data = json_decode($json);

    $timer = new Timer(100 * 60 * 60);


    if (isset($data->action) && $data->action == "start") {
        if (!$timer->isRunning() && ($timer->getTimeLeft() > 0)) {
            $timer->start();
            $ret->status = "running";
            $ret->timeLeft = $timer->getTimeLeft();
        } else {
            $ret->message = "De timer is al bezig of de tijd is op";
        }
    }

    if (isset($data->action) && $data->action == "end") {
        if ($timer->isRunning()) {
            $timer->stop();
            $ret->status = "stopped";
            $ret->timeLeft = $timer->getTimeLeft();
        } else {
            $ret->message = "De timer is al gestopt!";
        }
    }

    if (isset($_POST["reset"]) && $_POST["reset"] == "1") {
        $timer->reset();
        $ret->status = "stopped";
        $ret->timeLeft = $timer->getTimeLeft();
    }


    if (isset($_POST["loadTimer"]) && $_POST["loadTimer"] == "1") {
        $ret->timeLeft = $timer->getTimeLeft();
        $ret->status = $timer->getStatus();
    }

}

header("Content-type: application/json; charset=utf-8");
echo json_encode($ret);