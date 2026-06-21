#!/bin/bash
set -e

echo "=== Payment Service (Apollo Server) ==="

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL (postgres-payment)..."
until pg_isready -h postgres-payment -p 5432 -U postgres > /dev/null 2>&1; do
    echo "PostgreSQL is not ready yet... retrying in 2s"
    sleep 2
done
echo "PostgreSQL is ready!"

# Start the application
echo "Starting Payment Service..."
exec node index.js
