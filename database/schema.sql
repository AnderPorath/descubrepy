-- PostgreSQL schema for DescubrePY
-- Estructura de tablas (sin datos). Para datos iniciales, ver database/seed.sql

BEGIN;

DROP TABLE IF EXISTS user_favorites;
DROP TABLE IF EXISTS business_subcategories;
DROP TABLE IF EXISTS business_categories;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS cities;
DROP TABLE IF EXISTS users;

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  city VARCHAR(120) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT uk_city UNIQUE (city)
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(80) NOT NULL,
  title VARCHAR(120) NOT NULL,
  description TEXT,
  icon_name VARCHAR(60),
  business_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT uk_category_slug UNIQUE (slug)
);

CREATE TABLE subcategories (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  slug VARCHAR(80) NOT NULL,
  title VARCHAR(120) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT uk_category_subslug UNIQUE (category_id, slug),
  CONSTRAINT fk_subcat_category
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_user_email UNIQUE (email)
);

CREATE TABLE businesses (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  subcategory_id INTEGER,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  location VARCHAR(255),
  city VARCHAR(120) NOT NULL,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  description TEXT,
  phone VARCHAR(64),
  instagram_url VARCHAR(500),
  opening_hours TEXT,
  menu_services TEXT,
  image_url VARCHAR(500),
  gallery_images JSONB,
  rating NUMERIC(2, 1),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  discount_percent INTEGER NOT NULL DEFAULT 0,
  discount_coupon_url VARCHAR(500),
  monthly_amount INTEGER NOT NULL DEFAULT 0,
  plan VARCHAR(80) NOT NULL DEFAULT 'Estándar',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_business_slug UNIQUE (slug),
  CONSTRAINT fk_business_category
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_business_subcategory
    FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE SET NULL
);

CREATE INDEX idx_business_category ON businesses (category_id);
CREATE INDEX idx_business_subcategory ON businesses (subcategory_id);
CREATE INDEX idx_business_city ON businesses (city);

CREATE TABLE business_categories (
  business_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (business_id, category_id),
  CONSTRAINT fk_bc_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  CONSTRAINT fk_bc_category
    FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
);

CREATE INDEX idx_bc_business ON business_categories (business_id);
CREATE INDEX idx_bc_category ON business_categories (category_id);

CREATE TABLE business_subcategories (
  business_id INTEGER NOT NULL,
  subcategory_id INTEGER NOT NULL,
  PRIMARY KEY (business_id, subcategory_id),
  CONSTRAINT fk_bsub_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  CONSTRAINT fk_bsub_subcategory
    FOREIGN KEY (subcategory_id) REFERENCES subcategories (id) ON DELETE CASCADE
);

CREATE INDEX idx_bsub_sub ON business_subcategories (subcategory_id);
CREATE INDEX idx_bsub_biz ON business_subcategories (business_id);

CREATE TABLE user_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  business_id INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_user_business UNIQUE (user_id, business_id),
  CONSTRAINT fk_fav_user
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_fav_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE INDEX idx_fav_user ON user_favorites (user_id);
CREATE INDEX idx_fav_business ON user_favorites (business_id);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  amount INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pagado', 'pendiente', 'vencido', 'no_corresponde')),
  payment_date DATE,
  payment_method VARCHAR(64),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uk_payment_business_year_month UNIQUE (business_id, year, month),
  CONSTRAINT fk_payment_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_business ON payments (business_id);
CREATE INDEX idx_payments_year_month ON payments (year, month);
CREATE INDEX idx_payments_status ON payments (status);

CREATE TABLE payment_history (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  admin_user_id INTEGER,
  admin_name VARCHAR(160),
  action VARCHAR(80) NOT NULL,
  details TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ph_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_history_business ON payment_history (business_id);
CREATE INDEX idx_payment_history_created ON payment_history (created_at DESC);

CREATE TABLE business_events (
  id BIGSERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  event_type VARCHAR(40) NOT NULL
    CHECK (event_type IN (
      'profile_view',
      'whatsapp_click',
      'phone_click',
      'instagram_click',
      'share_click',
      'coupon_claim',
      'coupon_used'
    )),
  session_id VARCHAR(64),
  user_ip VARCHAR(64),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_be_business
    FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
);

CREATE INDEX idx_be_business ON business_events (business_id);
CREATE INDEX idx_be_type ON business_events (event_type);
CREATE INDEX idx_be_created ON business_events (created_at DESC);
CREATE INDEX idx_be_business_type_created ON business_events (business_id, event_type, created_at DESC);

COMMIT;

