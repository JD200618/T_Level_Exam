<?php
function handle_admin_order_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/admin/orders' && $method === 'GET') {
        require_admin($db, $appConfig);
        json_response(['ok' => true, 'orders' => admin_orders($db)]);
    }

    if ($matches = path_match('#^/admin/orders/(\d+)/status$#', $path)) {
        if ($method !== 'PATCH') {
            json_error('Method not allowed', 405);
        }
        require_admin($db, $appConfig);
        require_fields($input, ['status']);
        admin_update_order_status($db, (int)$matches[1], (string)$input['status']);
        json_response(['ok' => true]);
    }

    return false;
}
