-- Добавляем недостающие колонки в таблицу products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS memory_options TEXT[],
ADD COLUMN IF NOT EXISTS delivery_options TEXT[],
ADD COLUMN IF NOT EXISTS color_options VARCHAR(100);

-- Проверяем
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;