-- SQL script to convert product prices from USD to Nepalese Rupees (NPR)
-- This script scales all product prices by a factor of 130 (approximate USD to NPR exchange rate)
-- and rounds them to the nearest integer for clean Nepalese pricing.

-- 1. Update the product table prices
UPDATE products 
SET price = ROUND(price * 130.00, 0)
WHERE price < 10000.00; -- Safety check: only multiply if not already scaled

-- 2. Update existing order items unit prices to match, ensuring history remains consistent
UPDATE order_items 
SET unit_price = ROUND(unit_price * 130.00, 0)
WHERE unit_price < 10000.00;

-- 3. Update existing orders total amounts to match
UPDATE orders 
SET total_amount = ROUND(total_amount * 130.00, 0)
WHERE total_amount < 100000.00;

-- Print confirmation
SELECT 'Product prices, order items, and order totals successfully converted to Nepalese Rupees (NPR) with a multiplier of 130.' AS status;
