<?php declare(strict_types=1);

namespace App\GraphQL\Directives;

use App\Models\User;
use Nuwave\Lighthouse\Exceptions\AuthorizationException;
use Nuwave\Lighthouse\Execution\ResolveInfo;
use Nuwave\Lighthouse\Schema\Directives\BaseDirective;
use Nuwave\Lighthouse\Schema\Values\FieldValue;
use Nuwave\Lighthouse\Support\Contracts\FieldMiddleware;
use Nuwave\Lighthouse\Support\Contracts\GraphQLContext;

/**
 * Authorize a field for admins only.
 *
 * Must be listed AFTER @guard so the authenticated user is already resolved
 * into the context when this runs. Replaces the previous
 * AuthorizesViaSanctum::authorizeAdmin() helper from the rebing implementation.
 */
class AdminDirective extends BaseDirective implements FieldMiddleware
{
    public static function definition(): string
    {
        return /** @lang GraphQL */ <<<'GRAPHQL'
"""
Restrict access to authenticated users whose role is "admin".
"""
directive @admin on FIELD_DEFINITION
GRAPHQL;
    }

    public function handleField(FieldValue $fieldValue): void
    {
        $fieldValue->wrapResolver(fn (callable $resolver): \Closure => function (mixed $root, array $args, GraphQLContext $context, ResolveInfo $resolveInfo) use ($resolver) {
            $user = $context->user();

            if (! $user instanceof User || $user->role !== 'admin') {
                throw new AuthorizationException('Unauthorized. Admin access required.');
            }

            return $resolver($root, $args, $context, $resolveInfo);
        });
    }
}
