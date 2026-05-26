
<?php

require_once '../config/database.php';

$json = file_get_contents(
    '../../assets/data/products.json'
);

$products = json_decode($json, true);

foreach($products as $product){

    $name = mysqli_real_escape_string(
        $conn,
        $product['name']
    );

    $brand = mysqli_real_escape_string(
        $conn,
        $product['brand']
    );

    $model = mysqli_real_escape_string(
        $conn,
        $product['model']
    );

    $category = mysqli_real_escape_string(
        $conn,
        $product['category']
    );

    $price = $product['price'];

    $image = mysqli_real_escape_string(
        $conn,
        $product['image']
    );

    $stock = $product['stock'];

    $sql = "
        INSERT INTO products
        (
            name,
            brand,
            model,
            category,
            price,
            image,
            stock
        )

        VALUES
        (
            '$name',
            '$brand',
            '$model',
            '$category',
            '$price',
            '$image',
            '$stock'
        )
    ";

    mysqli_query($conn, $sql);
}

echo 'Productos importados correctamente';
