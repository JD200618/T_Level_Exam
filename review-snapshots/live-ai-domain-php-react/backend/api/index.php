<?php
require_once dirname(__DIR__) . '/bootstrap/init.php';
require_once dirname(__DIR__) . '/routes/system.php';
require_once dirname(__DIR__) . '/routes/customer/auth.php';
require_once dirname(__DIR__) . '/routes/customer/catalog.php';
require_once dirname(__DIR__) . '/routes/customer/cart.php';
require_once dirname(__DIR__) . '/routes/customer/checkout.php';
require_once dirname(__DIR__) . '/routes/customer/account.php';
require_once dirname(__DIR__) . '/routes/customer/orders.php';
require_once dirname(__DIR__) . '/routes/admin/auth.php';
require_once dirname(__DIR__) . '/routes/admin/overview.php';
require_once dirname(__DIR__) . '/routes/admin/inventory.php';
require_once dirname(__DIR__) . '/routes/admin/orders.php';
require_once dirname(__DIR__) . '/routes/admin/customers.php';
require_once dirname(__DIR__) . '/routes/admin/analytics.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');

if (request_method() === 'OPTIONS') {
    no_content();
}

$method = request_method();
$path = route_path($appConfig);
$input = json_input();

$handlers = [
    'handle_system_routes',
    'handle_customer_auth_routes',
    'handle_customer_catalog_routes',
    'handle_customer_cart_routes',
    'handle_customer_checkout_routes',
    'handle_customer_account_routes',
    'handle_customer_order_routes',
    'handle_admin_auth_routes',
    'handle_admin_overview_routes',
    'handle_admin_inventory_routes',
    'handle_admin_order_routes',
    'handle_admin_customer_routes',
    'handle_admin_analytics_routes',
];

foreach ($handlers as $handler) {
    if ($handler($db, $appConfig, $method, $path, $input) === true) {
        exit;
    }
}

json_error('Not found', 404, ['path' => $path]);
