<?php

header("Content-Type: application/json");

require_once "../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"];
$email = $data["email"];
$password = $data["password"];

if(
    empty($username) ||
    empty($email) ||
    empty($password)
){

    echo json_encode([
        "success" => false,
        "message" => "Campos vacíos"
    ]);

    exit;
}

$hashedPassword =
password_hash($password, PASSWORD_BCRYPT);

$sql = "INSERT INTO users
(username,email,password)
VALUES (?,?,?)";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "sss",
    $username,
    $email,
    $hashedPassword
);

if($stmt->execute()){

    echo json_encode([
        "success" => true,
        "message" => "Usuario registrado"
    ]);

}else{

    echo json_encode([
        "success" => false,
        "message" => "Error al registrar"
    ]);
}
