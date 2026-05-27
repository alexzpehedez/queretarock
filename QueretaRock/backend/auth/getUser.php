<?php
/**
 * getUser.php — Devuelve datos de un usuario por ID
 * IMPORTANTE: No debe haber NINGÚN output antes de header() ni echo json_encode()
 * La causa del error "Unexpected token '<'" es output HTML de PHP antes del JSON
 */

// Desactiva warnings/notices que se impriman en el body
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
$id   = isset($data['id']) ? intval($data['id']) : 0;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID inválido']);
    exit;
}

$stmt = $conn->prepare(
    'SELECT id, username, email, apellido, telefono, created_at
     FROM users
     WHERE id = ?
     LIMIT 1'
);

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Error preparando consulta']);
    exit;
}

$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Usuario no encontrado']);
    exit;
}

$user = $result->fetch_assoc();
echo json_encode([
    'success'  => true,
    'usuario'  => [
        'id'         => (int) $user['id'],
        'username'   => $user['username']   ?? '',
        'apellido'   => $user['apellido']   ?? '',
        'email'      => $user['email']      ?? '',
        'telefono'   => $user['telefono']   ?? '',
        'created_at' => $user['created_at'] ?? ''
    ]
]);
