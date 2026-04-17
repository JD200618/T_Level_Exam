<?php
function handle_customer_order_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/orders' && $method === 'GET') {
        $user = require_auth($db, $appConfig);
        json_response(['ok' => true, 'orders' => user_orders($db, (int)$user['id'])]);
    }

    if ($matches = path_match('#^/orders/(\d+)$#', $path)) {
        if ($method !== 'GET') {
            json_error('Method not allowed', 405);
        }
        $user = require_auth($db, $appConfig);
        $order = user_order_detail($db, (int)$user['id'], (int)$matches[1]);
        if (!$order) {
            json_error('Order not found', 404);
        }
        json_response(['ok' => true, 'order' => $order]);
    }

    return false;
}
