<?php
function handle_admin_overview_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/admin/overview' && $method === 'GET') {
        require_admin($db, $appConfig);
        json_response(['ok' => true, 'overview' => admin_overview($db)]);
    }
    return false;
}
