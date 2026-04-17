<?php
function handle_customer_auth_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/auth/login' && $method === 'POST') {
        require_fields($input, ['email', 'password']);
        $user = find_user_by_email($db, $input['email']);
        if (!$user || !password_verify((string)$input['password'], $user['password_hash'])) {
            json_error('Invalid credentials', 401);
        }
        issue_session($db, $appConfig, (int)$user['id']);
        merge_guest_cart_into_user($db, $appConfig, (int)$user['id']);
        json_response(['ok' => true, 'user' => ['id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']]]);
    }

    if ($path === '/auth/logout' && $method === 'POST') {
        destroy_session($db, $appConfig);
        json_response(['ok' => true]);
    }

    if ($path === '/auth/me' && $method === 'GET') {
        $user = current_user($db, $appConfig);
        json_response(['ok' => true, 'user' => $user ? ['id' => (int)$user['id'], 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']] : null]);
    }

    return false;
}
