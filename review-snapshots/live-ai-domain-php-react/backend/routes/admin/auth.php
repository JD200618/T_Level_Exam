<?php
function handle_admin_auth_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/admin/login' && $method === 'POST') {
        require_fields($input, ['email', 'password']);
        $user = find_user_by_email($db, $input['email']);
        if (!$user || $user['role'] !== 'admin' || !password_verify((string)$input['password'], $user['password_hash'])) {
            json_error('Invalid admin credentials', 401);
        }
        issue_session($db, $appConfig, (int)$user['id']);
        json_response(['ok' => true, 'user' => ['id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']]]);
    }

    return false;
}
