<?php
function handle_admin_analytics_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/admin/analytics' && $method === 'GET') {
        require_admin($db, $appConfig);
        json_response(['ok' => true, 'analytics' => admin_analytics($db)]);
    }
    return false;
}
