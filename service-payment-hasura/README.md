# Service Payment — Hasura + Apollo Server (GraphQL)

Layanan pembayaran (Payment Service) yang mengimplementasikan **dua jenis GraphQL**:

1. **Apollo Server (Manual GraphQL Backend)** — Node.js + Express, port `8003`
2. **Hasura GraphQL Engine** — Auto-generated GraphQL API, port `8080`

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────────────┐
│           service-payment-hasura            │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  Apollo Server (Manual GraphQL)     │    │
│  │  Port: 8003                         │    │
│  │  Endpoint: /graphql                 │    │
│  │  - Custom resolvers                 │    │
│  │  - Sequelize ORM                    │    │
│  └──────────────┬──────────────────────┘    │
│                 │                            │
│          ┌──────▼──────┐                    │
│          │  PostgreSQL  │                    │
│          │  Port: 5434  │                    │
│          │  db_payment  │                    │
│          │  _service    │                    │
│          └──────▲──────┘                    │
│                 │                            │
│  ┌──────────────┴──────────────────────┐    │
│  │  Hasura GraphQL Engine              │    │
│  │  Port: 8080                         │    │
│  │  Console: http://localhost:8080      │    │
│  │  - Auto-generated CRUD              │    │
│  │  - Real-time subscriptions          │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## 📦 Teknologi

| Komponen | Teknologi |
|----------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 5 |
| GraphQL Manual | Apollo Server 4 |
| GraphQL Engine | Hasura v2.44.0 |
| ORM | Sequelize 6 |
| Database | PostgreSQL 15 |

---

## 🗄️ Database Schema

### Tabel `payment_methods`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | SERIAL (PK) | Auto-increment |
| name | VARCHAR(50) | Nama metode (e.g., "Bank Transfer") |
| code | VARCHAR(20) UNIQUE | Kode unik (e.g., "bank_transfer") |
| is_active | BOOLEAN | Status aktif, default: true |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

### Tabel `payments`

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | BIGSERIAL (PK) | Auto-increment |
| payment_number | VARCHAR(50) UNIQUE | Nomor payment (PAY-YYYYMMDD-XXXXX) |
| order_id | BIGINT | ID order dari Order Service |
| user_id | BIGINT | ID user dari User Service |
| payment_method_id | INT (FK) | Referensi ke payment_methods |
| amount | DECIMAL(14,2) | Jumlah pembayaran |
| status | VARCHAR(20) | pending / paid / failed / refunded |
| paid_at | TIMESTAMP | Waktu pembayaran (null jika belum bayar) |
| notes | TEXT | Catatan tambahan |
| created_at | TIMESTAMP | Waktu dibuat |
| updated_at | TIMESTAMP | Waktu diupdate |

---

## 🚀 GraphQL Endpoints

### Apollo Server (Manual) — `http://localhost:8003/graphql`

#### Queries
```graphql
# Ambil semua pembayaran
query { payments { id payment_number order_id user_id amount status payment_method { name code } } }

# Ambil pembayaran berdasarkan ID
query { payment(id: 1) { id payment_number status paid_at } }

# Ambil pembayaran berdasarkan Order
query { paymentsByOrder(orderId: 1) { id payment_number amount status } }

# Ambil pembayaran berdasarkan User
query { paymentsByUser(userId: 1) { id payment_number amount status } }

# Ambil semua metode pembayaran
query { paymentMethods { id name code is_active } }
```

#### Mutations
```graphql
# Buat pembayaran baru
mutation {
  createPayment(
    order_id: 1
    user_id: 1
    payment_method_id: 1
    amount: 150000.00
    notes: "Pembayaran order #1"
  ) {
    id
    payment_number
    status
    payment_method { name }
  }
}

# Update status pembayaran
mutation {
  updatePaymentStatus(id: 1, status: "paid") {
    id
    payment_number
    status
    paid_at
  }
}
```

### Hasura — `http://localhost:8080`

Buka Hasura Console di browser untuk mengakses GraphQL Explorer dengan auto-generated queries & mutations.

- **Admin Secret**: `hasura_admin_secret`
- Hasura secara otomatis men-generate semua CRUD operations dari tabel yang di-track

---

## 🐳 Docker

Service ini membutuhkan 3 container:
1. `postgres-payment` — Database PostgreSQL
2. `service-payment` — Node.js Apollo Server
3. `hasura` — Hasura GraphQL Engine

Semua dikonfigurasi di `docker-compose.yml` root project.

### Menjalankan

```bash
# Dari root project
docker-compose up --build -d

# Cek status
docker-compose ps

# Lihat log payment service
docker-compose logs -f service-payment

# Lihat log Hasura
docker-compose logs -f hasura
```
