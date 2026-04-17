<?php
function handle_customer_catalog_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/categories' && $method === 'GET') {
        json_response(['ok' => true, 'categories' => all_categories($db)]);
    }

    if ($path === '/products' && $method === 'GET') {
        json_response(['ok' => true, 'products' => all_products($db)]);
    }

    if ($matches = path_match('#^/products/(\d+)$#', $path)) {
        if ($method !== 'GET') {
            json_error('Method not allowed', 405);
        }
        $product = product_by_id($db, (int)$matches[1]);
        if (!$product) {
            json_error('Product not found', 404);
        }
        json_response(['ok' => true, 'product' => $product]);
    }

    return false;
}
