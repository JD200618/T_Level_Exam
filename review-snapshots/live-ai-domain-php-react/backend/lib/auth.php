<?php
function session_cookie_name(array $appConfig): string {
    return $appConfig['cookies']['session'];
}

function guest_cookie_name(array $appConfig): string {
    return $appConfig['cookies']['guest'];
}

function current_session_token(array $appConfig): ?string {
    return $_COOKIE[session_cookie_name($appConfig)] ?? null;
}

function current_user(PDO $db, array $appConfig): ?array {
    $token = current_session_token($appConfig);
    if (!$token) {
        return null;
    }
    $stmt = $db->prepare('SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.session_token = ? AND s.expires_at > NOW() LIMIT 1');
    $stmt->execute([$token]);
    $user = $stmt->fetch();
    return $user ?: null;
}

function require_auth(PDO $db, array $appConfig): array {
    $user = current_user($db, $appConfig);
    if (!$user) {
        json_error('Unauthorized', 401);
    }
    return $user;
}

function require_admin(PDO $db, array $appConfig): array {
    $user = require_auth($db, $appConfig);
    if (($user['role'] ?? '') !== 'admin') {
        json_error('Forbidden', 403);
    }
    return $user;
}

function issue_session(PDO $db, array $appConfig, int $userId): string {
    $token = bin2hex(random_bytes(32));
    $days = (int)($appConfig['session_days'] ?? 7);
    $stmt = $db->prepare('INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? DAY))');
    $stmt->execute([$userId, $token, $days]);
    setcookie(session_cookie_name($appConfig), $token, time() + (86400 * $days), '/');
    $_COOKIE[session_cookie_name($appConfig)] = $token;
    return $token;
}

function destroy_session(PDO $db, array $appConfig): void {
    $token = current_session_token($appConfig);
    if ($token) {
        $stmt = $db->prepare('DELETE FROM sessions WHERE session_token = ?');
        $stmt->execute([$token]);
    }
    setcookie(session_cookie_name($appConfig), '', time() - 3600, '/');
    unset($_COOKIE[session_cookie_name($appConfig)]);
}

function find_user_by_email(PDO $db, string $email): ?array {
    $stmt = $db->prepare('SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1');
    $stmt->execute([strtolower(trim($email))]);
    $user = $stmt->fetch();
    return $user ?: null;
}

function ensure_guest_token(array $appConfig): string {
    $cookie = guest_cookie_name($appConfig);
    if (!empty($_COOKIE[$cookie])) {
        return $_COOKIE[$cookie];
    }
    $token = bin2hex(random_bytes(32));
    setcookie($cookie, $token, time() + (86400 * 30), '/');
    $_COOKIE[$cookie] = $token;
    return $token;
}
