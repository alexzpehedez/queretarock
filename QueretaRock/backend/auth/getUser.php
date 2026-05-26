<?php
session_start();
header("Content-Type: application/json");
require_once "../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);
$id   = intval($data["id"] ?? 0);

if (!$id) {
    echo json_encode(["success" => false, "message" => "Sin sesión"]);
    exit;
}

$stmt = $conn->prepare(
    "SELECT id, username, email, apellido, telefono, created_at FROM users WHERE id = ?"
);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Usuario no encontrado"]);
    exit;
}

$user = $result->fetch_assoc();
echo json_encode(["success" => true, "usuario" => $user]);
