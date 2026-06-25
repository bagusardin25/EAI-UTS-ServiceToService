<?php declare(strict_types=1);

namespace App\GraphQL\Validators;

use Nuwave\Lighthouse\Validation\Validator;

/**
 * Dynamic validation for `updateUser` that depends on the incoming arguments.
 *
 * The email uniqueness check must ignore the row being updated, which is only
 * known at request time — hence it lives here rather than as a static @rules
 * directive in the schema. Static rules (string/max/min/etc.) stay in the SDL.
 */
final class UpdateUserValidator extends Validator
{
    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        // Only enforce uniqueness when an email is actually being changed.
        if ($this->arg('email') === null) {
            return [];
        }

        $id = $this->arg('id') ?? 'NULL';

        return [
            'email' => ['unique:users,email,' . $id],
        ];
    }
}
