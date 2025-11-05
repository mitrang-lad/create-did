# Docker Quick Reference

## 🐳 One-Line Docker Setup

```bash
# Build and run in one go
docker build --build-arg DOMAIN=your-domain.ngrok-free.app -t did-web-demo . && \
docker run -d -p 3000:3000 --name did-web-demo did-web-demo
```

## Step-by-Step

### 1. Build Image (with your domain)
```bash
docker build --build-arg DOMAIN=your-domain.ngrok-free.app -t did-web-demo .
```

### 2. Run Container
```bash
docker run -d -p 3000:3000 --name did-web-demo did-web-demo
```

### 3. Start ngrok (use SAME domain)
```bash
ngrok http 3000 --domain=your-domain.ngrok-free.app
```

### 4. Test
```bash
# Check health
curl http://localhost:3000/health

# Get DID document
curl http://localhost:3000/.well-known/did.json
```

### 5. Resolve DID
Visit: `https://dev.uniresolver.io/#did:web:your-domain.ngrok-free.app`

## Using Docker Compose

```bash
# Build
DOMAIN=your-domain.ngrok-free.app docker-compose build

# Run
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## Common Commands

```bash
# View logs
docker logs -f did-web-demo

# Stop
docker stop did-web-demo

# Start
docker start did-web-demo

# Restart
docker restart did-web-demo

# Remove
docker rm -f did-web-demo

# Check status
docker ps

# Execute commands inside container
docker exec -it did-web-demo sh
```

## Change Domain

```bash
# Remove old
docker rm -f did-web-demo
docker rmi did-web-demo

# Rebuild with new domain
docker build --build-arg DOMAIN=new-domain.ngrok-free.app -t did-web-demo .
docker run -d -p 3000:3000 --name did-web-demo did-web-demo
```

## What Happens During Build?

1. ✅ Installs Node.js dependencies
2. ✅ Generates RSA-2048 key pair
3. ✅ Creates self-signed X.509 certificate
4. ✅ Creates DID document with your domain
5. ✅ Sets up `.well-known` directory
6. ✅ Ready to serve!

## Complete Demo Workflow

```bash
# Terminal 1: Build and run Docker container
docker build --build-arg DOMAIN=abc123.ngrok-free.app -t did-web-demo .
docker run -d -p 3000:3000 --name did-web-demo did-web-demo
docker logs -f did-web-demo

# Terminal 2: Start ngrok
ngrok http 3000 --domain=abc123.ngrok-free.app

# Browser: Resolve DID
https://dev.uniresolver.io/#did:web:abc123.ngrok-free.app
```

## Troubleshooting

**Build fails with "DOMAIN required"**
- You forgot `--build-arg DOMAIN=...`

**Port 3000 in use**
- Use different port: `docker run -d -p 3001:3000 ...`

**Can't resolve DID**
- Check ngrok is running with correct domain
- Verify: `curl https://your-domain.ngrok-free.app/.well-known/did.json`

**Need to see what's inside**
```bash
docker exec -it did-web-demo sh
ls -la /app
cat /app/.well-known/did.json
```
