-- ============================================================
-- Payment Service Database Migration
-- Database: db_payment_service (PostgreSQL)
-- ============================================================

-- Tabel metode pembayaran
CREATE TABLE IF NOT EXISTS payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel pembayaran
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    order_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    payment_method_id INT REFERENCES payment_methods(id) ON DELETE SET NULL,
    amount DECIMAL(14,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    paid_at TIMESTAMP WITH TIME ZONE NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk query yang sering digunakan
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Seed data metode pembayaran
INSERT INTO payment_methods (name, code) VALUES
    ('Bank Transfer', 'bank_transfer'),
    ('E-Wallet (GoPay)', 'gopay'),
    ('E-Wallet (OVO)', 'ovo'),
    ('E-Wallet (DANA)', 'dana'),
    ('Credit Card', 'credit_card'),
    ('Cash on Delivery', 'cod')
ON CONFLICT (code) DO NOTHING;
