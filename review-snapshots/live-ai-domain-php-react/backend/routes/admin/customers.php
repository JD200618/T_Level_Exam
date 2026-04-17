<?php
function handle_admin_customer_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/admin/customers' && $method === 'GET') {
        require_admin($db, $appConfig);
        json_response(['ok' => true, 'customers' => admin_customers($db)]);
    }
    return false;
}
