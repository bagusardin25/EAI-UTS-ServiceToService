<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;

class UserController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'status' => 'success',
            'data' => new UserResource($user),
        ]);
    }

    public function updateProfile(UpdateUserRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }

        $data = Arr::only($request->validated(), ['name', 'email', 'password', 'phone', 'address']);
        $this->hashPasswordWhenFilled($data);

        $user->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user->fresh()),
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data' => UserResource::collection(User::latest()->paginate(10)),
        ]);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        $data['role'] = $data['role'] ?? 'user';
        $data['is_active'] = $data['is_active'] ?? true;

        $user = User::create($data);

        return response()->json([
            'status' => 'success',
            'message' => 'User created successfully',
            'data' => new UserResource($user),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with('userAddresses')->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => new UserResource($user),
        ]);
    }

    public function update(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $data = $request->validated();
        $this->hashPasswordWhenFilled($data);

        $user->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'User updated successfully',
            'data' => new UserResource($user->fresh()),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $user->delete();

        return response()->json(['status' => 'success', 'message' => "User ID $id deleted"]);
    }

    public function getOrders(int $id): JsonResponse
    {
        return $this->fetchOrders($id);
    }

    private function fetchOrders(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $orderServiceUrl = rtrim((string) env('ORDER_SERVICE_URL', 'http://localhost:8002/api'), '/');

        try {
            $response = Http::timeout(5)->get($orderServiceUrl.'/orders', [
                'user_id' => $userId,
            ]);

            return response()->json([
                'user' => $user->name,
                'orders' => $response->successful() ? $response->json() : 'Order Service Error',
            ]);
        } catch (\Throwable) {
            return response()->json(['message' => 'Service Unavailable'], 503);
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function hashPasswordWhenFilled(array &$data): void
    {
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);

            return;
        }

        unset($data['password']);
    }
}
