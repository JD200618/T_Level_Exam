<?php
require_once __DIR__ . '/bootstrap/init.php';
$productCount = (int)$db->query('SELECT COUNT(*) FROM products')->fetchColumn();
$userCount = (int)$db->query('SELECT COUNT(*) FROM users')->fetchColumn();
$orderCount = (int)$db->query('SELECT COUNT(*) FROM orders')->fetchColumn();
$latestOrders = $db->query('SELECT order_number, status, total, created_at FROM orders ORDER BY id DESC LIMIT 5')->fetchAll();
?><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>E-commerce Local XAMPP Backend</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; background: #f7f8f4; color: #1f2937; }
    .wrap { max-width: 1040px; margin: 0 auto; padding: 32px 20px 64px; }
    .hero, .card, table { background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.06); }
    .hero { padding: 24px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 24px 0; }
    .card { padding: 18px; }
    .num { font-size: 34px; font-weight: bold; color: #166534; }
    a { color: #166534; text-decoration: none; }
    a:hover { text-decoration: underline; }
    table { width: 100%; border-collapse: collapse; overflow: hidden; }
    th, td { padding: 12px 14px; border-bottom: 1px solid #e5e7eb; text-align: left; }
    th { background: #ecfdf5; }
    .pill { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #dcfce7; color: #166534; font-size: 12px; font-weight: bold; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 6px; }
    ul { line-height: 1.8; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <span class="pill">Full flow XAMPP/PHP backend</span>
      <h1>E-commerce Local</h1>
      <p>This path now carries the MariaDB-backed PHP API for auth, catalog, cart, checkout, account, and admin endpoints.</p>
      <ul>
        <li><a href="./api/health">GET /api/health</a></li>
        <li><a href="./api/products">GET /api/products</a></li>
        <li><code>POST /api/auth/login</code></li>
        <li><code>GET /api/cart</code></li>
        <li><code>POST /api/checkout/place</code></li>
        <li><code>GET /api/admin/overview</code></li>
      </ul>
      <p>Local path: <code>http://127.0.0.1:8080/ecommerce-local/</code></p>
      <p>Public path: <code>https://atlasarchitect.ai/ecommerce-local/</code></p>
    </div>

    <div class="grid">
      <div class="card"><div class="num"><?php echo $productCount; ?></div><div>Products</div></div>
      <div class="card"><div class="num"><?php echo $userCount; ?></div><div>Users</div></div>
      <div class="card"><div class="num"><?php echo $orderCount; ?></div><div>Orders</div></div>
    </div>

    <h2>Latest Orders</h2>
    <table>
      <thead><tr><th>Order</th><th>Status</th><th>Total</th><th>Created</th></tr></thead>
      <tbody>
        <?php foreach ($latestOrders as $order): ?>
          <tr>
            <td><?php echo htmlspecialchars($order['order_number']); ?></td>
            <td><?php echo htmlspecialchars($order['status']); ?></td>
            <td>$<?php echo number_format((float)$order['total'], 2); ?></td>
            <td><?php echo htmlspecialchars($order['created_at']); ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</body>
</html>
