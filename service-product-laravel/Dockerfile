FROM php:8.3-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    default-mysql-client \
    supervisor \
    dos2unix \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd sockets \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files first for better caching
COPY composer.json composer.lock ./

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy the rest of the application
COPY . .

# Run post-install scripts
RUN composer dump-autoload --optimize

# Copy docker environment
COPY .env.docker .env

# Ensure storage directories exist and set permissions
RUN mkdir -p storage/framework/{sessions,views,cache/data} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Copy and set entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN dos2unix /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

# Supervisor config for RabbitMQ consumer
RUN echo "[program:rabbitmq-consumer]\n\
command=php /var/www/html/artisan rabbitmq:consume-orders\n\
autostart=true\n\
autorestart=true\n\
stderr_logfile=/var/log/rabbitmq-consumer.err.log\n\
stdout_logfile=/var/log/rabbitmq-consumer.out.log" > /etc/supervisor/conf.d/rabbitmq-consumer.conf

EXPOSE 8001

ENTRYPOINT ["docker-entrypoint.sh"]
