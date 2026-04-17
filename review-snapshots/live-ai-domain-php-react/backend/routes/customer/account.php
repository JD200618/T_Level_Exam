<?php
function handle_customer_account_routes(PDO $db, array $appConfig, string $method, string $path, array $input): bool {
    if ($path === '/account/profile') {
        $user = require_auth($db, $appConfig);
        if ($method === 'GET') {
            $stmt = $db->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1');
            $stmt->execute([$user['id']]);
            json_response(['ok' => true, 'profile' => $stmt->fetch()]);
        }
        if ($method === 'PATCH') {
            require_fields($input, ['name']);
            $stmt = $db->prepare('UPDATE users SET name = ? WHERE id = ?');
            $stmt->execute([trim($input['name']), $user['id']]);
            json_response(['ok' => true]);
        }
        json_error('Method not allowed', 405);
    }

    if ($path === '/account/addresses') {
        $user = require_auth($db, $appConfig);
        if ($method === 'GET') {
            $stmt = $db->prepare('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC');
            $stmt->execute([$user['id']]);
            json_response(['ok' => true, 'addresses' => $stmt->fetchAll()]);
        }
        if ($method === 'POST') {
            require_fields($input, ['fullName', 'address', 'city', 'postcode', 'country']);
            $stmt = $db->prepare('INSERT INTO addresses (user_id, full_name, line1, city, postcode, country, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$user['id'], trim($input['fullName']), trim($input['address']), trim($input['city']), trim($input['postcode']), trim($input['country']), !empty($input['isDefault']) ? 1 : 0]);
            json_response(['ok' => true, 'id' => (int)$db->lastInsertId()], 201);
        }
        json_error('Method not allowed', 405);
    }

    if ($matches = path_match('#^/account/addresses/(\d+)$#', $path)) {
        $user = require_auth($db, $appConfig);
        $addressId = (int)$matches[1];
        if ($method === 'PATCH') {
            $stmt = $db->prepare('UPDATE addresses SET full_name = ?, line1 = ?, city = ?, postcode = ?, country = ?, is_default = ? WHERE id = ? AND user_id = ?');
            $stmt->execute([
                trim((string)($input['fullName'] ?? '')),
                trim((string)($input['address'] ?? '')),
                trim((string)($input['city'] ?? '')),
                trim((string)($input['postcode'] ?? '')),
                trim((string)($input['country'] ?? '')),
                !empty($input['isDefault']) ? 1 : 0,
                $addressId,
                $user['id'],
            ]);
            json_response(['ok' => true]);
        }
        if ($method === 'DELETE') {
            $stmt = $db->prepare('DELETE FROM addresses WHERE id = ? AND user_id = ?');
            $stmt->execute([$addressId, $user['id']]);
            json_response(['ok' => true]);
        }
        json_error('Method not allowed', 405);
    }

    if ($path === '/account/payment-methods') {
        $user = require_auth($db, $appConfig);
        if ($method === 'GET') {
            $stmt = $db->prepare('SELECT id, brand, last4, expiry_month, expiry_year, is_default FROM payment_methods WHERE user_id = ? ORDER BY is_default DESC, id DESC');
            $stmt->execute([$user['id']]);
            json_response(['ok' => true, 'paymentMethods' => $stmt->fetchAll()]);
        }
        if ($method === 'POST') {
            require_fields($input, ['brand', 'last4', 'expiryMonth', 'expiryYear']);
            $stmt = $db->prepare('INSERT INTO payment_methods (user_id, brand, last4, expiry_month, expiry_year, provider_ref, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([$user['id'], trim($input['brand']), trim($input['last4']), trim($input['expiryMonth']), trim($input['expiryYear']), 'demo-' . bin2hex(random_bytes(6)), !empty($input['isDefault']) ? 1 : 0]);
            json_response(['ok' => true, 'id' => (int)$db->lastInsertId()], 201);
        }
        json_error('Method not allowed', 405);
    }

    if ($matches = path_match('#^/account/payment-methods/(\d+)$#', $path)) {
        $user = require_auth($db, $appConfig);
        if ($method === 'DELETE') {
            $stmt = $db->prepare('DELETE FROM payment_methods WHERE id = ? AND user_id = ?');
            $stmt->execute([(int)$matches[1], $user['id']]);
            json_response(['ok' => true]);
        }
        json_error('Method not allowed', 405);
    }

    return false;
}
