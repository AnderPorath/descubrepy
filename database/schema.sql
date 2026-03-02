-- PostgreSQL schema for DescubrePY
-- Estructura de tablas (sin datos). Para datos iniciales, ver database/seed.sql

BEGIN;

DROP TABLE IF EXISTS user_favorites;
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

COMMIT;

