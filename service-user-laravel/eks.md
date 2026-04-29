Mantap, Gusde! Karena *database* `db_service-user` sudah berhasil dibuat, sekarang saatnya kita hubungkan *project* Laravel kamu ke *database* tersebut dan membangun struktur tabelnya.

Berikut adalah langkah-langkah eksekusi terstruktur yang bisa kamu jalankan langsung di PowerShell dan *code editor* kamu:

### 1. Konfigurasi Koneksi Database (`.env`)
Buka *project* `service-user-laravel` kamu di VS Code (atau editor pilihanmu), lalu cari file bernama `.env` di direktori paling luar. 

Cari bagian yang mengatur *database* (biasanya berawalan `DB_`) dan ubah nilainya menjadi seperti ini:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_service-user
DB_USERNAME=root
DB_PASSWORD=
```
*(Catatan: Biarkan `DB_PASSWORD` kosong jika kamu menggunakan XAMPP/Laragon bawaan yang tidak dipasangi *password*).*

---

### 2. Membuat Model dan File Migrasi
Laravel secara bawaan sudah menyediakan Model dan Migrasi untuk tabel `users`. Jadi, kita hanya perlu membuatkan Model dan Migrasi untuk tabel `user_addresses`.

Buka kembali terminal PowerShell kamu, pastikan posisinya sudah ada di dalam folder *project*, lalu jalankan perintah ini:

```bash
php artisan make:model UserAddress -m
```
*(Akhiran `-m` di atas akan secara otomatis membuatkan file *migration* kosong untuk tabel `user_addresses`).*

---

### 3. Menulis Skema Migrasi
Sekarang, kita harus menerjemahkan gambar desain ERD UTS kamu menjadi kode skema di Laravel.

**A. Modifikasi Migrasi Users**
Buka folder `database/migrations/` dan cari file yang berakhiran `_create_users_table.php`. Sesuaikan isinya di dalam fungsi `up()` menjadi persis seperti ini:

```php
public function up(): void
{
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('name', 100);
        $table->string('email', 150)->unique();
        $table->string('password', 255);
        $table->string('phone', 20)->nullable();
        $table->text('address')->nullable();
        $table->boolean('is_active')->default(1);
        $table->timestamps();
    });

    // Biarkan skema password_reset_tokens dan sessions jika ada, tidak perlu dihapus
}
```

**B. Modifikasi Migrasi User Addresses**
Masih di folder `database/migrations/`, buka file yang baru saja kamu buat (berakhiran `_create_user_addresses_table.php`). Isi bagian fungsi `up()` dengan:

```php
public function up(): void
{
    Schema::create('user_addresses', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
        $table->string('label', 50);
        $table->text('street');
        $table->string('city', 100);
        $table->string('province', 100);
        $table->string('postal_code', 10);
        $table->boolean('is_primary')->default(0);
        // Perhatikan: di gambarmu tidak ada timestamps untuk tabel ini, 
        // tapi jika ingin tetap ada fitur tracking waktu, kamu bisa tambahkan $table->timestamps();
    });
}
```

---

### 4. Eksekusi Migrasi
Jika kedua file migrasi di atas sudah di- *save*, kembali ke terminal PowerShell dan jalankan perintah pamungkas ini untuk mengirim skema tersebut menjadi tabel asli di MySQL:

```bash
php artisan migrate
```

Siap, Gusde! Mari kita selesaikan semuanya dalam satu panduan panjang dan detail dari tahap Model, Seeder, Controller, hingga Routing API. Dengan mengikuti panduan ini secara berurutan, User Service kamu akan langsung siap digunakan sebagai Provider dan Consumer.

Silakan buka *code editor* (VS Code) dan terminal kamu, lalu ikuti langkah-langkah di bawah ini:

### Langkah 1: Setup Model dan Relasi
Kita harus memastikan Model mengenali kolom mana saja yang boleh diisi data (*fillable*) dan bagaimana relasinya.

**1. Buka `app/Models/User.php`**
Sesuaikan isi file-nya (terutama bagian `$fillable` dan penambahan fungsi `addresses`) menjadi seperti ini:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'address', 'is_active',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // Relasi One-to-Many ke UserAddress
    public function addresses()
    {
        return $this->hasMany(UserAddress::class);
    }
}
```

**2. Buka `app/Models/UserAddress.php`**
Sesuaikan isinya menjadi seperti ini (kita nonaktifkan `$timestamps` karena di desain *database* kamu tabel ini tidak memiliki `created_at` dan `updated_at`):
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserAddress extends Model
{
    // Menonaktifkan timestamps sesuai desain database
    public $timestamps = false; 

    protected $fillable = [
        'user_id', 'label', 'street', 'city', 'province', 'postal_code', 'is_primary'
    ];

    // Relasi balik (Belongs-To) ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

---

### Langkah 2: Membuat Data Dummy (Seeder)
Agar kamu punya data untuk dites di Postman, kita buat *seeder*-nya.

1. Jalankan perintah ini di terminal:
   ```bash
   php artisan make:seeder UserSeeder
   ```
2. Buka `database/seeders/UserSeeder.php` dan isi dengan:
   ```php
   <?php

   namespace Database\Seeders;

   use Illuminate\Database\Seeder;
   use App\Models\User;
   use App\Models\UserAddress;
   use Illuminate\Support\Facades\Hash;

   class UserSeeder extends Seeder
   {
       public function run(): void
       {
           // Membuat User 1
           $user1 = User::create([
               'name' => 'Bagus Ardin',
               'email' => 'bagus@example.com',
               'password' => Hash::make('password123'),
               'phone' => '081234567890',
               'is_active' => true,
           ]);

           // Membuat Alamat untuk User 1
           UserAddress::create([
               'user_id' => $user1->id,
               'label' => 'Rumah',
               'street' => 'Jl. Telekomunikasi No. 1, Terusan Buahbatu',
               'city' => 'Bandung',
               'province' => 'Jawa Barat',
               'postal_code' => '40257',
               'is_primary' => true,
           ]);
       }
   }
   ```
3. Buka `database/seeders/DatabaseSeeder.php`, dan panggil `UserSeeder` di dalam fungsi `run()`:
   ```php
   public function run(): void
   {
       $this->call([
           UserSeeder::class,
       ]);
   }
   ```
4. Eksekusi *seeder* tersebut di terminal:
   ```bash
   php artisan db:seed
   ```

---

### Langkah 3: Membuat Controller (Logika Provider & Consumer)
Ini adalah inti dari tugas UTS kamu[cite: 1]. Kita satukan semuanya di satu Controller.

1. Jalankan perintah ini di terminal:
   ```bash
   php artisan make:controller Api/UserController
   ```
2. Buka file yang baru terbuat di `app/Http/Controllers/Api/UserController.php`. Hapus semua isinya dan *paste* kode ini:
   ```php
   <?php

   namespace App\Http\Controllers\Api;

   use App\Http\Controllers\Controller;
   use App\Models\User;
   use Illuminate\Http\Request;
   use Illuminate\Support\Facades\Http;

   class UserController extends Controller
   {
       /**
        * SEBAGAI PROVIDER: Mengembalikan detail user beserta alamat utamanya
        */
       public function getProfile($id)
       {
           $user = User::with(['addresses' => function ($query) {
               $query->where('is_primary', true); // Hanya ambil alamat utama
           }])->find($id);

           if (!$user) {
               return response()->json([
                   'status' => 'error',
                   'message' => 'User not found'
               ], 404);
           }

           return response()->json([
               'status' => 'success',
               'data' => [
                   'id' => $user->id,
                   'name' => $user->name,
                   'email' => $user->email,
                   'phone' => $user->phone,
                   'primary_address' => $user->addresses->first()
               ]
           ], 200);
       }

       /**
        * SEBAGAI CONSUMER: Meminta data dari OrderService
        */
       public function getOrderHistory($id)
       {
           // Pastikan user ada
           $user = User::find($id);
           if (!$user) {
               return response()->json(['status' => 'error', 'message' => 'User not found'], 404);
           }

           // Ambil URL Order Service dari file .env
           // Default diset ke localhost:8002 jika di .env belum ada
           $orderServiceUrl = env('ORDER_SERVICE_URL', 'http://localhost:8002/api');

           try {
               // Melakukan HTTP GET Request ke Order Service (Berperan sebagai Consumer)
               $response = Http::get("{$orderServiceUrl}/orders", [
                   'user_id' => $id
               ]);

               // Cek apakah request sukses
               if ($response->successful()) {
                   $orderData = $response->json();
               } else {
                   $orderData = ['message' => 'Failed to retrieve orders from Order Service'];
               }
           } catch (\Exception $e) {
               $orderData = ['message' => 'Order Service is currently unreachable: ' . $e->getMessage()];
           }

           // Gabungkan data User dengan data Order
           return response()->json([
               'status' => 'success',
               'user_info' => [
                   'id' => $user->id,
                   'name' => $user->name,
                   'email' => $user->email
               ],
               'order_history' => $orderData
           ], 200);
       }
   }
   ```

---

### Langkah 4: Setup Routing API
Pada Laravel 11 dan 12, file `routes/api.php` tidak otomatis ada. Kamu harus menginstall-nya terlebih dahulu.

1. Jalankan perintah ini di terminal:
   ```bash
   php artisan install:api
   ```
2. Setelah file terbuat, buka file `routes/api.php` tersebut.
3. Hapus isinya (atau letakkan di bagian paling bawah), dan tambahkan *routes* untuk *controller* yang baru kita buat:
   ```php
   <?php

   use Illuminate\Http\Request;
   use Illuminate\Support\Facades\Route;
   use App\Http\Controllers\Api\UserController;

   // Endpoint sebagai Provider
   Route::get('/users/{id}/profile', [UserController::class, 'getProfile']);

   // Endpoint sebagai Consumer
   Route::get('/users/{id}/history', [UserController::class, 'getOrderHistory']);
   ```

---

### Langkah 5: Penyesuaian Terakhir di `.env` & Eksekusi Server
Karena *service* kamu bertindak sebagai Consumer dan harus "menembak" *service* temanmu (`OrderService`), kamu perlu mendefinisikan URL *service* temanmu di `.env`.

1. Buka file `.env` kamu, lalu *scroll* ke paling bawah dan tambahkan baris ini:
   ```env
   # URL untuk komunikasi Service-to-Service
   ORDER_SERVICE_URL=http://localhost:8002/api
   ```
   *(Pastikan temanmu nanti menjalankan OrderService di port 8002. Jika beda, tinggal ubah angka port-nya di sini).*

2. **Jalankan *server* Laravel kamu:**
   Agar tidak bentrok dengan *service* temanmu di localhost, kita spesifikkan port User Service kamu jalan di port `8001`. Jalankan perintah ini:
   ```bash
   php artisan serve --port=8001
   ```

Selesai! Sekarang kamu bisa membuka Postman dan mengetes dua *endpoint* ini:
*   **Provider:** `GET http://localhost:8001/api/users/1/profile`
*   **Consumer:** `GET http://localhost:8001/api/users/1/history` (Untuk ini, hasilnya akan menampilkan pesan error *unreachable* di bagian `order_history` sampai teman kelompokmu menyalakan `OrderService` mereka).
```
