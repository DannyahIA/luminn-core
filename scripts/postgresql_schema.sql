-- PostgreSQL Schema for Bank Hub
-- Converted from SQLite/SQLAlchemy models

-- Drop tables if they exist (reverse order to handle foreign keys)
DROP TABLE IF EXISTS transaction CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS bank_item CASCADE;
DROP TABLE IF EXISTS bank_data CASCADE;
DROP TABLE IF EXISTS bank_account CASCADE;
DROP TABLE IF EXISTS bank CASCADE;
DROP TABLE IF EXISTS pluggy_credentials CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create pluggy_credentials table
CREATE TABLE pluggy_credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    client_id VARCHAR(255),
    client_secret VARCHAR(255),
    base_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_pluggy_credentials_updated_at 
    BEFORE UPDATE ON pluggy_credentials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create bank table
CREATE TABLE bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_bank_updated_at 
    BEFORE UPDATE ON bank 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create bank_account table
CREATE TABLE bank_account (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bank_id UUID REFERENCES bank(id) ON DELETE CASCADE,
    account_id VARCHAR(255),
    type VARCHAR(100),
    balance DECIMAL(15,2),
    currency_code VARCHAR(3),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_bank_account_updated_at 
    BEFORE UPDATE ON bank_account 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create bank_data table
CREATE TABLE bank_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_account_id UUID REFERENCES bank_account(id) ON DELETE CASCADE,
    transfer_number VARCHAR(255),
    closing_balance DECIMAL(15,2),
    automatically_invested_balance DECIMAL(15,2),
    overdraft_contracted_limit DECIMAL(15,2),
    overdraft_used_limit DECIMAL(15,2),
    unarranged_overdraft_amount DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_bank_data_updated_at 
    BEFORE UPDATE ON bank_data 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create bank_item table
CREATE TABLE bank_item (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id UUID REFERENCES bank(id) ON DELETE CASCADE,
    name VARCHAR(255),
    status VARCHAR(100),
    execution_status VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_bank_item_updated_at 
    BEFORE UPDATE ON bank_item 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_item_id UUID REFERENCES bank_item(id) ON DELETE CASCADE,
    name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create transaction table
CREATE TABLE transaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_id UUID REFERENCES bank(id) ON DELETE CASCADE,
    type VARCHAR(100),
    amount DECIMAL(15,2),
    currency VARCHAR(3),
    description TEXT,
    transaction_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_transaction_updated_at 
    BEFORE UPDATE ON transaction 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_pluggy_credentials_user_id ON pluggy_credentials(user_id);
CREATE INDEX idx_bank_user_id ON bank(user_id);
CREATE INDEX idx_bank_account_user_id ON bank_account(user_id);
CREATE INDEX idx_bank_account_bank_id ON bank_account(bank_id);
CREATE INDEX idx_bank_data_bank_account_id ON bank_data(bank_account_id);
CREATE INDEX idx_bank_item_bank_id ON bank_item(bank_id);
CREATE INDEX idx_products_bank_item_id ON products(bank_item_id);
CREATE INDEX idx_transaction_bank_id ON transaction(bank_id);
CREATE INDEX idx_transaction_date ON transaction(transaction_date);
CREATE INDEX idx_transaction_type ON transaction(type);

-- Comments for documentation
COMMENT ON TABLE users IS 'Store user account information';
COMMENT ON TABLE pluggy_credentials IS 'Store Pluggy API credentials for users';
COMMENT ON TABLE bank IS 'Store bank information associated with users';
COMMENT ON TABLE bank_account IS 'Store bank account details';
COMMENT ON TABLE bank_data IS 'Store additional bank account data';
COMMENT ON TABLE bank_item IS 'Store bank item information';
COMMENT ON TABLE products IS 'Store bank product information';
COMMENT ON TABLE transaction IS 'Store financial transactions';

-- Sample data for testing (optional)
/*
INSERT INTO users (name, email, password, phone_number) VALUES 
('João Silva', 'joao@email.com', 'hashed_password_here', '+5511999999999');

INSERT INTO bank (user_id, name) VALUES 
((SELECT id FROM users WHERE email = 'joao@email.com'), 'Banco do Brasil');
*/
