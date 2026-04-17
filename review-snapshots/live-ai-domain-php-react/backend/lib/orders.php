<?php
function user_orders(PDO $db, int $userId): array {
    $stmt = $db->prepare('SELECT id, order_number, subtotal, total, status, payment_status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC');
    $stmt->execute([$userId]);
    return $stmt->fetchAll();
}

function user_order_detail(PDO $db, int $userId, int $orderId): ?array {
    $stmt = $db->prepare('SELECT id, order_number, subtotal, total, status, payment_status, created_at FROM orders WHERE id = ? AND user_id = ? LIMIT 1');
    $stmt->execute([$orderId, $userId]);
    $order = $stmt->fetch();
    if (!$order) {
        return null;
    }
    $items = $db->prepare('SELECT product_id, product_name_snapshot, quantity, unit_price FROM order_items WHERE order_id = ? ORDER BY id');
    $items->execute([$orderId]);
    $order['items'] = $items->fetchAll();
    return $order;
}
