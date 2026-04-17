<?php
function admin_overview(PDO $db): array {
    $revenue = (float)$db->query('SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = "paid"')->fetchColumn();
    return [
        'products' => (int)$db->query('SELECT COUNT(*) FROM products WHERE is_active = 1')->fetchColumn(),
        'customers' => (int)$db->query('SELECT COUNT(*) FROM users WHERE role = "customer"')->fetchColumn(),
        'orders' => (int)$db->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
        'revenue' => number_format($revenue, 2, '.', ''),
    ];
}

function admin_inventory(PDO $db): array {
    $sql = 'SELECT p.id, p.name, c.name AS category, p.price, p.unit, i.stock_level, i.low_stock_threshold FROM products p JOIN categories c ON c.id = p.category_id JOIN inventory i ON i.product_id = p.id ORDER BY p.id';
    return $db->query($sql)->fetchAll();
}

function admin_update_inventory(PDO $db, int $productId, int $stockLevel, int $threshold): void {
    $stmt = $db->prepare('UPDATE inventory SET stock_level = ?, low_stock_threshold = ? WHERE product_id = ?');
    $stmt->execute([$stockLevel, $threshold, $productId]);
}

function admin_orders(PDO $db): array {
    $sql = 'SELECT o.id, o.order_number, o.status, o.payment_status, o.total, o.created_at, u.name AS customer_name, u.email AS customer_email FROM orders o LEFT JOIN users u ON u.id = o.user_id ORDER BY o.id DESC';
    return $db->query($sql)->fetchAll();
}

function admin_update_order_status(PDO $db, int $orderId, string $status): void {
    $stmt = $db->prepare('UPDATE orders SET status = ? WHERE id = ?');
    $stmt->execute([normalize_order_status($status), $orderId]);
}

function admin_customers(PDO $db): array {
    $sql = 'SELECT u.id, u.name, u.email, COUNT(o.id) AS order_count, COALESCE(SUM(o.total), 0) AS total_spend FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE u.role = "customer" GROUP BY u.id ORDER BY total_spend DESC, u.id ASC';
    return $db->query($sql)->fetchAll();
}

function admin_analytics(PDO $db): array {
    return [
        'revenueByStatus' => $db->query('SELECT status, COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue FROM orders GROUP BY status ORDER BY status')->fetchAll(),
        'topProducts' => $db->query('SELECT oi.product_name_snapshot AS product_name, SUM(oi.quantity) AS units_sold, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi GROUP BY oi.product_name_snapshot ORDER BY units_sold DESC, revenue DESC LIMIT 10')->fetchAll(),
    ];
}
