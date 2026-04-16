# E-commerce Local XAMPP Demo

Created: 2026-04-16 UTC

## Purpose
Local XAMPP-backed proof that Apache + PHP + MariaDB are running and serving a demo e-commerce backend path.

## Local URL
- http://127.0.0.1:8080/ecommerce-local/

## Public URL via Caddy
- https://atlasarchitect.ai/ecommerce-local/

## API checks
- http://127.0.0.1:8080/ecommerce-local/api/health.php
- https://atlasarchitect.ai/ecommerce-local/api/health.php
- https://atlasarchitect.ai/ecommerce-local/api/products.php

## Database
- MariaDB database: `ecommerce_local`
- Seeded tables: `users`, `products`, `orders`, `order_items`
- Seeded counts at creation time: 5 products, 3 users, 1 order

## Notes
- Apache had to be started directly with `/opt/lampp/bin/httpd -k start -f /opt/lampp/etc/httpd.conf` because the XAMPP wrapper incorrectly refused while Caddy was already bound on ports 80/443.
- Public routing was added in `/etc/caddy/Caddyfile` for `/ecommerce-local*` to `127.0.0.1:8080`.
