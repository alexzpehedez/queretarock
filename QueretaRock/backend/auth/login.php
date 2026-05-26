<?php

session_start();

header("Content-Type: application/json");

require_once "../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$email    = $data["email"]    ?? '';
$password = $data["password"] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Campos vacíos"
    ]);
    exit;
}

$sql  = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {

    $user = $result->fetch_assoc();

    if (password_verify($password, $user["password"])) {

        $_SESSION["user_id"]  = $user["id"];
        $_SESSION["username"] = $user["username"];

        /* Devolvemos un objeto usuario completo para el localStorage */
        echo json_encode([
            "success" => true,
            "usuario" => [
                "id"       => $user["id"],
                "nombre"   => $user["username"],
                "apellido" => $user["apellido"]  ?? "",
                "email"    => $user["email"],
                "telefono" => $user["telefono"]  ?? ""
            ]
        ]);

    } else {
        echo json_encode([
            "success" => false,
            "message" => "Contraseña incorrecta"
        ]);
    }

} else {
    echo json_encode([
        "success" => false,
        "message" => "Usuario no encontrado"
    ]);
}
