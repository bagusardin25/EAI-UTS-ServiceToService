<?php

declare(strict_types=1);

namespace App\GraphQL\Concerns;

use App\Models\User;

/**
 * Shared authorization helpers for GraphQL queries and mutations.
 *
 * The /graphql route has no global auth middleware, so each field decides its
 * own access via authorize(). User resolution uses the Sanctum guard, which
 * reads the "Authorization: Bearer <token>" header — the same token issued by
 * the REST login endpoint and the GraphQL `login` mutation.
 */
trait AuthorizesViaSanctum
{
    protected function currentUser(): ?User
    {
        $user = auth('sanctum')->user();

        return $user instanceof User ? $user : null;
    }

    /** Allow any authenticated user. */
    protected function authorizeAuthenticated(): bool
    {
        return $this->currentUser() !== null;
    }

    /** Allow only authenticated admins. */
    protected function authorizeAdmin(): bool
    {
        $user = $this->currentUser();

        return $user !== null && $user->role === 'admin';
    }
}
