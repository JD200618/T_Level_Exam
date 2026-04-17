<?php
function handle_customer_checkout_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/checkout/preview' && $method === 'POST') {
        $user = require_auth($db, $appConfig);
        $cart = get_or_create_cart($db, $appConfig, $user);
        $items = get_cart_items($db, (int)$cart['id']);
        if (!$items) {
            json_error('Cart is empty', 422);
        }
        json_response(['ok' => true, 'items' => $items, 'totals' => cart_totals($items)]);
    }

    if ($path === '/checkout/place' && $method === 'POST') {
        $user = require_auth($db, $appConfig);
        $order = create_order_from_cart($db, $appConfig, $user, $input);
        json_response(['ok' => true, 'order' => $order]);
    }

    return false;
}
