<?php

$host = "127.0.0.1";
$user = "root";
$password = "";
$database = "queretarock";
$port = 3306;

$conn = new mysqli(
    $host,
    $user,
    $password,
    $database,
    $port
);

if($conn->connect_error){

    die("Error de conexión: "
    . $conn->connect_error);
}
?>