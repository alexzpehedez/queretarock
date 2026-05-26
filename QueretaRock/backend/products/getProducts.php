<?php

header('Content-Type: application/json');

require_once '../config/database.php';

$sql = "SELECT * FROM products";

$result = mysqli_query($conn, $sql);

if(!$result){

    echo json_encode([
        "error" => mysqli_error($conn)
    ]);

    exit;
}

$products = [];

while($row = mysqli_fetch_assoc($result)){

    $products[] = $row;
}

echo json_encode($products);