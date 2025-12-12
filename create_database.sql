--
-- Файл: create_database.sql
-- Создает базу данных и схему для проекта L-U-N-E-V
--
-- 1. Создание БД (выполняется через bat-скрипт)
-- CREATE DATABASE shop_lunev;
-- \c shop_lunev;

-- 2. Создание основных таблиц
-- Пользователи (Users)
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Категории (Categories)
CREATE TABLE IF NOT EXISTS categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Товары (Products) - Базовая версия
CREATE TABLE IF NOT EXISTS products (
    product_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category_id INTEGER REFERENCES categories(category_id),
    bonus_points INTEGER DEFAULT 0,
    main_image VARCHAR(255),
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0)
);


-- 3. Добавление столбцов с массивами (из add_columns.sql.txt)
-- Это столбцы для гибких опций
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS memory_options TEXT[],
ADD COLUMN IF NOT EXISTS delivery_options TEXT[],
ADD COLUMN IF NOT EXISTS color_options VARCHAR(100);


-- 4. Создание таблиц Корзина и Избранное (из create_missing_tables.sql.txt)

-- Корзина (Cart)
CREATE TABLE IF NOT EXISTS cart (
    cart_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    selected_memory VARCHAR(50),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id, selected_memory)
);

-- Избранное (Favorites)
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);


-- 5. Создание таблиц Заказы и Элементы заказа (для полноты)
-- Заказы (Orders)
CREATE TABLE IF NOT EXISTS orders (
    order_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE SET NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status VARCHAR(50) DEFAULT 'New', -- New, Processing, Shipped, Delivered, Canceled
    shipping_address TEXT
);

-- Элементы заказа (Order Items)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(product_id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    selected_memory VARCHAR(50)
);