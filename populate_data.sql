-- Заполнение категорий
INSERT INTO categories (name, slug, description) VALUES
('Смартфоны', 'telephone', 'Современные смартфоны и гаджеты'),
('Игровые консоли', 'consoles', 'Игровые приставки и аксессуары'),
('Наушники', 'headphone', 'Наушники и аудиотехника'),
('Портативные консоли', 'port-consoles', 'Портативные игровые устройства'),
('Техника для дома', 'washmashine', 'Бытовая техника');

-- Добавление тестового пользователя (пароль: password123)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone) 
VALUES ('ivanov', 'ivan@example.com', '$2b$10$K7VqH8lB2ZQ2VQ8W7XwZ9eJ1K2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6', 'Иван', 'Иванов', '+79151234567');

-- Добавление нескольких товаров
INSERT INTO products (name, description, price, category_id, bonus_points, main_image, stock_quantity) VALUES
('iPhone 14 Pro', 'Смартфон Apple', 99990.00, 1, 10000, 'products/buy/telephone/iphone/1.jpg', 50),
('PlayStation 5', 'Игровая консоль', 59990.00, 2, 12000, 'products/buy/consoles/playstation/1.jpg', 30),
('AirPods Pro 3', 'Наушники Apple', 24990.00, 3, 2500, 'products/buy/headphones/airpods3/4.jpg', 100);