<?php
function handle_admin_inventory_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/admin/inventory' && $method === 'GET') {
        require_admin($db, $appConfig);
        json_response(['ok' => true, 'inventory' => admin_inventory($db)]);
    }

    if ($matches = path_match('#^/admin/inventory/(\d+)$#', $path)) {
        if ($method !== 'PATCH') {
            json_error('Method not allowed', 405);
        }
        require_admin($db, $appConfig);
        admin_update_inventory($db, (int)$matches[1], (int)($input['stockLevel'] ?? 0), (int)($input['lowStockThreshold'] ?? 5));
        json_response(['ok' => true]);
    }

    return false;
}
