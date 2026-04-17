<?php
require_once __DIR__ . '/bootstrap/init.php';
function ecommerce_db(): PDO {
    global $db;
    return $db;
}
