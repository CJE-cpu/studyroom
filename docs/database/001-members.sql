-- Run in MySQL Workbench with a database-administration account.
-- This script creates only the database/table; it does not drop existing data.
CREATE DATABASE IF NOT EXISTS studyroom
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studyroom;

CREATE TABLE IF NOT EXISTS members (
  id BIGINT NOT NULL AUTO_INCREMENT,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(40) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  CONSTRAINT uk_members_email UNIQUE (email),
  CONSTRAINT ck_members_role CHECK (role IN ('USER', 'ADMIN'))
);
