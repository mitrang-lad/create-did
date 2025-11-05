# Use official Node.js LTS (Long Term Support) image
FROM node:18-alpine

# Install OpenSSL for better certificate generation
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Accept domain as build argument
ARG DOMAIN
ENV DOMAIN=${DOMAIN}

# Validate domain argument
RUN if [ -z "$DOMAIN" ]; then \
        echo "ERROR: DOMAIN build argument is required!"; \
        echo "Usage: docker build --build-arg DOMAIN=your-domain.ngrok-free.app -t did-web-demo ."; \
        exit 1; \
    fi

# Generate keys during build
RUN echo "🔑 Generating RSA key pair..." && \
    node 1-generate-keys.js

# Create DID document with provided domain
RUN echo "📝 Creating DID document for domain: $DOMAIN" && \
    node create-did-docker.js $DOMAIN

# Expose port 3000
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the server
CMD ["node", "3-server.js"]

# Labels
LABEL maintainer="DID:web Demo"
LABEL description="Dockerized DID:web demonstration server with automated key generation"
LABEL version="1.0.0"
