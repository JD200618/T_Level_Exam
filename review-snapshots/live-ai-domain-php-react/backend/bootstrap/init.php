<?php
$appConfig = require dirname(__DIR__) . '/config/app.php';
$dbConfig = require dirname(__DIR__) . '/config/database.php';

require_once dirname(__DIR__) . '/lib/db.php';
require_once dirname(__DIR__) . '/lib/response.php';
require_once dirname(__DIR__) . '/lib/request.php';
require_once dirname(__DIR__) . '/lib/validators.php';
require_once dirname(__DIR__) . '/lib/auth.php';
require_once dirname(__DIR__) . '/lib/catalog.php';
require_once dirname(__DIR__) . '/lib/cart.php';
require_once dirname(__DIR__) . '/lib/checkout.php';
require_once dirname(__DIR__) . '/lib/orders.php';
require_once dirname(__DIR__) . '/lib/admin.php';

date_default_timezone_set('UTC');
$db = db_connect($dbConfig);
