<?php
function all_categories(PDO $db): array {
    return $db->query('SELECT id, name, slug FROM categories ORDER BY name')->fetchAll();
}

function all_products(PDO $db): array {
    $sql = 'SELECT p.id, p.name, p.slug, p.description, p.image_url, p.price, p.unit, p.is_active, c.name AS category, i.stock_level, i.low_stock_threshold FROM products p JOIN categories c ON c.id = p.category_id JOIN inventory i ON i.product_id = p.id WHERE p.is_active = 1 ORDER BY p.id';
    return $db->query($sql)->fetchAll();
}

function product_by_id(PDO $db, int $productId): ?array {
    $stmt = $db->prepare('SELECT p.id, p.name, p.slug, p.description, p.image_url, p.price, p.unit, p.is_active, c.name AS category, i.stock_level, i.low_stock_threshold FROM products p JOIN categories c ON c.id = p.category_id JOIN inventory i ON i.product_id = p.id WHERE p.id = ? LIMIT 1');
    $stmt->execute([$productId]);
    $row = $stmt->fetch();
    return $row ?: null;
}
