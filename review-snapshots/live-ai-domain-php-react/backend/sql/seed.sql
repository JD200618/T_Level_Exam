USE ecommerce_local;

INSERT INTO users (name, email, password_hash, role) VALUES
  ('Admin User', 'admin@greenfieldhub.local', '$2y$10$nItelHZ7tAqRMBIMPhW2k.gjaxde.XeMm8sPce/bc0nKz4TV5i./C', 'admin'),
  ('Sarah Johnson', 'sarah.johnson@example.com', '$2y$10$nItelHZ7tAqRMBIMPhW2k.gjaxde.XeMm8sPce/bc0nKz4TV5i./C', 'customer');

INSERT INTO categories (name, slug) VALUES
  ('Vegetables', 'vegetables'),
  ('Fruits', 'fruits');

INSERT INTO products (category_id, name, slug, description, image_url, price, unit, is_active) VALUES
  (1, 'Organic Tomatoes', 'organic-tomatoes', 'Fresh, vine-ripened organic tomatoes bursting with flavor', 'https://images.unsplash.com/photo-1700064165267-8fa68ef07167?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjB0b21hdG9lcyUyMGZyZXNoJTIwcHJvZHVjZXxlbnwxfHx8fDE3NzM5OTg5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080', 4.99, 'lb', 1),
  (1, 'Green Lettuce', 'green-lettuce', 'Crisp and fresh lettuce, perfect for salads', 'https://images.unsplash.com/photo-1657411658279-e32af8636eb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGdyZWVuJTIwbGV0dHVjZXxlbnwxfHx8fDE3NzM5ODIyNTR8MA&ixlib=rb-4.1.0&q=80&w=1080', 2.99, 'head', 1),
  (1, 'Organic Carrots', 'organic-carrots', 'Sweet and crunchy organic carrots', 'https://images.unsplash.com/photo-1611048660183-dc688cc049f2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcmFuZ2UlMjBjYXJyb3RzJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3NzM5NTIxNDR8MA&ixlib=rb-4.1.0&q=80&w=1080', 3.49, 'lb', 1),
  (2, 'Fresh Apples', 'fresh-apples', 'Crisp, juicy apples picked fresh from local orchards', 'https://images.unsplash.com/photo-1623815242959-fb20354f9b8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWQlMjBhcHBsZXMlMjBmcmVzaCUyMGZydWl0fGVufDF8fHx8MTc3Mzg5MjMwOHww&ixlib=rb-4.1.0&q=80&w=1080', 5.99, 'lb', 1),
  (2, 'Strawberries', 'strawberries', 'Sweet, ripe strawberries perfect for snacking', 'https://images.unsplash.com/photo-1710528184650-fc75ae862c13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMHN0cmF3YmVycmllcyUyMGJlcnJpZXN8ZW58MXx8fHwxNzczOTg5MjQxfDA&ixlib=rb-4.1.0&q=80&w=1080', 6.99, 'pint', 1),
  (1, 'Fresh Cucumbers', 'fresh-cucumbers', 'Refreshing cucumbers, great for salads and pickling', 'https://images.unsplash.com/photo-1725369865895-0dd4566c8864?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGN1Y3VtYmVycyUyMGdyZWVuJTIwdmVnZXRhYmxlc3xlbnwxfHx8fDE3NzM5MzY2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080', 3.99, 'lb', 1),
  (1, 'Bell Peppers', 'bell-peppers', 'Vibrant bell peppers, packed with nutrients', 'https://images.unsplash.com/photo-1741515042519-9b52d3ec2eaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5ZWxsb3clMjBiZWxsJTIwcGVwcGVyc3xlbnwxfHx8fDE3NzM5OTg5OTl8MA&ixlib=rb-4.1.0&q=80&w=1080', 4.49, 'lb', 1),
  (1, 'Fresh Broccoli', 'fresh-broccoli', 'Nutritious fresh broccoli, perfect for steaming or roasting', 'https://images.unsplash.com/photo-1769195045450-a53e5fef9d5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGJyb2Njb2xpJTIwZ3JlZW4lMjB2ZWdldGFibGV8ZW58MXx8fHwxNzczODc4MjkzfDA&ixlib=rb-4.1.0&q=80&w=1080', 3.99, 'bunch', 1);

INSERT INTO inventory (product_id, stock_level, low_stock_threshold)
SELECT id, 25, 5 FROM products;

INSERT INTO addresses (user_id, full_name, line1, city, postcode, country, is_default) VALUES
  (2, 'Sarah Johnson', '123 Green Street', 'Springfield', 'SP1 2AB', 'United Kingdom', 1);

INSERT INTO payment_methods (user_id, brand, last4, expiry_month, expiry_year, provider_ref, is_default) VALUES
  (2, 'Visa', '4242', '12', '2027', 'demo-pm-1', 1);
