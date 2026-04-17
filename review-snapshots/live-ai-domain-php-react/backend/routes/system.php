<?php
function handle_system_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/health' && $method === 'GET') {
        json_response([
            'ok' => true,
            'service' => 'ecommerce-local-xampp',
            'database' => 'connected',
        ]);
    }

    if ($path === '/bootstrap-status' && $method === 'GET') {
        json_response([
            'ok' => true,
            'counts' => [
                'users' => (int)$db->query('SELECT COUNT(*) FROM users')->fetchColumn(),
                'products' => (int)$db->query('SELECT COUNT(*) FROM products')->fetchColumn(),
                'orders' => (int)$db->query('SELECT COUNT(*) FROM orders')->fetchColumn(),
            ],
        ]);
    }

    return false;
}
