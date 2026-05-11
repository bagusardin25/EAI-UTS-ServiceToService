FROM node:20-alpine

# Install dependencies for health check and line ending fix
RUN apk add --no-cache bash postgresql-client dos2unix

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Copy docker environment
COPY .env.docker .env

# Copy and fix line endings for entrypoint (Windows CRLF -> Unix LF)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN dos2unix /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 8002

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
