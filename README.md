# 🏗️ Enterprise Application Integration (EAI) - Service to Service

> **Tugas Besar** Mata Kuliah Enterprise Application Integration (EAI)

Proyek ini merupakan implementasi arsitektur **Service-to-Service (Microservices)** yang dikembangkan untuk memenuhi **Tugas Besar (Final Project)** mata kuliah Enterprise Application Integration (EAI). Sistem ini memecah fungsionalitas bisnis menjadi **4 layanan independen** — User, Product, Order, dan Payment — yang saling berkomunikasi melalui **REST API**, **GraphQL**, dan **Message Broker (RabbitMQ)**.

---

## 👥 Kelompok: SemogaDapetA

| Nama | NIM |
| :--- | :--- |
| **Bagus Ardin Prayoga** | 102062400064 |
| **Aldi Rachmatdianto** | 102062400069 |
| **Ida Bagus Giri Krisnabhawa** | 102062400117 |
| **Mochammad Nadhif Athallah** | 102062400144 |

---

## 📐 Gambaran Umum Sistem

Sistem dibangun dengan pendekatan **microservices** di mana setiap layanan memiliki tanggung jawab bisnis masing-masing, database terpisah, serta dapat di-deploy secara independen. Komunikasi antar layanan dilakukan melalui:

- **Synchronous** — REST API & GraphQL (HTTP)
- **Asynchronous** — RabbitMQ (AMQP Message Broker)

### Arsitektur Layanan

```
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌────────────────────────┐
│  User Service│◄──►│  Product Service  │◄──►│   Order Service  │◄──►│   Payment Service      │
│  (Laravel)   │    │  (Laravel)        │    │   (Node.js)      │    │   (Node.js + Hasura)   │
│  Port: 8000  │    │  Port: 8001       │    │   Port: 8002     │    │   Apollo: 8003         │
│  DB: MySQL   │    │  DB: MySQL        │    │   DB: PostgreSQL │    │   Hasura: 8080         │
└──────┬───────┘    └────────┬─────────┘    └────────┬─────────┘    │   DB: PostgreSQL       │
       │                     │                       │              └────────────┬───────────┘
       └─────────────────────┴───────────┬───────────┘                          │
                                         │                                      │
                                  ┌──────┴──────┐                               │
                                  │  RabbitMQ   │◄──────────────────────────────┘
                                  │  Port: 5672 │
                                  └─────────────┘
```

---

## 🛠️ Technology Stack

| Kategori | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Backend (Service 1 & 2)** | Laravel (PHP) | User Service & Product Service |
| **Backend (Service 3)** | Node.js + Express.js | Order Service |
| **Backend (Service 4)** | Node.js + Apollo Server | Payment Service (GraphQL) |
| **GraphQL Engine** | Hasura | Auto-generated GraphQL API untuk Payment Service |
| **Database** | MySQL 8.0 | Digunakan oleh User Service & Product Service |
| **Database** | PostgreSQL 15 | Digunakan oleh Order Service & Payment Service |
| **Message Broker** | RabbitMQ 3.13 | Komunikasi asynchronous antar layanan |
| **Frontend** | React (Vite) | Single Page Application |
| **Containerization** | Docker & Docker Compose | Orkestrasi seluruh layanan |
| **API Documentation** | Postman | Dokumentasi endpoint REST API |

---

## 📦 Deskripsi Layanan

### 1. 👤 User Service — `service-user-laravel`

| Item | Detail |
| :--- | :--- |
| **Framework** | Laravel (PHP) |
| **Port** | `8000` |
| **Database** | MySQL (`db_user_service`) |
| **Deskripsi** | Mengelola data pengguna termasuk registrasi, autentikasi, dan manajemen profil. Menyediakan REST API untuk layanan lain yang membutuhkan validasi user. |

### 2. 📦 Product Service — `service-product-laravel`

| Item | Detail |
| :--- | :--- |
| **Framework** | Laravel (PHP) |
| **Port** | `8001` |
| **Database** | MySQL (`db_product_service`) |
| **Deskripsi** | Mengelola data produk seperti CRUD produk, kategori, dan stok. Menyediakan REST API untuk diakses oleh Order Service saat membuat pesanan. |

### 3. 🛒 Order Service — `service-order-node`

| Item | Detail |
| :--- | :--- |
| **Framework** | Node.js + Express.js |
| **Port** | `8002` |
| **Database** | PostgreSQL (`db_order_service`) |
| **Deskripsi** | Mengelola proses pemesanan. Berkomunikasi dengan User Service (validasi user) dan Product Service (validasi produk & stok) secara synchronous melalui REST API, serta menerima event dari RabbitMQ secara asynchronous. |

### 4. 💳 Payment Service — `service-payment-hasura`

| Item | Detail |
| :--- | :--- |
| **Framework** | Node.js + Apollo Server (GraphQL) |
| **Port Apollo** | `8003` |
| **Port Hasura** | `8080` |
| **Database** | PostgreSQL |
| **Deskripsi** | Mengelola proses pembayaran menggunakan **GraphQL**. Apollo Server menyediakan resolvers kustom, sementara **Hasura** menyediakan auto-generated GraphQL API langsung dari database PostgreSQL. |

---

## 🔌 Endpoint GraphQL

| Endpoint | URL | Keterangan |
| :--- | :--- | :--- |
| **Apollo Server** | `http://localhost:8003/graphql` | GraphQL Playground untuk Payment Service (resolvers kustom) |
| **Hasura Console** | `http://localhost:8080` | Dashboard Hasura — auto-generated GraphQL API, query explorer, dan manajemen schema |

---

## 🐇 RabbitMQ Management

| Item | Detail |
| :--- | :--- |
| **Management UI** | [http://localhost:15672](http://localhost:15672) |
| **Username** | `admin` |
| **Password** | `admin123` |
| **AMQP Port** | `5672` |

Gunakan Management UI untuk memantau queues, exchanges, dan message flow antar layanan.

---

## 🚀 Cara Menjalankan

### Prasyarat

- [Docker](https://www.docker.com/products/docker-desktop/) & Docker Compose terinstal
- Git

### Langkah-langkah

1. **Clone repository**

   ```bash
   git clone https://github.com/bagusardin25/EAI-UTS-ServiceToService.git
   cd EAI-UTS-ServiceToService
   ```

2. **Jalankan seluruh layanan dengan Docker Compose**

   ```bash
   docker-compose up --build -d
   ```

   Perintah ini akan:
   - Membangun image Docker untuk setiap layanan
   - Menjalankan seluruh container di background
   - Membuat network dan volume yang dibutuhkan

3. **Verifikasi semua container berjalan**

   ```bash
   docker-compose ps
   ```

4. **Akses aplikasi**

   | Layanan | URL |
   | :--- | :--- |
   | Frontend | [http://localhost:5173](http://localhost:5173) |
   | User Service | [http://localhost:8000](http://localhost:8000) |
   | Product Service | [http://localhost:8001](http://localhost:8001) |
   | Order Service | [http://localhost:8002](http://localhost:8002) |
   | Payment Service (Apollo) | [http://localhost:8003/graphql](http://localhost:8003/graphql) |
   | Hasura Console | [http://localhost:8080](http://localhost:8080) |
   | RabbitMQ Management | [http://localhost:15672](http://localhost:15672) |

5. **Menghentikan seluruh layanan**

   ```bash
   docker-compose down
   ```

   Tambahkan flag `-v` untuk menghapus volume data:

   ```bash
   docker-compose down -v
   ```

---

## 🔗 Tautan Penting

- **Repository GitHub:** [EAI-UTS-ServiceToService](https://github.com/bagusardin25/EAI-UTS-ServiceToService.git)
- **Video Demo Aplikasi:** [Google Drive - Demo EAI](https://drive.google.com/drive/folders/10aIM_jdmAgnnpmyaIEerA02LNinXcFoy?usp=sharing)

---

## 📝 Dokumentasi API (Postman)

Setiap layanan memiliki dokumentasi API terpisah yang dapat diakses melalui tautan Postman berikut:

1. 👤 **User Service:** [Postman Documentation - User Service](https://documenter.getpostman.com/view/50538090/2sBXqJLM9J)
2. 📦 **Product Service:** [Postman Documentation - Product Service](https://documenter.getpostman.com/view/48836995/2sBXqJKg6v)
3. 🛒 **Order Service:** [Postman Documentation - Order Service](https://documenter.getpostman.com/view/48788436/2sBXqJLMDi)

---

## 📂 Struktur Direktori

```
EAI-UTS-ServiceToService/
├── docker-compose.yml              # Orkestrasi seluruh layanan
├── init-mysql.sql                   # Inisialisasi database MySQL
├── service-user-laravel/            # User Service (Laravel)
├── service-product-laravel/         # Product Service (Laravel)
├── service-order-node/              # Order Service (Node.js)
├── service-payment-hasura/          # Payment Service (Node.js + Hasura)
├── frontend-react/                  # Frontend (React + Vite)
└── README.md
```

---

<p align="center">
  <b>Kelompok SemogaDapetA</b> — Enterprise Application Integration 2026
</p>