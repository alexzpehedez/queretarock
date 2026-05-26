<?php

header("Content-Type: application/json");

$conn = new mysqli(
    "localhost",
    "root",
    "",
    "queretarock"
);

if($conn->connect_error){
    die("Error conexión");
}

$id = $_GET['id'];

$sql = "SELECT * FROM products WHERE id = ?";

$stmt = $conn->prepare($sql);

$stmt->bind_param("i", $id);

$stmt->execute();

$result = $stmt->get_result();

$product = $result->fetch_assoc();

echo json_encode($product);
?>