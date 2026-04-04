CREATE TABLE IF NOT EXISTS t_p72512250_neighbor_help_app_1.masters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    rating NUMERIC(2,1) DEFAULT 5.0,
    reviews_count INTEGER DEFAULT 0,
    price_from INTEGER DEFAULT 500,
    avatar VARCHAR(10) DEFAULT '🔧',
    verified BOOLEAN DEFAULT false,
    badge VARCHAR(50) DEFAULT ''
);

INSERT INTO t_p72512250_neighbor_help_app_1.masters (name, specialty, rating, reviews_count, price_from, avatar, verified, badge) VALUES
('Андрей Петров', 'Сантехник', 4.9, 127, 800, '🔧', true, 'Топ мастер'),
('Ольга Смирнова', 'Электрик', 4.8, 89, 600, '⚡', true, ''),
('Дмитрий Козлов', 'Мастер ремонта', 4.7, 214, 1200, '🔨', true, 'Проверен'),
('Мария Иванова', 'Садовод', 5.0, 43, 500, '🌿', false, '');

CREATE TABLE IF NOT EXISTS t_p72512250_neighbor_help_app_1.orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p72512250_neighbor_help_app_1.users(id),
    master_id INTEGER NOT NULL REFERENCES t_p72512250_neighbor_help_app_1.masters(id),
    service_description TEXT NOT NULL,
    scheduled_date DATE,
    scheduled_time VARCHAR(10),
    status VARCHAR(20) DEFAULT 'new',
    price_estimate INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON t_p72512250_neighbor_help_app_1.orders(user_id);
