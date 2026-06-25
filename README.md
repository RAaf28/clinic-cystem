# Clynic — Sistem Informasi Manajemen Klinik

Aplikasi web full-stack untuk manajemen operasional klinik, mencakup janji temu, rekam medis, resep, pembayaran, dan manajemen pengguna berbasis role.

---

## Tech Stack

| Layer       | Teknologi                                        |
| ----------- | ------------------------------------------------ |
| Frontend    | React 19, Vite 8, Tailwind CSS 4, React Router 7 |
| Backend     | Node.js, Express 4                               |
| Database    | MySQL                                            |
| Auth        | JWT + bcryptjs                                   |
| Caching     | node-cache                                       |
| HTTP Client | Axios                                            |
| Export      | xlsx (XLS), jsPDF + jspdf-autotable (PDF)        |

---

## Struktur Project

```
clinic-cystem/
├── backend/
│   ├── server.js
│   └── src/
│       ├── config/        # DB & cache config
│       ├── controllers/   # Business logic
│       ├── middleware/     # Auth, role guard
│       ├── routes/        # API routes
│       └── utils/         # Response helpers
└── frontend/
    └── src/
        ├── api/           # Axios instance & API calls
        ├── components/    # Shared UI components & layout
        ├── context/       # Auth, Appointment, MedicalRecord context
        ├── pages/         # Halaman per fitur
        └── utils/         # Format currency, date
```

---

## Role & Akses

| Fitur       | Admin | Dokter | Pasien |
| ----------- | :---: | :----: | :----: |
| Dashboard   |   v   |   -    |   -    |
| Janji Temu  |   v   |   v    |   v    |
| Pasien      |   v   |   v    |   -    |
| Dokter      |   v   |   -    |   -    |
| Rekam Medis |   v   |   v    |   -    |
| Resep       |   v   |   v    |   -    |
| Obat        |   v   |   -    |   -    |
| Pembayaran  |   v   |   -    |   -    |
| Profil      |   v   |   v    |   v    |

---

## Instalasi & Setup

### Prasyarat

- Node.js >= 18
- MySQL >= 8

### 1. Clone repository

```bash
git clone https://github.com/RAaf28/clinic-cystem.git
cd clinic-cystem
git checkout develop
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=klinik_db

JWT_SECRET=your_jwt_secret
PORT=5000
```

Jalankan backend:

```bash
npm run dev   # development (nodemon)
npm start     # production
```

### 3. Setup Frontend

```bash
cd frontend
npm install
```

Buat file `.env` di folder `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Jalankan frontend:

```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

---

## API Endpoints

### Auth

| Method | Endpoint                    | Akses     |
| ------ | --------------------------- | --------- |
| POST   | `/api/auth/login`           | Public    |
| POST   | `/api/auth/register`        | Public    |
| GET    | `/api/auth/me`              | All roles |
| PUT    | `/api/auth/profile`         | All roles |
| PUT    | `/api/auth/change-password` | All roles |

### Appointments

| Method | Endpoint                       | Akses         |
| ------ | ------------------------------ | ------------- |
| GET    | `/api/appointments`            | All roles     |
| POST   | `/api/appointments`            | Admin, Pasien |
| PUT    | `/api/appointments/:id/status` | Admin, Dokter |
| DELETE | `/api/appointments/:id`        | Admin         |

### Medical Records

| Method | Endpoint                           | Akses                 |
| ------ | ---------------------------------- | --------------------- |
| GET    | `/api/medical-records`             | Admin, Dokter         |
| GET    | `/api/medical-records/patient/:id` | Admin, Dokter, Pasien |
| POST   | `/api/medical-records`             | Dokter                |
| PUT    | `/api/medical-records/:id`         | Dokter                |

### Payments

| Method | Endpoint                   | Akses |
| ------ | -------------------------- | ----- |
| GET    | `/api/payments`            | Admin |
| GET    | `/api/payments/stats`      | Admin |
| PUT    | `/api/payments/:id/status` | Admin |

### Medicines

| Method | Endpoint             | Akses     |
| ------ | -------------------- | --------- |
| GET    | `/api/medicines`     | All roles |
| POST   | `/api/medicines`     | Admin     |
| PUT    | `/api/medicines/:id` | Admin     |
| DELETE | `/api/medicines/:id` | Admin     |

---

## Fitur Utama

- Autentikasi dengan JWT, password di-hash dengan bcrypt
- Role-based access — tampilan dan akses menu disesuaikan per role
- Dashboard admin dengan statistik real-time: pendapatan, transaksi, stok obat menipis, status dokter
- Generate laporan PDF ringkasan dashboard langsung dari browser
- Export data pembayaran ke Excel dengan filter status
- Sidebar collapsible dengan animasi smooth
- Pencarian janji temu berdasarkan nama pasien, dokter, atau ID
- Stok obat otomatis berkurang dan bertambah saat resep dibuat atau dihapus
- Entry pembayaran otomatis dibuat saat rekam medis selesai dibuat
- Response obat dan dokter di-cache di backend (5-10 menit)

---

## Build Production

```bash
cd frontend
npm run build
# Output ada di frontend/dist/
```

---

## Lisensi

Dibuat untuk keperluan UAS mata kuliah Web Lanjutan — Universitas Pembangunan Nasional "Veteran" Jakarta.
