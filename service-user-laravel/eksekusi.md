# Tahapan Membangun User Service (Laravel 12 + MySQL)

---

## FASE 1 — Persiapan Project

**Langkah 1: Install Laravel 12**
Jalankan perintah berikut di terminal:
`composer create-project laravel/laravel user-service`

**Langkah 2: Konfigurasi Environment**
Buka file `.env` lalu sesuaikan konfigurasi database:
```
APP_NAME=UserService
APP_PORT=8001
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=user_service_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

**Langkah 3: Buat Database**
Buat database baru di MySQL dengan nama `user_service_db`.

---

## FASE 2 — Migration & Model

**Langkah 4: Buat Migration Tabel `users`**
Jalankan `php artisan make:migration create_users_table` lalu isi schema:
- id (BIGINT UNSIGNED, PK)
- name (VARCHAR 100)
- email (VARCHAR 150, UNIQUE)
- password (VARCHAR 255)
- phone (VARCHAR 20, NULLABLE)
- address (TEXT, NULLABLE)
- is_active (TINYINT 1, DEFAULT 1)
- timestamps (created_at, updated_at)

**Langkah 5: Buat Migration Tabel `user_addresses`**
Jalankan `php artisan make:migration create_user_addresses_table` lalu isi schema:
- id (BIGINT UNSIGNED, PK)
- user_id (BIGINT UNSIGNED, FK → users.id)
- label (VARCHAR 50)
- street (TEXT)
- city (VARCHAR 100)
- province (VARCHAR 100)
- postal_code (VARCHAR 10)
- is_primary (TINYINT 1, DEFAULT 0)

**Langkah 6: Jalankan Migration**
`php artisan migrate`

**Langkah 7: Buat Model User**
`php artisan make:model User`
- Isi `$fillable` dengan semua kolom yang bisa diisi
- Tambahkan `$hidden` untuk menyembunyikan field password
- Tambahkan relasi `hasMany(UserAddress::class)`

**Langkah 8: Buat Model UserAddress**
`php artisan make:model UserAddress`
- Isi `$fillable` dengan semua kolom
- Tambahkan relasi `belongsTo(User::class)`

---

## FASE 3 — Request Validation

**Langkah 9: Buat Form Request untuk Store User**
`php artisan make:request StoreUserRequest`
Isi rules:
- name: required, string, max:100
- email: required, email, unique:users
- password: required, min:8
- phone: nullable, string, max:20
- address: nullable, string

**Langkah 10: Buat Form Request untuk Update User**
`php artisan make:request UpdateUserRequest`
Isi rules mirip StoreUserRequest tapi email menggunakan `unique:users,email,{id}` agar tidak konflik dengan data sendiri.

---

## FASE 4 — Controller & Endpoint Provider

**Langkah 11: Buat Controller**
`php artisan make:controller Api/UserController --api`

**Langkah 12: Implementasi Method `index`**
- GET /api/users
- Ambil semua user dengan pagination
- Return response JSON dengan status 200

**Langkah 13: Implementasi Method `show`**
- GET /api/users/{id}
- Cari user by ID, jika tidak ditemukan return 404
- Load relasi `userAddresses`
- Return response JSON dengan status 200

**Langkah 14: Implementasi Method `store`**
- POST /api/users
- Validasi input menggunakan StoreUserRequest
- Hash password sebelum disimpan menggunakan `bcrypt()`
- Simpan ke database, return response JSON status 201

**Langkah 15: Implementasi Method `update`**
- PUT /api/users/{id}
- Validasi input menggunakan UpdateUserRequest
- Update data user, jika password dikirim maka di-hash ulang
- Return response JSON status 200

---

## FASE 5 — Endpoint Consumer (Memanggil Order Service)

**Langkah 16: Install HTTP Client**
Laravel sudah menyertakan Guzzle via `Http` facade, tidak perlu install tambahan.

**Langkah 17: Tambahkan Config Order Service URL**
Di file `.env` tambahkan:
`ORDER_SERVICE_URL=http://localhost:8003`

**Langkah 18: Buat Method `getOrders` di UserController**
- GET /api/users/{id}/orders
- Pastikan user dengan ID tersebut ada di database lokal
- Panggil Order Service menggunakan `Http::get(ORDER_SERVICE_URL . '/api/orders/user/' . $id)`
- Tangani error jika Order Service tidak bisa dihubungi (try-catch / timeout handling)
- Return response JSON hasil dari Order Service

---

## FASE 6 — Routing

**Langkah 19: Daftarkan Route di `routes/api.php`**
```
Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::get('/users/{id}/orders', [UserController::class, 'getOrders']);
```

---

## FASE 7 — API Resource (Response Formatting)

**Langkah 20: Buat API Resource**
`php artisan make:resource UserResource`
Isi method `toArray()` untuk memformat struktur JSON response secara konsisten, misalnya:
```
'id' => $this->id,
'name' => $this->name,
'email' => $this->email,
'phone' => $this->phone,
'is_active' => $this->is_active,
'addresses' => UserAddressResource::collection($this->whenLoaded('userAddresses')),
'created_at' => $this->created_at,
```

**Langkah 21: Buat API Resource untuk UserAddress**
`php artisan make:resource UserAddressResource`

---

## FASE 8 — Testing & Finalisasi

**Langkah 22: Buat Seeder (Opsional)**
`php artisan make:seeder UserSeeder`
Isi data dummy untuk keperluan testing lalu jalankan `php artisan db:seed`.

**Langkah 23: Testing Endpoint dengan Postman**
Uji satu per satu semua endpoint:
- GET /api/users → harus return list user
- POST /api/users → harus bisa membuat user baru
- GET /api/users/{id} → harus return detail user + addresses
- PUT /api/users/{id} → harus bisa update data user
- GET /api/users/{id}/orders → harus return data dari Order Service

**Langkah 24: Error Handling Global**
Tambahkan handler di `app/Exceptions/Handler.php` untuk memastikan semua error dikembalikan dalam format JSON yang konsisten, bukan HTML default Laravel.

**Langkah 25: Jalankan Service**
`php artisan serve --port=8001`

---

## Ringkasan Alur Selesai

```
Install Laravel → Konfigurasi .env → Buat Migration → Jalankan migrate
→ Buat Model + Relasi → Buat Request Validation → Buat Controller
→ Implementasi 4 endpoint provider → Implementasi 1 endpoint consumer
→ Daftarkan Route → Buat API Resource → Testing → Selesai
```

User Service sekarang siap menjadi **provider** (melayani permintaan dari Order Service & Product Service) sekaligus **consumer** (mengambil data orders dari Order Service).
