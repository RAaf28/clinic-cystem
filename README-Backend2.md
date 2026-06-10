## Fitur Utama yang Diimplementasikan

Berikut adalah rincian fungsionalitas dan logika pada tiap modul yang telah diselesaikan:

### 1. Modul Departemen (`departmentController.js` & `departmentRoutes.js`)
- **Fitur:** CRUD data departemen (Poli klinik).
- **Logika Caching:** Menggunakan `node-cache` dengan key `all_departments` dan TTL 600 detik (10 menit) untuk endpoint `GET /api/departments`. Cache otomatis di-invalidate (dihapus) setiap kali ada aksi *create*, *update*, atau *delete*.
- **Role Akses:** Hanya `Admin` yang dapat melakukan operasi CUD (Create, Update, Delete). Read (`GET`) bersifat public.

### 2. Modul Dokter (`doctorController.js` & `doctorRoutes.js`)
- **Fitur:** CRUD data dokter.
- **Logika Relasi:** Pengambilan data akan otomatis di-JOIN dengan tabel `departments` untuk menampilkan nama departemen (`department_name`).
- **Logika Caching:** Menggunakan key `all_doctors` dengan TTL 300 detik.
- **Role Akses:** Operasi *create*, *update*, *delete* hanya bisa dilakukan oleh `Admin`.

### 3. Modul Pasien (`patientController.js` & `patientRoutes.js`)
- **Fitur:** CRUD data pasien.
- **Logika Keamanan Akses:** Pasien hanya diperbolehkan melihat dan memperbarui data dirinya sendiri (divalidasi melalui perbandingan parameter ID dan `req.user.profileId`). Admin dan Dokter dapat melihat seluruh data.
- **Role Akses:** *Create* pasien secara manual dan *delete* dibatasi hanya untuk `Admin`.

### 4. Modul Janji Temu / Appointment (`appointmentController.js` & `appointmentRoutes.js`)
- **Fitur:** CRUD dan Manajemen Jadwal Konsultasi.
- **Logika Bisnis:**
  - Validasi bahwa tanggal dan waktu jadwal (`schedule_date`) tidak boleh berada di masa lalu.
  - Filter list: Pasien hanya melihat miliknya, Dokter hanya melihat janji temu di mana ia ditugaskan, Admin dapat melihat seluruhnya. Terdapat juga query filter opsional berdasarkan status dan tanggal.
- **Role Akses:** Pembuatan janji bisa oleh `Pasien` dan `Admin`. Update status janji temu (menjadi 'Selesai' atau 'Batal') dilakukan oleh `Dokter` dan `Admin`.

### 5. Modul Rekam Medis (`medicalRecordController.js` & `medicalRecordRoutes.js`)
- **Fitur:** CRUD Rekam Medis.
- **Logika Bisnis:**
  - Terintegrasi dengan Modul Appointment: Setelah rekam medis di-insert, status appointment terkait akan di-update otomatis menjadi `Selesai`.
  - Terintegrasi dengan Modul Pembayaran: Saat membuat rekam medis, otomatis men-trigger pembuatan entri pembayaran (`payments`) dengan `total_amount = 0` (yang nanti akan dijumlahkan berdasarkan resep).
- **Role Akses:** Hanya `Dokter` yang bisa melakukan *create* dan *update*. Pasien dapat melihat rekam medisnya sendiri via rute khusus `getByPatient`.

### 6. Modul Obat (`medicineController.js` & `medicineRoutes.js`)
- **Fitur:** Manajemen Katalog dan Stok Obat.
- **Logika Caching:** Menggunakan key `all_medicines` dengan TTL 300 detik.
- **Logika Bisnis:** Validasi proteksi penghapusan—memastikan obat yang sedang atau pernah diresepkan tidak dapat dihapus sembarangan tanpa pengecekan.
- **Role Akses:** CRUD oleh `Admin`. Semua role dapat membaca.

### 7. Modul Resep / Prescription (`prescriptionController.js` & `prescriptionRoutes.js`)
- **Fitur:** Manajemen Pemberian Resep Obat.
- **Logika Bisnis (Kritikal):**
  - **Manajemen Stok:** Saat resep dibuat, sistem otomatis mengurangi stok obat (`medicines.stock`) sebesar `quantity`. Validasi ketat dilakukan agar resep tidak bisa dibuat jika stok tidak mencukupi.
  - **Sinkronisasi Tagihan:** Setiap resep yang ditambahkan atau dihapus akan men-trigger kalkulasi ulang `total_amount` pada tabel `payments`. `total_amount` dihitung dari `SUM(quantity * price)`.
  - Saat resep dihapus, stok obat yang sudah dikurangi akan dikembalikan (`stock + quantity`).
- **Role Akses:** Khusus `Dokter`. Penghapusan diperbolehkan bagi `Dokter` dan `Admin`.

### 8. Modul Pembayaran / Payment (`paymentController.js` & `paymentRoutes.js`)
- **Fitur:** Manajemen Tagihan dan Dashboard Statistik.
- **Logika Bisnis:**
  - Status bayar dapat diubah dari `Belum Bayar` menjadi `Lunas`. Sistem otomatis menyimpan waktu pembayaran pada `paid_at`.
  - **Dashboard Stats:** Endpoint khusus untuk *Admin* yang menghitung dan me-return total pendapatan, total transaksi, dan transaksi di bulan berjalan.
  - **Caching:** Query statistik dashboard yang berat di-cache menggunakan key `dashboard_stats` dengan TTL 120 detik.
- **Role Akses:** Pengubahan status dan akses statistik dikhususkan untuk `Admin`.

### 9. Modul Manajemen User (`userController.js` & `userRoutes.js`)
- **Fitur:** Manajemen Akun Sistem (Backend).
- **Logika Bisnis:**
  - Memastikan *Admin* tidak bisa tidak sengaja menghapus akunnya sendiri (mengecek `req.user.id !== params.id`).
  - Response array list user mem-filter dan menghilangkan field password demi keamanan.
- **Role Akses:** Seluruh operasi dibatasi secara ketat hanya untuk `Admin`.

## Implementasi Routing & Integrasi
Setiap modul di atas telah dilengkapi dengan file routes tersendiri (`*Routes.js`). Route-route ini telah di-*mount* ke aplikasi utama di `backend/app.js` bersamaan dengan injeksi middleware keamanan, yaitu `verifyToken` untuk memastikan sesi valid via JWT, dan `allowRoles(...)` untuk membatasi aksi spesifik terhadap role tertentu (seperti Admin atau Dokter). Semua telah diuji dan memenuhi format response standar.
