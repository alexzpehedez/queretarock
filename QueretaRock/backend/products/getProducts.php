<?php
/**
 * getProducts.php — Lista de productos con filtros opcionales
 * Parámetros GET: ?category=&brand=&model=&search=
 */

error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

// Filtros opcionales
$category = isset($_GET['category']) ? trim($_GET['category']) : '';
$brand    = isset($_GET['brand'])    ? trim($_GET['brand'])    : '';
$model    = isset($_GET['model'])    ? trim($_GET['model'])    : '';
$search   = isset($_GET['search'])  ? trim($_GET['search'])   : '';

$conditions = [];
$params     = [];
$types      = '';

if ($category !== '') {
    $conditions[] = 'category LIKE ?';
    $params[]     = '%' . $category . '%';
    $types       .= 's';
}

if ($brand !== '') {
    $conditions[] = 'brand = ?';
    $params[]     = $brand;
    $types       .= 's';
}

if ($model !== '') {
    $conditions[] = 'model LIKE ?';
    $params[]     = '%' . $model . '%';
    $types       .= 's';
}

if ($search !== '') {
    $conditions[] = '(name LIKE ? OR brand LIKE ?)';
    $params[]     = '%' . $search . '%';
    $params[]     = '%' . $search . '%';
    $types       .= 'ss';
}

$sql = 'SELECT id, name, brand, model, category, price, image, stock FROM products';
if (!empty($conditions)) {
    $sql .= ' WHERE ' . implode(' AND ', $conditions);
}
$sql .= ' ORDER BY brand ASC, name ASC';

$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['error' => 'Error preparando consulta: ' . $conn->error]);
    exit;
}

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = [
        'id'       => (int) $row['id'],
        'name'     => $row['name'],
        'brand'    => $row['brand'],
        'model'    => $row['model'],
        'category' => $row['category'],
        'price'    => (float) $row['price'],
        'image'    => $row['image'],
        'stock'    => (int) $row['stock']
    ];
}

echo json_encode($products);
