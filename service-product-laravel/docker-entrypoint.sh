#!/bin/bash
set -e

echo "⏳ Waiting for MySQL to be ready..."
until php -r "
try {
    new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
    echo 'connected';
    exit(0);
} catch (Exception \$e) {
    exit(1);
}
" 2>/dev/null; do
    echo "   MySQL is not ready yet. Retrying in 3s..."
    sleep 3
done
echo "✅ MySQL is ready!"

# Generate app key if not set
if [ -z "$APP_KEY" ] || grep -q "^APP_KEY=$" .env; then
    echo "🔑 Generating application key..."
    php artisan key:generate --force
fi

# Run migrations
echo "🗄️  Running migrations..."
php artisan migrate --force

# Clear and cache config
echo "⚙️  Optimizing application..."
php artisan config:clear
php artisan route:clear

echo "🚀 Starting Product Service on port 8001..."
exec php artisan serve --host=0.0.0.0 --port=8001
