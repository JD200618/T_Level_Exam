<?php
function request_method(): string {
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}

function route_path(array $appConfig): string {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $base = $appConfig['base_api_path'] ?? '/ecommerce-local/api';
    if (str_starts_with($path, $base)) {
        $path = substr($path, strlen($base));
    }
    if ($path === '') {
        $path = '/';
    }
    if ($path !== '/') {
        $path = rtrim($path, '/');
        if ($path === '') {
            $path = '/';
        }
    }
    return $path;
}

function json_input(): array {
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function path_match(string $pattern, string $path): array|false {
    return preg_match($pattern, $path, $matches) ? $matches : false;
}
