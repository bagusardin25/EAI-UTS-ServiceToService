#!/bin/bash
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."
while ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -q 2>/dev/null; do
    echo "   PostgreSQL is not ready yet. Retrying in 3s..."
    sleep 3
done
echo "✅ PostgreSQL is ready!"

echo "⏳ Waiting for User Service to be ready..."
until wget -q -O /dev/null --timeout=5 http://service-user:8000/ 2>/dev/null; do
    echo "   User Service is not ready yet. Retrying in 5s..."
    sleep 5
done
echo "✅ User Service is ready!"

echo "⏳ Waiting for Product Service to be ready..."
until wget -q -O /dev/null --timeout=5 http://service-product:8001/ 2>/dev/null; do
    echo "   Product Service is not ready yet. Retrying in 5s..."
    sleep 5
done
echo "✅ Product Service is ready!"

echo "🚀 Starting Order Service on port 8002..."
exec node index.js
