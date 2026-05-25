-- Corrected Database Schema and Seed Data
-- This file fixes inconsistencies in the provided schema and populates it with ~540 products.

-- 1. CLEANUP & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- 2. SCHEMA DEFINITION (FIXED)

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    image_url TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Changed to UUID for consistency
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Fixed type mismatch
    image_url TEXT,
    brand VARCHAR(255),
    specs JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    "order" INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- 3. SEED DATA GENERATION

DO $$
DECLARE
    cat_id UUID;
    cat_record RECORD;
    categories TEXT[] := ARRAY[
        'Electric Guitars', 'Acoustic Guitars', 'Bass Guitars', 
        'Digital Pianos', 'Synthesizers', 'Drum Kits', 
        'Cymbals', 'Violins', 'Saxophones'
    ];
    brands TEXT[] := ARRAY[
        'Fender', 'Gibson', 'Ibanez', 'Yamaha', 'Roland', 
        'Korg', 'Pearl', 'Zildjian', 'Stradivarius', 'Selmer'
    ];
    adj TEXT[] := ARRAY['Professional', 'Beginner', 'Vintage', 'Limited Edition', 'Custom Shop', 'Standard', 'Deluxe', 'Elite'];
    i INTEGER;
    j INTEGER;
    rand_brand TEXT;
    rand_name TEXT;
BEGIN
    -- Insert Categories
    FOR i IN 1..array_length(categories, 1) LOOP
        INSERT INTO categories (name, image_url) 
        VALUES (categories[i], 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80')
        RETURNING id INTO cat_id;

        -- Generate 60 products for each category (range 50-80)
        FOR j IN 1..60 LOOP
            rand_brand := brands[(floor(random() * array_length(brands, 1)) + 1)::int];
            rand_name := rand_brand || ' ' || adj[(floor(random() * array_length(adj, 1)) + 1)::int] || ' ' || categories[i] || ' ' || (j + 100);
            
            INSERT INTO products (
                name, 
                description, 
                price, 
                stock, 
                category_id, 
                brand, 
                image_url, 
                specs
            ) VALUES (
                rand_name,
                'A premium ' || lower(categories[i]) || ' crafted for the finest acoustics and durability. Features a sleek design and professional-grade components.',
                (random() * 2500 + 100)::numeric(10,2),
                (random() * 50)::int,
                cat_id,
                rand_brand,
                'https://picsum.photos/seed/' || encode(gen_random_bytes(8), 'hex') || '/600/400',
                jsonb_build_object(
                    'material', 'Premium Selection',
                    'weight', (random() * 5 + 2)::numeric(10,1) || ' kg',
                    'warranty', '2 Years',
                    'color', (ARRAY['Black', 'Sunburst', 'Natural', 'White', 'Blue'])[(floor(random() * 5) + 1)::int]
                )
            );
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Seeding completed: 9 categories and 540 products inserted.';
END $$;
