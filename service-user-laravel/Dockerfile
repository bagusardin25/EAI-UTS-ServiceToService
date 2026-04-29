FROM php:8.2-cli-alpine

RUN apk add --no-cache \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    oniguruma-dev \
    mariadb-client

RUN docker-php-ext-install pdo_mysql mbstring gd zip

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-interaction --optimize-autoloader

RUN chmod -R 777 storage bootstrap/cache

EXPOSE 8000

CMD php artisan migrate --force && \
    php artisan db:seed --force && \
    php artisan serve --host=0.0.0.0 --port=8000
