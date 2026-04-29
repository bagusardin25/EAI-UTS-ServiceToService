FROM node:20-alpine

# Install postgresql-client for health check
RUN apk add --no-cache bash postgresql-client

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Copy docker environment
COPY .env.docker .env

# Copy and set entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8002

ENTRYPOINT ["docker-entrypoint.sh"]
