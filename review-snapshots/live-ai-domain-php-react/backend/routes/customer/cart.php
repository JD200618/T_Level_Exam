<?php
function handle_customer_cart_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/cart' && $method === 'GET') {
        $user = current_user($db, $appConfig);
        $cart = get_or_create_cart($db, $appConfig, $user);
        $items = get_cart_items($db, (int)$cart['id']);
        json_response(['ok' => true, 'cart' => $cart, 'items' => $items, 'totals' => cart_totals($items)]);
    }

    if ($path === '/cart' && $method === 'DELETE') {
        $user = current_user($db, $appConfig);
        $cart = get_or_create_cart($db, $appConfig, $user);
        clear_cart($db, (int)$cart['id']);
        json_response(['ok' => true]);
    }

    if ($path === '/cart/items' && $method === 'POST') {
        require_fields($input, ['productId']);
        $user = current_user($db, $appConfig);
        $cart = get_or_create_cart($db, $appConfig, $user);
        add_cart_item($db, (int)$cart['id'], (int)$input['productId'], max(1, (int)($input['quantity'] ?? 1)));
        json_response(['ok' => true]);
    }

    if ($matches = path_match('#^/cart/items/(\d+)$#', $path)) {
        $user = current_user($db, $appConfig);
        $cart = get_or_create_cart($db, $appConfig, $user);
        $productId = (int)$matches[1];
        if ($method === 'PATCH') {
            update_cart_item($db, (int)$cart['id'], $productId, (int)($input['quantity'] ?? 0));
            json_response(['ok' => true]);
        }
        if ($method === 'DELETE') {
            remove_cart_item($db, (int)$cart['id'], $productId);
            json_response(['ok' => true]);
        }
        json_error('Method not allowed', 405);
    }

    return false;
}
