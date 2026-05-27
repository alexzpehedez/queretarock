<?php
/**
 * register.php — Registro de usuario
 * FIX: guarda apellido + ruta robusta a database.php
 */

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

// register.php está en backend/auth/ → config en backend/config/
$possiblePaths = [
    __DIR__ . '/../config/database.php',
    dirname(__DIR__) . '/config/database.php',
];
$dbPath = null;
foreach ($possiblePaths as $p) {
    if (file_exists($p)) { $dbPath = $p; break; }
}
if (!$dbPath) {
    echo json_encode(['success' => false, 'message' => 'No se encontró database.php']);
    exit;
}
require_once $dbPath;

$data     = json_decode(file_get_contents('php://input'), true);
$username = trim($data['username'] ?? '');
$apellido = trim($data['apellido'] ?? '');
$email    = trim($data['email']    ?? '');
$password =      $data['password'] ?? '';

if (empty($username) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Campos vacíos']);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'La contraseña debe tener al menos 6 caracteres']);
    exit;
}

// Email duplicado
$check = $conn->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
$check->bind_param('s', $email);
$check->execute();
$check->store_result();
if ($check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'El correo ya está registrado']);
    exit;
}
$check->close();

$hash = password_hash($password, PASSWORD_BCRYPT);

// Intentar con apellido; si la columna no existe, sin ella
$stmt = $conn->prepare('INSERT INTO users (username, apellido, email, password) VALUES (?, ?, ?, ?)');
if ($stmt) {
    $stmt->bind_param('ssss', $username, $apellido, $email, $hash);
} else {
    $stmt = $conn->prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)');
    $stmt->bind_param('sss', $username, $email, $hash);
}

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Usuario registrado correctamente']);
} else {
    echo json_encode(['success' => false, 'message' => 'Error al registrar: ' . $conn->error]);
}
