-- ============================================
-- Sistem Informasi Klinik - Seeder Data Awal
-- Jalankan setelah schema.sql
-- ============================================
USE klinik_db;
-- Insert 3 roles
INSERT INTO roles (name) VALUES
  ('Admin'),
  ('Dokter'),
  ('Pasien');
-- Insert 1 user Admin
-- Email: admin@klinik.com | Password: admin123
INSERT INTO users (role_id, email, password) VALUES
  (1, 'admin@klinik.com', '$2a$10$ilUbGsRYjJzPU6KGYufpWufN3wtrAOF1MCtrQ0BQWO0lMjODUgpda');
-- Insert 3 departments
INSERT INTO departments (name, description) VALUES
  ('Poli Umum', 'Pelayanan kesehatan umum untuk pasien dewasa dan anak'),
  ('Poli Gigi', 'Pelayanan kesehatan gigi dan mulut'),
  ('Poli Anak', 'Pelayanan kesehatan khusus anak-anak');
-- Insert 5 medicines
INSERT INTO medicines (name, price, stock) VALUES
  ('Paracetamol 500mg', 5000.00, 100),
  ('Amoxicillin 500mg', 12000.00, 50),
  ('Ibuprofen 400mg', 8000.00, 75),
  ('Cetirizine 10mg', 7500.00, 60),
  ('Omeprazole 20mg', 15000.00, 40);
