<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class UserController extends Controller
{
    public function show($id)
    {
        $user = User::with(['addresses' => function ($query) {
            $query->where('is_primary', true);
        }])->find($id);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        }

        $primaryAddress = $user->addresses->first();

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'primary_address' => $primaryAddress ? [
                    'label' => $primaryAddress->label,
                    'street' => $primaryAddress->street,
                    'city' => $primaryAddress->city,
                    'province' => $primaryAddress->province,
                    'postal_code' => $primaryAddress->postal_code,
                ] : null
            ]
        ]);
    }
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        $user->delete();

            return response()->json([
                'message' => 'User deleted successfully'
            ], 200);
    }
    public function history($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not found'
            ], 404);
        }

        $orderServiceUrl = env('ORDER_SERVICE_URL', 'http://localhost:8002/api');

        try {
            // Asumsi endpoint di Order Service untuk mengambil pesanan user adalah /orders/user/{id}
            $response = Http::timeout(5)->get("{$orderServiceUrl}/orders/user/{$id}");

            $orderHistory = [];
            if ($response->successful()) {
                $responseData = $response->json();
                // Menyesuaikan jika response Order Service dibungkus dalam 'data'
                $orderHistory = isset($responseData['data']) ? $responseData['data'] : $responseData;
            }
        } catch (\Exception $e) {
            $orderHistory = [];
        }

        if (!is_array($orderHistory)) {
            $orderHistory = [];
        }

        return response()->json([
            'status' => 'success',
            'user_info' => [
                'id' => $user->id,
                'name' => $user->name,
            ],
            'order_history' => $orderHistory
        ]);
    }
}
