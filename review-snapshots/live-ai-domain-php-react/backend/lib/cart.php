<?php
function find_active_cart(PDO $db, array $appConfig, ?array $user): ?array {
    if ($user) {
        $stmt = $db->prepare('SELECT * FROM carts WHERE user_id = ? AND status = "active" LIMIT 1');
        $stmt->execute([$user['id']]);
    } else {
        $guestToken = ensure_guest_token($appConfig);
        $stmt = $db->prepare('SELECT * FROM carts WHERE guest_token = ? AND status = "active" LIMIT 1');
        $stmt->execute([$guestToken]);
    }
    $cart = $stmt->fetch();
    return $cart ?: null;
}

function get_or_create_cart(PDO $db, array $appConfig, ?array $user): array {
    $cart = find_active_cart($db, $appConfig, $user);
    if ($cart) {
        return $cart;
    }
    if ($user) {
        $stmt = $db->prepare('INSERT INTO carts (user_id, status) VALUES (?, "active")');
        $stmt->execute([$user['id']]);
    } else {
        $guestToken = ensure_guest_token($appConfig);
        $stmt = $db->prepare('INSERT INTO carts (guest_token, status) VALUES (?, "active")');
        $stmt->execute([$guestToken]);
    }
    $id = (int)$db->lastInsertId();
    $stmt = $db->prepare('SELECT * FROM carts WHERE id = ? LIMIT 1');
    $stmt->execute([$id]);
    return $stmt->fetch();
}

function get_cart_items(PDO $db, int $cartId): array {
    $stmt = $db->prepare('SELECT ci.product_id, ci.quantity, ci.unit_price, p.name, p.slug, p.image_url, p.unit FROM cart_items ci JOIN products p ON p.id = ci.product_id WHERE ci.cart_id = ? ORDER BY ci.id');
    $stmt->execute([$cartId]);
    return $stmt->fetchAll();
}

function cart_totals(array $items): array {
    $subtotal = 0.0;
    $count = 0;
    foreach ($items as $item) {
        $subtotal += ((float)$item['unit_price']) * ((int)$item['quantity']);
        $count += (int)$item['quantity'];
    }
    $subtotal = (float) number_format($subtotal, 2, '.', '');
    return [
        'itemCount' => $count,
        'subtotal' => $subtotal,
        'total' => $subtotal,
    ];
}

function add_cart_item(PDO $db, int $cartId, int $productId, int $quantity): void {
    $stmt = $db->prepare('SELECT id, price FROM products WHERE id = ? AND is_active = 1 LIMIT 1');
    $stmt->execute([$productId]);
    $product = $stmt->fetch();
    if (!$product) {
        json_error('Product not found', 404);
    }
    $stmt = $db->prepare('INSERT INTO cart_items (cart_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity), unit_price = VALUES(unit_price)');
    $stmt->execute([$cartId, $productId, $quantity, $product['price']]);
}

function update_cart_item(PDO $db, int $cartId, int $productId, int $quantity): void {
    if ($quantity <= 0) {
        remove_cart_item($db, $cartId, $productId);
        return;
    }
    $stmt = $db->prepare('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?');
    $stmt->execute([$quantity, $cartId, $productId]);
}

function remove_cart_item(PDO $db, int $cartId, int $productId): void {
    $stmt = $db->prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?');
    $stmt->execute([$cartId, $productId]);
}

function clear_cart(PDO $db, int $cartId): void {
    $stmt = $db->prepare('DELETE FROM cart_items WHERE cart_id = ?');
    $stmt->execute([$cartId]);
}

function merge_guest_cart_into_user(PDO $db, array $appConfig, int $userId): void {
    $guestToken = $_COOKIE[guest_cookie_name($appConfig)] ?? null;
    if (!$guestToken) {
        return;
    }
    $stmt = $db->prepare('SELECT * FROM carts WHERE guest_token = ? AND status = "active" LIMIT 1');
    $stmt->execute([$guestToken]);
    $guestCart = $stmt->fetch();
    if (!$guestCart) {
        return;
    }
    $userCart = find_active_cart($db, $appConfig, ['id' => $userId]);
    if (!$userCart) {
        $stmt = $db->prepare('UPDATE carts SET user_id = ?, guest_token = NULL WHERE id = ?');
        $stmt->execute([$userId, $guestCart['id']]);
        return;
    }
    $items = get_cart_items($db, (int)$guestCart['id']);
    foreach ($items as $item) {
        add_cart_item($db, (int)$userCart['id'], (int)$item['product_id'], (int)$item['quantity']);
    }
    clear_cart($db, (int)$guestCart['id']);
    $stmt = $db->prepare('UPDATE carts SET status = "converted" WHERE id = ?');
    $stmt->execute([$guestCart['id']]);
}
