<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UserService
{
    protected string $baseUrl;

    public function __construct()
    {
        // Di lingkungan nyata, ini harus ada di .env
        $this->baseUrl = config('services.user_service.url', 'http://user-service/api');
    }

    public function getUserById(int $id): array|null
    {
        try {
            $response = Http::timeout(5)->get("{$this->baseUrl}/users/{$id}");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error("User Service Error: " . $response->status());
            return null;
        } catch (\Exception $e) {
            Log::error("User Service Unavailable: " . $e->getMessage());
            return null;
        }
    }
}
