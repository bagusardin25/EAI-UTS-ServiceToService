Siap, Gusde! Kita kunci di **Port 8000**. Ini adalah panduan teknis final yang sangat presisi untuk membangun ulang (rebuild) User Service kamu. 

Ikuti urutan langkah ini agar sistem **JWT + RBAC (Admin/User)** kamu langsung jalan tanpa hambatan:

### 1. Konfigurasi Lingkungan (`.env`)
Buka file `.env` dan pastikan pengaturan database mengarah ke nama yang baru:
```env
DB_DATABASE=user_service_db

# Tambahkan baris ini untuk komunikasi ke service teman (Order Service)
ORDER_SERVICE_URL=http://localhost:8002/api
```

---

### 2. Update Skema Database (Role-Based)
Jalankan perintah ini di PowerShell untuk menambah kolom Role:
```bash
php artisan make:migration add_role_to_users_table --table=users
```
Buka file migrasi tersebut dan isi bagian `up()`:
```php
public function up(): void {
    Schema::table('users', function (Blueprint $table) {
        // Default adalah user, admin disetting manual di DB/Seeder
        $table->enum('role', ['admin', 'user'])->default('user')->after('password');
    });
}
```
Lalu eksekusi: `php artisan migrate`

---

### 3. Setup Middleware (Proteksi Akses Admin)
Jalankan: `php artisan make:middleware CheckAdmin`
Buka `app/Http/Middleware/CheckAdmin.php` dan isi logikanya:
```php
public function handle($request, $next) {
    if (auth()->check() && auth()->user()->role === 'admin') {
        return $next($request);
    }
    return response()->json(['status' => 'error', 'message' => 'Unauthorized: Admin Only'], 403);
}
```
**Daftarkan di `bootstrap/app.php` (Wajib untuk Laravel 12):**
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias(['is_admin' => \App\Http\Middleware\CheckAdmin::class]);
})
```

---

### 4. Controller (Pemisahan Logika Context vs ID)
Buka `app/Http/Controllers/Api/UserController.php` dan ganti isinya. Perhatikan bagaimana Admin menggunakan `$id` dan User menggunakan `auth()->user()`.

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class UserController extends Controller
{
    // --- KHUSUS USER BIASA (Identitas via Token) ---
    public function myProfile() {
        return response()->json(['status' => 'success', 'data' => auth()->user()]);
    }

    public function myHistory() {
        return $this->fetchOrders(auth()->user()->id);
    }

    // --- KHUSUS ADMIN (Identitas via ID di URL) ---
    public function adminViewUser($id) {
        return response()->json(['status' => 'success', 'data' => User::findOrFail($id)]);
    }

    public function adminViewHistory($id) {
        return $this->fetchOrders($id);
    }

    public function adminDeleteUser($id) {
        User::findOrFail($id)->delete();
        return response()->json(['status' => 'success', 'message' => "User ID $id deleted"]);
    }

    // --- LOGIKA CONSUMER (S2S ke Order Service) ---
    private function fetchOrders($userId) {
        $url = env('ORDER_SERVICE_URL') . "/orders?user_id=" . $userId;
        try {
            $response = Http::get($url);
            return response()->json([
                'user' => User::find($userId)->name,
                'orders' => $response->successful() ? $response->json() : 'Order Service Error'
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Service Unavailable'], 503);
        }
    }
}
```

---

### 5. Setup Routing API (`routes/api.php`)
Kita pisahkan prefix `user` dan `admin` agar tidak tertukar:

```php
use App\Http\Controllers\Api\UserController;

// GRUP UNTUK USER BIASA
Route::middleware('auth:api')->prefix('user')->group(function () {
    Route::get('/profile', [UserController::class, 'myProfile']);
    Route::get('/history', [UserController::class, 'myHistory']);
});

// GRUP UNTUK ADMIN
Route::middleware(['auth:api', 'is_admin'])->prefix('admin')->group(function () {
    Route::get('/users/{id}', [UserController::class, 'adminViewUser']);
    Route::get('/users/{id}/history', [UserController::class, 'adminViewHistory']);
    Route::delete('/users/{id}', [UserController::class, 'adminDeleteUser']);
});
```

---

### 6. Cara Eksekusi & Testing (Port 8000)

**1. Jalankan Server:**
```bash
php artisan serve --port=8000
```

**2. Testing di Postman:**
*   **Sebagai User:** Tembak `GET http://localhost:8000/api/user/profile`. Kamu tidak butuh kirim ID, cukup masukkan JWT Token di tab Authorization.
*   **Sebagai Admin:** Pastikan akunmu sudah diubah jadi `admin` di database. Tembak `GET http://localhost:8000/api/admin/users/1`. Kamu bisa melihat data siapa pun hanya dengan mengganti angka ID di URL.

**3. Keuntungan Sistem Ini:**
- **User Aman:** Tidak bisa mengintip ID orang lain karena tidak ada parameter ID di jalurnya.
- **Admin Kuasa:** Tetap bisa melakukan manajemen penuh (CRUD) ke seluruh ID yang terdaftar.
- **JWT Sentris:** Keduanya tetap butuh Token untuk membuktikan identitas (Authenticity).


