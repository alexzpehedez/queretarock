<?php
session_start();
header("Content-Type: application/json");
require_once "../config/database.php";

$data     = json_decode(file_get_contents("php://input"), true);
$id       = intval($data["id"]       ?? 0);
$username = trim($data["username"]   ?? '');
$apellido = trim($data["apellido"]   ?? '');
$telefono = trim($data["telefono"]   ?? '');

if (!$id || !$username) {
    echo json_encode(["success" => false, "message" => "Datos inválidos"]);
    exit;
}

$stmt = $conn->prepare(
    "UPDATE users SET username = ?, apellido = ?, telefono = ? WHERE id = ?"
);
$stmt->bind_param("sssi", $username, $apellido, $telefono, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Perfil actualizado"]);
} else {
    echo json_encode(["success" => false, "message" => "Error al actualizar"]);
}
