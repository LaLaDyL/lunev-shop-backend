-- Создаем таблицу cart если не существует
CREATE TABLE IF NOT EXISTS cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    product_id INTEGER REFERENCES products(product_id),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    selected_memory VARCHAR(50),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, selected_memory)
);

-- Создаем таблицу favorites если не существует
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    product_id INTEGER REFERENCES products(product_id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Создаем индексы
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Проверяем
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;