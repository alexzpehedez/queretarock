<?php
/**
 * createOrder.php — Guarda una orden y sus items
 * RUTA: backend/orders/createOrder.php
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

// Localizar database.php de forma robusta
$possiblePaths = [
    __DIR__ . '/../config/database.php',
    dirname(__DIR__) . '/config/database.php',
];

$dbPath = null;
foreach ($possiblePaths as $p) {
    if (file_exists($p)) { $dbPath = $p; break; }
}

if (!$dbPath) {
    echo json_encode(['success' => false, 'message' => 'No se encontró database.php', 'debug' => __DIR__]);
    exit;
}

require_once $dbPath;

if (!isset($conn)) {
    echo json_encode(['success' => false, 'message' => '$conn no definida']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    exit;
}

$usuario_id     = isset($data['usuario_id'])     ? intval($data['usuario_id'])   : null;
$items          = isset($data['items'])          ? $data['items']                : [];
$payment_method = isset($data['payment_method']) ? trim($data['payment_method']) : 'card';
$nombre         = trim($data['nombre']    ?? '');
$apellido       = trim($data['apellido']  ?? '');
$email          = trim($data['email']     ?? '');
$telefono       = trim($data['telefono']  ?? '');
$direccion      = trim($data['direccion'] ?? '');
$ciudad         = trim($data['ciudad']    ?? '');
$cp             = trim($data['cp']        ?? '');

if (empty($items) || !is_array($items)) {
    echo json_encode(['success' => false, 'message' => 'Carrito vacío']);
    exit;
}

// Calcular total en servidor
$total = 0;
foreach ($items as $item) {
    $total += floatval($item['price'] ?? 0) * intval($item['quantity'] ?? 1);
}

// Crear tablas si no existen
$conn->query("
    CREATE TABLE IF NOT EXISTS orders (
        id             INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id     INT DEFAULT NULL,
        total          DECIMAL(10,2) NOT NULL DEFAULT 0,
        status         VARCHAR(20) NOT NULL DEFAULT 'paid',
        payment_method VARCHAR(20) NOT NULL DEFAULT 'card',
        nombre         VARCHAR(100) DEFAULT '',
        apellido       VARCHAR(100) DEFAULT '',
        email          VARCHAR(150) DEFAULT '',
        telefono       VARCHAR(30)  DEFAULT '',
        direccion      VARCHAR(255) DEFAULT '',
        ciudad         VARCHAR(100) DEFAULT '',
        cp             VARCHAR(10)  DEFAULT '',
        created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_usuario_id (usuario_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$conn->query("
    CREATE TABLE IF NOT EXISTS order_items (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        order_id      INT NOT NULL,
        product_id    INT DEFAULT 0,
        product_name  VARCHAR(255) DEFAULT '',
        product_image VARCHAR(255) DEFAULT '',
        price         DECIMAL(10,2) NOT NULL DEFAULT 0,
        quantity      INT NOT NULL DEFAULT 1,
        INDEX idx_order_id (order_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
");

$conn->begin_transaction();

try {
    $stmt = $conn->prepare(
        'INSERT INTO orders
         (usuario_id, total, payment_method, nombre, apellido, email, telefono, direccion, ciudad, cp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    if (!$stmt) throw new Exception('Error prepare orders: ' . $conn->error);

    $stmt->bind_param('idssssssss',
        $usuario_id, $total, $payment_method,
        $nombre, $apellido, $email, $telefono, $direccion, $ciudad, $cp
    );
    $stmt->execute();
    $order_id = $conn->insert_id;
    $stmt->close();

    if (!$order_id) throw new Exception('insert_id vacío');

    $stmtItem = $conn->prepare(
        'INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)'
    );
    if (!$stmtItem) throw new Exception('Error prepare order_items: ' . $conn->error);

    foreach ($items as $item) {
        $pid   = intval($item['id']       ?? 0);
        $pname = strval($item['name']     ?? '');
        $pimg  = strval($item['image']    ?? '');
        $price = floatval($item['price']  ?? 0);
        $qty   = intval($item['quantity'] ?? 1);

        $stmtItem->bind_param('iissdi', $order_id, $pid, $pname, $pimg, $price, $qty);
        $stmtItem->execute();
    }

    $stmtItem->close();
    $conn->commit();

    echo json_encode(['success' => true, 'order_id' => $order_id]);

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
