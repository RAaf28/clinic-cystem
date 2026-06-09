-- ============================================
-- Sistem Informasi Klinik - Database Schema
-- ============================================
CREATE DATABASE IF NOT EXISTS klinik_db;
USE klinik_db;
-- 1. roles
CREATE TABLE roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name ENUM('Admin', 'Dokter', 'Pasien') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2. users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  role_id INT NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);
-- 3. departments
CREATE TABLE departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 4. doctors
CREATE TABLE doctors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  department_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
-- 5. patients
CREATE TABLE patients (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
-- 6. appointments
CREATE TABLE appointments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  schedule_date DATETIME NOT NULL,
  status ENUM('Pending', 'Selesai', 'Batal') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);
-- 7. medical_records
CREATE TABLE medical_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT UNIQUE NOT NULL,
  diagnosis TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);
-- 8. medicines
CREATE TABLE medicines (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 9. prescriptions
CREATE TABLE prescriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  medical_record_id INT NOT NULL,
  medicine_id INT NOT NULL,
  quantity INT NOT NULL,
  dosage VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  FOREIGN KEY (medicine_id) REFERENCES medicines(id)
);
-- 10. payments
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  appointment_id INT UNIQUE NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  payment_status ENUM('Belum Bayar', 'Lunas') DEFAULT 'Belum Bayar',
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
);