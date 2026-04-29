# Service Order Node

Backend service untuk mengelola order. Service ini memakai Node.js, Express, Sequelize, dan PostgreSQL. Saat membuat order baru, service ini juga memanggil `User Service` dan `Product Service`.

## Prasyarat

- Node.js 18+.
- npm.
- PostgreSQL yang sudah berjalan.
- `User Service` dan `Product Service` harus bisa diakses dari komputer ini.

## Instalasi

1. Masuk ke folder project:

   ```bash
   cd service-order-node
   ```

2. Install dependency:

   ```bash
   npm install
   ```

3. Buat file `.env` di folder `service-order-node`:

   ```env
   PORT=8001

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=service_order
   DB_USER=postgres
   DB_PASSWORD=password_kamu

   USER_SERVICE_URL=http://localhost:8000
   PRODUCT_SERVICE_URL=http://localhost:8002
   ```

## Menjalankan di Komputer Lain

Kalau service ini dipindah ke komputer lain, pastikan:

1. PostgreSQL sudah tersedia di komputer tujuan atau dapat diakses lewat jaringan.
2. Database yang dipakai sudah dibuat.
3. Nilai `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, dan `DB_PASSWORD` di `.env` sudah sesuai dengan komputer baru.
4. `USER_SERVICE_URL` dan `PRODUCT_SERVICE_URL` mengarah ke alamat service yang benar.

Jika `User Service` atau `Product Service` berjalan di komputer lain, jangan pakai `localhost`. Ganti dengan IP komputer tujuan, misalnya:

```env
USER_SERVICE_URL=http://192.168.1.10:8000
PRODUCT_SERVICE_URL=http://192.168.1.10:8002
```

## Menjalankan Service

Mode development:

```bash
npm run dev
```

Mode production:

```bash
npm start
```

Default service ini berjalan di port `8001` jika `PORT` tidak diisi.

## Endpoint

Base URL:

```text
http://localhost:8001/api
```

Endpoint yang tersedia:

- `POST /orders` - membuat order baru
- `GET /orders` - mengambil semua order
- `GET /orders/:id` - mengambil order berdasarkan ID
- `GET /orders/user/:userId` - mengambil order berdasarkan user
- `PUT /orders/:id/status` - update status order

## Catatan

- Saat server dijalankan, Sequelize akan melakukan sinkronisasi tabel otomatis dengan `alter: true`.
- File `.env` tidak di-commit karena berisi kredensial database.
