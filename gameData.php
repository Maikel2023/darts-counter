<?php

$ret = new stdClass();

class gameData
{
    public function __construct()
    {

    }

    public function storeScore($gameData)
    {
        $scoreFile = "score.txt";
        file_put_contents($scoreFile, $gameData);
    }

    public function getScore()
    {
        $scoreFile = "score.txt";
        return file_get_contents($scoreFile);
    }

    public function storeAverageScore($averageScore)
    {
        $averageScoreFile = "averagescore.txt";
        file_put_contents($averageScoreFile, $averageScore);
    }

    public function getAverageScore()
    {
        $averageScoreFile = "averagescore.txt";
        return file_get_contents($averageScoreFile);
    }

    public function storeScoreArray($scoreArray)
    {
        $scoreArrayFile = "scorearray.txt";
        file_put_contents($scoreArrayFile, json_encode($scoreArray));
    }

    public function getScoreArray()
    {
        $scoreArrayFile = "scorearray.txt";
        return file_get_contents($scoreArrayFile);
    }

}

if (isset($_POST["ajax"]) && $_POST["ajax"] == "1") {
    $json = $_POST["data"] ?? "{}";
    $data = json_decode($json);

    $gameData = new gameData();

    if (isset($data->totalScore)) {
        $gameData->storeScore($data->totalScore);

        $ret->score = $gameData->getScore();
    }

    if (isset($data->averageScore)) {
        $gameData->storeAverageScore($data->averageScore);

        $ret->averageScore = $gameData->getAverageScore();
    }

    if (isset($data->scoreArray)) {
        $gameData->storeScoreArray($data->scoreArray);

        $ret->scoreArray = $gameData->getScoreArray();
    }

    if (isset($_POST["loadScore"])) {
        $ret->score = $gameData->getScore();
        $ret->averageScore = $gameData->getAverageScore();
        $ret->scoreArray = $gameData->getScoreArray();
    }

}
header("Content-type: application/json; charset=utf-8");
echo json_encode($ret);

?>