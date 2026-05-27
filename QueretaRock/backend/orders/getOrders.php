<?php
/**
 * getOrders.php — Historial de compras de un usuario
 * RUTA: backend/orders/getOrders.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Localizar database.php de forma robusta — __DIR__ = .../backend/orders
$possiblePaths = [
    __DIR__ . '/../config/database.php',
    dirname(__DIR__) . '/config/database.php',
    __DIR__ . '/../../backend/config/database.php',
];

$dbPath = null;
foreach ($possiblePaths as $p) {
    if (file_exists(realpath($p) ?: $p)) {
        $dbPath = $p;
        break;
    }
}

if (!$dbPath) {
    echo json_encode([
        'success' => false,
        'message' => 'No se encontró database.php',
        'debug'   => ['__DIR__' => __DIR__, 'tried' => $possiblePaths]
    ]);
    exit;
}

require_once $dbPath;

if (!isset($conn)) {
    echo json_encode(['success' => false, 'message' => 'Variable $conn no definida']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
$id   = isset($data['usuario_id']) ? intval($data['usuario_id']) : 0;

if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID inválido', 'raw' => $raw]);
    exit;
}

// Si la tabla no existe aún, devolver vacío sin error
$tableCheck = $conn->query("SHOW TABLES LIKE 'orders'");
if (!$tableCheck || $tableCheck->num_rows === 0) {
    echo json_encode(['success' => true, 'orders' => []]);
    exit;
}

$stmt = $conn->prepare(
    'SELECT
        o.id           AS order_id,
        o.total,
        o.status,
        o.payment_method,
        o.created_at,
        oi.product_id,
        oi.product_name,
        oi.product_image,
        oi.price,
        oi.quantity
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     WHERE o.usuario_id = ?
     ORDER BY o.created_at DESC, o.id DESC, oi.id ASC'
);

if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Error prepare: ' . $conn->error]);
    exit;
}

$stmt->bind_param('i', $id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $oid = $row['order_id'];
    if (!isset($orders[$oid])) {
        $orders[$oid] = [
            'id'             => (int)   $oid,
            'total'          => (float) $row['total'],
            'status'         => $row['status']         ?? 'paid',
            'payment_method' => $row['payment_method'] ?? 'card',
            'created_at'     => $row['created_at'],
            'items'          => []
        ];
    }
    $orders[$oid]['items'][] = [
        'product_id'    => (int)   $row['product_id'],
        'product_name'  => $row['product_name'],
        'product_image' => $row['product_image'],
        'price'         => (float) $row['price'],
        'quantity'      => (int)   $row['quantity']
    ];
}

echo json_encode(['success' => true, 'orders' => array_values($orders)]);
