# ERP System

ERP System adalah aplikasi web berbasis **FastAPI**, **Next.js**, dan **PostgreSQL** yang dibuat untuk membantu mengelola alur operasional bisnis percetakan/manufaktur, mulai dari order produksi, penjualan, invoice, piutang, hingga pencatatan pembayaran bank.

Project ini dirancang agar dapat digunakan dalam dua mode:

1. **Online** untuk demo, testing, dan deployment sementara.
2. **Offline / Local LAN** untuk penggunaan akhir di server lokal milik client.

Aplikasi ini tidak bergantung permanen pada layanan cloud tertentu. Konfigurasi API dan database menggunakan environment variables agar mudah dipindahkan dari cloud ke server lokal.

---

## Project Goals

Tujuan utama project ini adalah membangun sistem ERP sederhana namun fungsional yang mengikuti alur kerja client berdasarkan dokumen Excel operasional yang sudah digunakan sebelumnya.

Fokus utama aplikasi:

- Mengurangi pencatatan manual di Excel.
- Membantu pencatatan order produksi.
- Mengelola data penjualan 103.
- Membuat dan mencetak Invoice 103.
- Mengelola piutang melalui BKPt.
- Mencatat pembayaran melalui Bank 103.
- Menghubungkan pembayaran bank dengan piutang secara lebih aman.
- Menyediakan aplikasi yang bisa berjalan online maupun offline di jaringan lokal.

---

## Main Business Flow

Alur utama sistem:

```text
BKOrder
→ Sales 103
→ Invoice 103
→ BKPt
→ Bank 103
→ Update BKPt Payment Status
```

Penjelasan singkat:

1. **BKOrder**  
   Digunakan untuk mencatat order produksi dari customer.

2. **Sales 103**  
   Digunakan untuk mencatat data penjualan berdasarkan order dan pengiriman.

3. **Invoice 103**  
   Digunakan untuk melihat, mengelola, dan mencetak invoice berdasarkan data Sales 103.

4. **BKPt**  
   Digunakan sebagai buku piutang untuk mencatat tagihan customer.

5. **Bank 103**  
   Digunakan untuk mencatat pembayaran masuk dari bank dan mencocokkannya dengan data BKPt.

---

## Features

### Authentication

- Login user.
- Session handling.
- Environment-based API configuration.
- Planned role-based access control for admin, supervisor, and owner.

---

### BKOrder

BKOrder digunakan untuk mencatat order produksi.

Fitur utama:

- Input order produksi.
- Satu nomor order dapat memiliki beberapa item.
- Data mengikuti format kerja client.
- Support satuan RIM dan KEPING.
- Perhitungan kebutuhan bahan berdasarkan ukuran bahan dan ukuran produk.
- Pencarian dan pemilihan bahan.
- Filter data berdasarkan bulan dan tahun.
- Import data dari Excel.
- Preview data sebelum import.
- Validasi data sebelum commit ke database.

---

### Sales 103

Sales 103 digunakan untuk mencatat data penjualan.

Fitur utama:

- CRUD data penjualan.
- Generate nomor invoice otomatis.
- Nomor invoice menggunakan format seperti:

```text
LOI.0001
LOI.0002
```

- Nomor invoice reset berdasarkan bulan.
- Mendukung beberapa baris data untuk satu nomor invoice.
- Terintegrasi dengan Invoice 103.

---

### Invoice 103

Invoice 103 digunakan untuk monitoring dan cetak invoice.

Fitur utama:

- Halaman monitoring invoice.
- Detail invoice berdasarkan nomor invoice.
- Cetak invoice mengikuti referensi format client.
- Mendukung satu invoice berisi beberapa PO/order.
- Data invoice bersumber dari Sales 103.
- Finalisasi invoice ke BKPt.
- Pencegahan duplikasi finalisasi invoice.

---

### BKPt

BKPt digunakan untuk mengelola piutang customer.

Fitur utama:

- Menampilkan data piutang.
- Data dapat dibuat dari finalisasi Invoice 103.
- Menampilkan status pembayaran.
- Terhubung dengan Bank 103.
- Mendukung update pembayaran berdasarkan transaksi bank.

---

### Bank 103

Bank 103 digunakan untuk mencatat transaksi bank dan menghubungkannya ke piutang.

Fitur utama:

- Input transaksi bank.
- Deteksi pembayaran masuk.
- Auto matching pembayaran ke BKPt.
- Manual allocation melalui fitur Ambil Bank 103.
- Validasi agar pembayaran tidak salah masuk invoice.
- Pencegahan transaksi bank digunakan lebih dari satu kali.

Aturan auto matching:

- Kode transaksi harus `BkPt`.
- Nilai `DEBET` harus lebih dari 0.
- Transaksi belum pernah digunakan.
- Nomor invoice harus cocok.
- Tidak melakukan forced match jika data ambigu.
- Tidak boleh melebihi outstanding piutang.

---

## Tech Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PostgreSQL
- Uvicorn
- Alembic
- CORS Middleware

### Frontend

- Next.js
- TypeScript
- React
- Tailwind CSS
- Axios

### Database

- PostgreSQL
- Local PostgreSQL for offline/local development
- Neon PostgreSQL for online demo/testing

### Deployment

- Frontend: Vercel
- Backend: Google Cloud Run
- Database: Neon for online demo
- Final client deployment: local server / LAN server

---

## Project Architecture

Project ini menggunakan pemisahan frontend dan backend.

```text
erp-system/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── database/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── services/
│   ├── types/
│   ├── lib/
│   ├── package.json
│   └── .env.local
│
└── README.md
```

---

## Backend Structure

Backend menggunakan pola modular agar lebih mudah dirawat.

```text
routes → services → repositories → database
```

Penjelasan:

- **routes**  
  Menangani HTTP request dan response.

- **services**  
  Menyimpan business logic dan validasi utama.

- **repositories**  
  Menangani query database.

- **models**  
  Menyimpan SQLAlchemy database models.

- **schemas**  
  Menyimpan Pydantic schemas untuk request dan response.

---

## Frontend Structure

Frontend menggunakan Next.js dengan App Router.

Struktur umum:

```text
frontend/
├── app/
│   └── (erp)/
│       ├── bkorder/
│       ├── sales-103/
│       ├── invoice-103/
│       ├── bkpt/
│       └── bank-103/
├── components/
├── services/
├── types/
└── lib/
```

Penjelasan:

- **app**  
  Menyimpan halaman utama aplikasi.

- **components**  
  Menyimpan reusable UI components.

- **services**  
  Menyimpan fungsi API request ke backend.

- **types**  
  Menyimpan TypeScript types.

- **lib**  
  Menyimpan helper dan konfigurasi umum.

---

## Environment Variables

Project ini menggunakan environment variables agar dapat berjalan di berbagai environment.

### Backend `.env`

Contoh:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/erp_db
FRONTEND_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SECRET_KEY=change-this-secret-key
```

Untuk production/demo:

```env
DATABASE_URL=postgresql://username:password@host:5432/database
FRONTEND_ORIGINS=https://your-frontend-domain.vercel.app
SECRET_KEY=your-production-secret-key
```

---

### Frontend `.env.local`

Contoh:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Untuk production:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.run.app
```

---

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/erp-system.git
cd erp-system
```

---

### 2. Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

Buat virtual environment:

```bash
python -m venv .venv
```

Aktifkan virtual environment.

Windows PowerShell:

```bash
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Buat file `.env`:

```bash
cp .env.example .env
```

Jalankan backend:

```bash
uvicorn app.main:app --reload
```

Backend akan berjalan di:

```text
http://localhost:8000
```

Dokumentasi API:

```text
http://localhost:8000/docs
```

---

### 3. Setup Frontend

Masuk ke folder frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Buat file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Jalankan frontend:

```bash
npm run dev
```

Frontend akan berjalan di:

```text
http://localhost:3000
```

---

## Database Setup

Project menggunakan PostgreSQL.

Langkah umum:

1. Buat database PostgreSQL.
2. Set `DATABASE_URL` di backend `.env`.
3. Jalankan migration jika Alembic sudah digunakan.
4. Jalankan backend dan pastikan koneksi database berhasil.

Contoh database lokal:

```bash
createdb erp_db
```

Contoh `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/erp_db
```

---

## Deployment

### Online Demo Deployment

Rencana deployment online:

```text
Frontend  → Vercel
Backend   → Google Cloud Run
Database  → Neon PostgreSQL
```

Kelebihan:

- Mudah untuk demo ke client.
- Bisa diakses dari internet.
- Tidak perlu server lokal saat testing.

---

### Offline / Local LAN Deployment

Rencana final untuk client:

```text
Frontend  → Local server
Backend   → Local server
Database  → Local PostgreSQL
Access    → LAN / jaringan lokal kantor
```

Kelebihan:

- Tidak tergantung internet.
- Data berada di server client.
- Cocok untuk penggunaan internal kantor.

Contoh konfigurasi:

```env
NEXT_PUBLIC_API_URL=http://192.168.1.10:8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/erp_db
```

---

## Security Considerations

Hal yang sudah atau perlu diperhatikan:

- Jangan hardcode database URL.
- Jangan hardcode API URL.
- Gunakan environment variables.
- Jangan commit file `.env`.
- Gunakan `.env.example` untuk dokumentasi konfigurasi.
- Gunakan validasi input di backend.
- Pastikan CORS hanya mengizinkan domain yang diperlukan.
- Gunakan authentication untuk halaman internal.
- Terapkan role-based access control untuk admin, supervisor, dan owner.
- Hindari expose data sensitif di frontend.
- Backup database secara berkala.

---

## Development Rules

Beberapa aturan penting dalam pengembangan project ini:

- Jangan mengubah struktur besar tanpa alasan yang jelas.
- Jangan menghapus atau rename file sembarangan.
- Jangan mengubah schema database tanpa persetujuan.
- Jaga agar UI tetap mendekati referensi Excel/client.
- Gunakan environment variables untuk API dan database.
- Pisahkan business logic dari route.
- Gunakan struktur route, service, dan repository.
- Validasi data di backend.
- Hindari duplicated logic.
- Commit perubahan secara bertahap dan jelas.

---

## Current Main Modules

Modul utama yang tersedia atau direncanakan:

- Dashboard
- BKOrder
- Sales 103
- Invoice 103
- BKPt
- Bank 103
- Customers
- Suppliers
- Inventory
- Purchase Order
- Shipment
- Finance
- Products
- Employees
- Attendance

---

## Known Improvement Areas

Beberapa area yang masih bisa dikembangkan:

- Role-based access control yang lebih lengkap.
- Audit log untuk aktivitas penting.
- Export Excel/PDF.
- Backup dan restore database.
- Better responsive layout for mobile/tablet.
- More complete dashboard analytics.
- Better testing coverage.
- More robust invoice numbering validation.
- More complete error handling.
- Better documentation for each module.

---

## Screenshots

Add screenshots here:

```text
docs/screenshots/dashboard.png
docs/screenshots/bkorder.png
docs/screenshots/invoice-103.png
docs/screenshots/bank-103.png
```

Example:

```markdown
![Dashboard](docs/screenshots/dashboard.png)
![Invoice 103](docs/screenshots/invoice-103.png)
```

---

## Project Status

This project is under active development.

Current focus:

- Stabilizing BKOrder to Sales 103 flow.
- Improving Invoice 103 data accuracy.
- Testing full flow from order to payment.
- Preparing the system for demo and future local LAN deployment.

Main flow to test:

```text
BKOrder
→ Sales 103
→ Invoice 103
→ Finalize to BKPt
→ Input Bank 103
→ Auto Match BKPt Payment
```

---

## Author

**Danang Rajendrata**

Information Systems graduate and aspiring backend / full-stack developer focused on Python, FastAPI, PostgreSQL, REST APIs, ERP workflows, clean code, and practical business application development.

---

## License

This project is currently private/internal and intended for learning, portfolio, and client-specific ERP workflow development.
