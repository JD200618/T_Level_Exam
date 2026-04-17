<?php
function resolve_checkout_address(PDO $db, int $userId, array $input): int {
    if (!empty($input['addressId'])) {
        $stmt = $db->prepare('SELECT id FROM addresses WHERE id = ? AND user_id = ? LIMIT 1');
        $stmt->execute([(int)$input['addressId'], $userId]);
        $existing = $stmt->fetch();
        if ($existing) {
            return (int)$existing['id'];
        }
    }

    require_fields($input, ['fullName', 'address', 'city', 'postcode', 'country']);
    $stmt = $db->prepare('INSERT INTO addresses (user_id, full_name, line1, city, postcode, country, is_default) VALUES (?, ?, ?, ?, ?, ?, 0)');
    $stmt->execute([
        $userId,
        trim($input['fullName']),
        trim($input['address']),
        trim($input['city']),
        trim($input['postcode']),
        trim($input['country']),
    ]);
    return (int)$db->lastInsertId();
}

function generate_order_number(): string {
    return 'ORD-' . strtoupper(bin2hex(random_bytes(4)));
}

function create_order_from_cart(PDO $db, array $appConfig, array $user, array $input): array {
    $cart = get_or_create_cart($db, $appConfig, $user);
    $items = get_cart_items($db, (int)$cart['id']);
    if (!$items) {
        json_error('Cart is empty', 422);
    }

    $addressId = resolve_checkout_address($db, (int)$user['id'], $input);
    $totals = cart_totals($items);

    $db->beginTransaction();
    try {
        foreach ($items as $item) {
            $stockStmt = $db->prepare('SELECT stock_level FROM inventory WHERE product_id = ? LIMIT 1');
            $stockStmt->execute([(int)$item['product_id']]);
            $stock = (int)$stockStmt->fetchColumn();
            if ($stock < (int)$item['quantity']) {
                throw new RuntimeException('Insufficient stock for product: ' . $item['name']);
            }
        }

        $orderNumber = generate_order_number();
        $stmt = $db->prepare('INSERT INTO orders (order_number, user_id, address_id, subtotal, total, status, payment_status) VALUES (?, ?, ?, ?, ?, "paid", "paid")');
        $stmt->execute([$orderNumber, $user['id'], $addressId, $totals['subtotal'], $totals['total']]);
        $orderId = (int)$db->lastInsertId();

        $itemStmt = $db->prepare('INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price) VALUES (?, ?, ?, ?, ?)');
        $inventoryStmt = $db->prepare('UPDATE inventory SET stock_level = stock_level - ? WHERE product_id = ?');
        foreach ($items as $item) {
            $itemStmt->execute([$orderId, $item['product_id'], $item['name'], $item['quantity'], $item['unit_price']]);
            $inventoryStmt->execute([$item['quantity'], $item['product_id']]);
        }

        $paymentStmt = $db->prepare('INSERT INTO payments (order_id, provider, amount, status, reference) VALUES (?, "demo", ?, "paid", ?)');
        $paymentStmt->execute([$orderId, $totals['total'], 'demo-pay-' . $orderNumber]);

        clear_cart($db, (int)$cart['id']);
        $cartStatus = $db->prepare('UPDATE carts SET status = "converted" WHERE id = ?');
        $cartStatus->execute([(int)$cart['id']]);

        $db->commit();
        return [
            'orderId' => $orderId,
            'orderNumber' => $orderNumber,
            'total' => $totals['total'],
        ];
    } catch (Throwable $e) {
        $db->rollBack();
        json_error($e->getMessage(), 422);
    }
}
