FROM node:20-alpine

RUN apk add --no-cache bash postgresql-client dos2unix

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Overwrite .env with Docker version
COPY .env.docker .env

# Fix line endings
RUN dos2unix docker-entrypoint.sh 2>/dev/null || true
RUN chmod +x docker-entrypoint.sh

EXPOSE 8003

ENTRYPOINT ["./docker-entrypoint.sh"]
