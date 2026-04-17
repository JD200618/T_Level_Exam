<?php
require_once dirname(__DIR__) . '/db.php';

function session_cart_key(): string {
    return 'sess_' . session_id();
}

function get_or_create_cart(?int $userId): array {
    $pdo = ecommerce_db();
    $sessionKey = session_cart_key();

    if ($userId) {
        $stmt = $pdo->prepare('SELECT * FROM carts WHERE user_id = ? AND status = "active" ORDER BY id DESC LIMIT 1');
        $stmt->execute([$userId]);
        $cart = $stmt->fetch();
        if ($cart) {
            return $cart;
        }
    }

    $stmt = $pdo->prepare('SELECT * FROM carts WHERE session_key = ? AND status = "active" ORDER BY id DESC LIMIT 1');
    $stmt->execute([$sessionKey]);
    $cart = $stmt->fetch();
    if ($cart) {
        if ($userId && !$cart['user_id']) {
            $link = $pdo->prepare('UPDATE carts SET user_id = ? WHERE id = ?');
            $link->execute([$userId, $cart['id']]);
            $cart['user_id'] = $userId;
        }
        return $cart;
    }

    $insert = $pdo->prepare('INSERT INTO carts (user_id, session_key, status) VALUES (?, ?, "active")');
    $insert->execute([$userId, $sessionKey]);

    return [
        'id' => (int) $pdo->lastInsertId(),
        'user_id' => $userId,
        'session_key' => $sessionKey,
        'status' => 'active',
    ];
}

function cart_snapshot(int $cartId): array {
    $pdo = ecommerce_db();
    $stmt = $pdo->prepare('SELECT ci.product_id AS productId, p.name, p.category, p.unit, p.image_url AS image, p.stock_level AS stockLevel, ci.quantity, ci.unit_price AS unitPrice, ROUND(ci.quantity * ci.unit_price, 2) AS lineTotal FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = ? ORDER BY ci.id');
    $stmt->execute([$cartId]);
    $items = $stmt->fetchAll();
    $total = 0.0;
    foreach ($items as $item) {
        $total += (float) $item['lineTotal'];
    }
    return [
        'items' => $items,
        'summary' => [
            'itemCount' => array_sum(array_map(fn($item) => (int) $item['quantity'], $items)),
            'total' => number_format($total, 2, '.', ''),
        ],
    ];
}
