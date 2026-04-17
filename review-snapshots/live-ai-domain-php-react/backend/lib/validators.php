<?php
function require_fields(array $input, array $fields): void {
    foreach ($fields as $field) {
        if (!array_key_exists($field, $input) || $input[$field] === '' || $input[$field] === null) {
            json_error('Missing field: ' . $field, 422);
        }
    }
}

function normalize_order_status(string $status): string {
    $allowed = ['pending', 'paid', 'processing', 'delivered', 'collected', 'cancelled'];
    if (!in_array($status, $allowed, true)) {
        json_error('Invalid order status', 422);
    }
    return $status;
}
