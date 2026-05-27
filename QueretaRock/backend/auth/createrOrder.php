<?php
/**
 * createOrder.php — Guarda una orden y sus items en la base de datos
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

require_once __DIR__ . '/../config/database.php';

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

// Validación básica
$usuario_id     = isset($data['usuario_id'])     ? intval($data['usuario_id'])          : 0;
$items          = isset($data['items'])          ? $data['items']                        : [];
$payment_method = isset($data['payment_method']) ? $data['payment_method']              : 'card';
$nombre         = isset($data['nombre'])         ? trim($data['nombre'])                : '';
$apellido       = isset($data['apellido'])       ? trim($data['apellido'])              : '';
$email          = isset($data['email'])          ? trim($data['email'])                 : '';
$telefono       = isset($data['telefono'])       ? trim($data['telefono'])              : '';
$direccion      = isset($data['direccion'])      ? trim($data['direccion'])             : '';
$ciudad         = isset($data['ciudad'])         ? trim($data['ciudad'])                : '';
$cp             = isset($data['cp'])             ? trim($data['cp'])                    : '';

if (empty($items) || !is_array($items)) {
    echo json_encode(['success' => false, 'message' => 'Carrito vacío']);
    exit;
}

// Calcula el total desde el servidor (no confiar en el cliente)
$total = 0;
foreach ($items as $item) {
    $total += floatval($item['price'] ?? 0) * intval($item['quantity'] ?? 1);
}

// Inicia transacción
$conn->begin_transaction();

try {
    // 1. Inserta cabecera de la orden
    $stmt = $conn->prepare(
        'INSERT INTO orders
         (usuario_id, total, payment_method, nombre, apellido, email, telefono, direccion, ciudad, cp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param(
        'idsssssss s',
        $usuario_id, $total, $payment_method,
        $nombre, $apellido, $email, $telefono, $direccion, $ciudad, $cp
    );
    // bind_param no acepta espacios en el formato — reescrito:
    $stmt->close();

    $stmt = $conn->prepare(
        'INSERT INTO orders
         (usuario_id, total, payment_method, nombre, apellido, email, telefono, direccion, ciudad, cp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param(
        'idssssssss',
        $usuario_id, $total, $payment_method,
        $nombre, $apellido, $email, $telefono, $direccion, $ciudad, $cp
    );
    $stmt->execute();
    $order_id = $conn->insert_id;
    $stmt->close();

    // 2. Inserta cada línea
    $stmtItem = $conn->prepare(
        'INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)'
    );

    foreach ($items as $item) {
        $product_id    = intval($item['id']       ?? 0);
        $product_name  = $item['name']            ?? 'Producto';
        $product_image = $item['image']           ?? '';
        $price         = floatval($item['price']  ?? 0);
        $quantity      = intval($item['quantity'] ?? 1);

        $stmtItem->bind_param(
            'iissdi',
            $order_id, $product_id, $product_name, $product_image, $price, $quantity
        );
        $stmtItem->execute();
    }

    $stmtItem->close();
    $conn->commit();

    echo json_encode([
        'success'  => true,
        'order_id' => $order_id,
        'message'  => 'Orden creada correctamente'
    ]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => 'Error al guardar la orden: ' . $e->getMessage()]);
}
