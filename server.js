const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Используем JS-версию
const { Pool } = require('pg');

const app = express();
const PORT = 3002; // Используем порт 3002 вместо 3001

// ============ НАСТРОЙКА CORS ============
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());


// ============ ПОДКЛЮЧЕНИЕ К POSTGRESQL (для Render/Supabase) ============
const pool = new Pool({
  // Используем переменную окружения DATABASE_URL, которую мы настроим на Render.
  // Пока для локального теста используем ваш URI от Supabase
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:123123@db.wwmcuczirexqddyxysus.supabase.co:5432/postgres',
  ssl: {
    // Эта настройка обязательна для работы с Supabase
    rejectUnauthorized: false 
  }
});

// ============ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ============

// Функция для преобразования PostgreSQL массивов
function parsePostgresArray(pgArray) {
  if (!pgArray) return [];
  if (Array.isArray(pgArray)) return pgArray;
  
  const str = String(pgArray);
  if (str.startsWith('{') && str.endsWith('}')) {
    return str.slice(1, -1).split(',').map(item => item.trim().replace(/"/g, ''));
  }
  return [];
}

// ============ API ЭНДПОИНТЫ ============

// 1. Тест сервера
app.get('/api/test', async (req, res) => {
  res.json({ 
    status: 'success', 
    message: '✅ Сервер работает!',
    port: PORT,
    time: new Date().toISOString()
  });
});

// 2. Регистрация пользователя
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Заполните все обязательные поля' 
      });
    }
    
    // Проверяем существование пользователя
    const checkUser = await pool.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email]
    );
    
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Пользователь с таким email уже существует' 
      });
    }
    
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    const username = email.split('@')[0];
    
    // Создание пользователя
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name, phone) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING user_id, username, email, first_name, last_name, phone`,
      [username, email, hashedPassword, firstName, lastName, phone || '']
    );
    
    res.json({
      status: 'success',
      message: 'Регистрация успешна!',
      user: {
        id: newUser.rows[0].user_id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email,
        firstName: newUser.rows[0].first_name,
        lastName: newUser.rows[0].last_name,
        phone: newUser.rows[0].phone
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// 3. Вход пользователя
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Введите email и пароль' 
      });
    }
    
    // Поиск пользователя
    const userResult = await pool.query(
      `SELECT user_id, username, email, password_hash, first_name, last_name, phone 
       FROM users WHERE email = $1`,
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Пользователь не найден' 
      });
    }
    
    const user = userResult.rows[0];
    
    // Проверка пароля
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ 
        status: 'error', 
        message: 'Неверный пароль' 
      });
    }
    
    res.json({
      status: 'success',
      message: 'Вход выполнен',
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone
      }
    });
    
  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Внутренняя ошибка сервера' 
    });
  }
});

// 4. Получение всех товаров
app.get('/api/products', async (req, res) => {
  try {
// В маршруте /api/products (Строка ~178)
    const result = await pool.query(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.id // <-- ИСПРАВЛЕНИЕ: ДОЛЖНО БЫТЬ p.id
    `);

    // Преобразуем массивы
    const products = result.rows.map(product => ({
      ...product,
      // images, memory_options, delivery_options - удалены, т.к. их нет в БД
      price: parseFloat(product.price)
    }));

    res.json({
      status: 'success',
      count: products.length,
      products: products
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения товаров:', error);
    res.json({ 
      status: 'success', 
      count: 0,
      products: []
    });
  }
});

// 5. Получение товара по ID
app.get('/api/product-by-id/:id', async (req, res) => {
  try {
    const { id } = req.params;
const result = await pool.query(` // <-- Убедитесь, что здесь нет невидимых символов
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = $1
    `,[id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Товар не найден'
      });
    }
    
    const product = result.rows[0];
    
    // Преобразуем только существующие поля:
    product.price = parseFloat(product.price);
    
    if (product.bonus_points > 0) {
      product.bonus = `+${product.bonus_points.toLocaleString('ru-RU')} бонусов`;
    }
    
    res.json({
      status: 'success',
      product: product
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения товара:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ошибка получения товара' 
    });
  }
});

// 6. Добавление в корзину
app.post('/api/cart/add-item', async (req, res) => {
  try {
    const { userId, productId, quantity = 1, selectedMemory = null } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Не указан userId или productId' 
      });
    }
    
    // Проверяем существование товара
    const productCheck = await pool.query(
      'SELECT product_id FROM products WHERE product_id = $1',
      [productId]
    );
    
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Товар не найден' 
      });
    }
    
    // Проверяем, есть ли уже в корзине
    const existingItem = await pool.query(
      'SELECT cart_id, quantity FROM cart WHERE user_id = $1 AND product_id = $2 AND selected_memory = $3',
      [userId, productId, selectedMemory]
    );
    
    if (existingItem.rows.length > 0) {
      // Обновляем количество
      const newQuantity = existingItem.rows[0].quantity + quantity;
      await pool.query(
        'UPDATE cart SET quantity = $1 WHERE cart_id = $2',
        [newQuantity, existingItem.rows[0].cart_id]
      );
    } else {
      // Добавляем новый товар
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity, selected_memory) VALUES ($1, $2, $3, $4)',
        [userId, productId, quantity, selectedMemory]
      );
    }
    
    res.json({
      status: 'success',
      message: 'Товар добавлен в корзину'
    });
    
  } catch (error) {
    console.error('❌ Ошибка добавления в корзину:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ошибка добавления в корзину' 
    });
  }
});

// 7. Получение корзины пользователя
app.get('/api/cart/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        c.cart_id, 
        c.user_id, 
        c.product_id, 
        c.quantity, 
        c.selected_memory,
        c.added_at,
        p.name, 
        p.price, 
        p.main_image, 
        p.color_options
      FROM cart c 
      JOIN products p ON c.product_id = p.product_id 
      WHERE c.user_id = $1
      ORDER BY c.added_at DESC
    `, [userId]);
    
    // Преобразуем цену
    const cartItems = result.rows.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }));
    
    res.json({
      status: 'success',
      cart: cartItems
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения корзины:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ошибка получения корзины',
      cart: []
    });
  }
});

// 8. Обновление количества в корзине
app.put('/api/cart/update-quantity', async (req, res) => {
  try {
    const { userId, productId, quantity, selectedMemory } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Не указаны параметры' 
      });
    }
    
    if (quantity <= 0) {
      // Удаляем товар
      await pool.query(
        'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 AND selected_memory = $3',
        [userId, productId, selectedMemory || null]
      );
      return res.json({ status: 'success', message: 'Товар удален' });
    }
    
    // Обновляем количество
    await pool.query(
      'UPDATE cart SET quantity = $1 WHERE user_id = $2 AND product_id = $3 AND selected_memory = $4',
      [quantity, userId, productId, selectedMemory || null]
    );
    
    res.json({
      status: 'success',
      message: 'Количество обновлено'
    });
    
  } catch (error) {
    console.error('❌ Ошибка обновления количества:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ошибка обновления количества' 
    });
  }
});

// 9. Удаление из корзины
app.delete('/api/cart/remove-item', async (req, res) => {
  try {
    const { userId, productId, selectedMemory } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Не указаны параметры' 
      });
    }
    
    await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 AND selected_memory = $3',
      [userId, productId, selectedMemory || null]
    );
    
    res.json({
      status: 'success',
      message: 'Товар удален из корзины'
    });
    
  } catch (error) {
    console.error('❌ Ошибка удаления из корзины:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ошибка удаления из корзины' 
    });
  }
});

// 10. Работа с избранным
app.post('/api/favorites/add-item', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Не указан userId или productId' 
      });
    }
    
    // Проверяем, не добавлено ли уже
    const existing = await pool.query(
      'SELECT favorite_id FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    
    if (existing.rows.length > 0) {
      return res.json({ 
        status: 'success', 
        message: 'Товар уже в избранном' 
      });
    }
    
    await pool.query(
      'INSERT INTO favorites (user_id, product_id) VALUES ($1, $2)',
      [userId, productId]
    );
    
    res.json({
      status: 'success',
      message: 'Товар добавлен в избранное'
    });
    
  } catch (error) {
    console.error('❌ Ошибка добавления в избранное:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ошибка добавления в избранное' 
    });
  }
});

app.get('/api/favorites/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT f.favorite_id, f.user_id, f.product_id, f.added_at,
             p.name, p.price, p.main_image
      FROM favorites f 
      JOIN products p ON f.product_id = p.product_id 
      WHERE f.user_id = $1
      ORDER BY f.added_at DESC
    `, [userId]);
    
    res.json({
      status: 'success',
      favorites: result.rows.map(item => ({
        ...item,
        price: parseFloat(item.price)
      }))
    });
    
  } catch (error) {
    console.error('❌ Ошибка получения избранного:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ошибка получения избранного',
      favorites: []
    });
  }
});

app.delete('/api/favorites/remove-item', async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    if (!userId || !productId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Не указаны параметры' 
      });
    }
    
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );
    
    res.json({
      status: 'success',
      message: 'Товар удален из избранного'
    });
    
  } catch (error) {
    console.error('❌ Ошибка удаления из избранного:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ошибка удаления из избранного' 
    });
  }
});

// ============ ЗАПУСК СЕРВЕРА ============
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('📊 Основные эндпоинты:');
  console.log(`   GET  http://localhost:${PORT}/api/test`);
  console.log(`   POST http://localhost:${PORT}/api/register`);
  console.log(`   POST http://localhost:${PORT}/api/login`);
  console.log(`   GET  http://localhost:${PORT}/api/products`);
  console.log(`   GET  http://localhost:${PORT}/api/product-by-id/:id`);
  console.log(`   GET  http://localhost:${PORT}/api/cart/user/:userId`);
  console.log('='.repeat(60));
});