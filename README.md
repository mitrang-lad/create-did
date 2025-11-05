# DID:web Demo - Decentralized Identifiers for SSI

A simple Node.js demonstration of DID (Decentralized Identifiers) using the `did:web` method, perfect for Self-Sovereign Identity (SSI) demonstration.

## 📋 Overview

This project provides a complete toolkit for demonstrating DID:web functionality:

1. **Key Generation** - Generate RSA-2048 key pairs and self-signed X.509 certificates
2. **DID Document Creation** - Create W3C-compliant DID documents
3. **DID Hosting** - Simple HTTP server to host DID documents
4. **DID Resolution** - Compatible with universal DID resolvers

## 🎯 What is DID:web?

`did:web` is a DID method that leverages existing web infrastructure (HTTPS, DNS) to provide decentralized identifiers without requiring blockchain technology.

**Format:** `did:web:domain.com` or `did:web:domain.com:path`

**Key Characteristics:**

-   Uses standard HTTPS for resolution
-   DID documents hosted at `https://domain/.well-known/did.json`
-   Simple to implement and demonstrate
-   Compatible with existing web infrastructure

## 🔧 Prerequisites

### For Docker (Recommended for Quick Demo)

-   **Docker** (20.10 or higher)
-   **ngrok** (for exposing local server with a public domain)

### For Manual Setup

-   **Node.js** (v14 or higher)
-   **npm** (comes with Node.js)
-   **ngrok** (for exposing local server with a public domain)
-   **OpenSSL** (optional, for better certificate generation)

## 📦 Installation

Choose either Docker or Manual setup:

### Option A: Docker (Fastest!)

No installation needed - Docker handles everything!

### Option B: Manual Setup

```bash
# Install dependencies
npm install
```

## 🚀 Quick Start

### 🐳 Docker Quick Start (Recommended)

The fastest way to get started - everything is automated!

#### Step 1: Build Docker Image with Your Domain

```bash
# Build the image with your ngrok domain
docker build --build-arg DOMAIN=your-domain.ngrok-free.app -t did-web-demo .
```

**What happens during build:**

-   ✅ Installs all dependencies
-   ✅ Generates RSA-2048 key pair
-   ✅ Creates self-signed X.509 certificate
-   ✅ Creates DID document with your domain
-   ✅ Sets up `.well-known` directory structure

#### Step 2: Run the Container

```bash
# Run the container
docker run -d -p 3000:3000 --name did-web-demo did-web-demo
```

**Or using docker-compose:**

```bash
# Build with domain
DOMAIN=your-domain.ngrok-free.app docker-compose build

# Run
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Step 3: Expose with ngrok

```bash
# Use the SAME domain you specified during build
ngrok http 3000 --domain=your-domain.ngrok-free.app
```

#### Step 4: Resolve Your DID

Visit your DID resolver:

```
https://dev.uniresolver.io/#did:web:your-domain.ngrok-free.app
```

Or test directly:

```bash
curl https://your-domain.ngrok-free.app/.well-known/did.json
```

**Docker Management Commands:**

```bash
# View logs
docker logs -f did-web-demo

# Stop container
docker stop did-web-demo

# Start container
docker start did-web-demo

# Remove container
docker rm -f did-web-demo

# View container info
docker ps
```

---

### 💻 Manual Quick Start

For more control and learning, you can set up manually:

### Step 1: Generate Keys

Generate an RSA-2048 key pair and self-signed X.509 certificate:

```bash
npm run generate-keys
```

**Output:**

-   `keys/private-key.json` - Private key in JWK format (keep secure!)
-   `keys/public-key.json` - Public key in JWK format
-   `keys/private-key.pem` - Private key in PEM format
-   `keys/public-key.pem` - Public key in PEM format
-   `keys/x509CertificateChain.pem` - Self-signed certificate chain

⚠️ **Security Note:** Keep `private-key.*` files secure! These control your DID.

### Step 2: Create DID Document

Create a W3C-compliant DID document:

```bash
npm run create-did
```

You'll be prompted for:

-   **Domain**: Your domain name (e.g., `abc123.ngrok-free.app`)
-   **Path** (optional): Additional path component (e.g., `user` or `tenant/user`)
-   **Authentication**: Whether to add authentication methods
-   **Services**: Optional service endpoints

**Output:**

-   `did-document/did.json` - Your DID document
-   `.well-known/did.json` - DID document for hosting
-   `.well-known/x509CertificateChain.pem` - Certificate chain

### Step 3: Start the Server

Start the HTTP server to host your DID document:

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

**Available Endpoints:**

-   `/` - Demo UI with server information
-   `/.well-known/did.json` - DID document
-   `/.well-known/x509CertificateChain.pem` - Certificate chain
-   `/health` - Health check endpoint

### Step 4: Expose with ngrok

Use ngrok to expose your local server with a public domain:

```bash
# If you have a static ngrok domain
ngrok http 3000 --domain=your-domain.ngrok-free.app

# Or use a random ngrok domain
ngrok http 3000
```

**Important:** The domain you use with ngrok should match the domain you specified when creating the DID document in Step 2.

### Step 5: Resolve Your DID

Use a universal DID resolver to verify your DID:

```
https://dev.uniresolver.io/#did:web:your-domain.ngrok-free.app
```

You can also test direct resolution:

```bash
# Get DID document
curl https://your-domain.ngrok-free.app/.well-known/did.json

# Get certificate chain
curl https://your-domain.ngrok-free.app/.well-known/x509CertificateChain.pem
```

## 📁 Project Structure

```
create-did/
├── 1-generate-keys.js           # Key pair generation script
├── 2-create-did-document.js     # Interactive DID document creation
├── create-did-docker.js         # Non-interactive DID creation (for Docker)
├── 3-server.js                  # HTTP server for hosting
├── package.json                 # Project dependencies
├── README.md                    # This file
│
├── Dockerfile                   # Docker configuration
├── docker-compose.yml           # Docker Compose configuration
├── .dockerignore                # Docker build exclusions
├── .gitignore                   # Git exclusions
│
├── keys/                        # Generated keys (gitignored)
│   ├── private-key.json
│   ├── public-key.json
│   ├── private-key.pem
│   ├── public-key.pem
│   └── x509CertificateChain.pem
│
├── did-document/                # Generated DID document
│   └── did.json
│
└── .well-known/                 # Web-hosted files
    ├── did.json
    └── x509CertificateChain.pem
```

## 🔐 Understanding the Components

### 1. Key Pair (RSA-2048)

**Purpose:** Cryptographic control of the DID

-   **Private Key:** Used to sign claims and prove control of the DID
-   **Public Key:** Published in the DID document for verification

**Algorithm:** PS256 (RSA-PSS with SHA-256)

### 2. X.509 Certificate

**Purpose:** PKI integration and trust establishment

-   **Self-signed** for demo purposes
-   In production, use CA-signed certificates
-   Referenced via `x5u` field in public key JWK

**Important:** The certificate for DID control is SEPARATE from ngrok's SSL certificate:

-   **ngrok SSL cert**: Secures the HTTPS transport (you don't control this)
-   **DID control cert**: Proves control of the DID (you generate and control this)

### 3. DID Document

**Purpose:** W3C-compliant identity document

**Key Sections:**

-   `@context`: JSON-LD context for vocabulary
-   `id`: The DID identifier
-   `verificationMethod`: Public keys for verification
-   `assertionMethod`: Keys authorized for assertions
-   `authentication`: Keys for authentication (optional)
-   `service`: Service endpoints (optional)

### 4. DID Resolution

**Process:**

1. Parse DID: `did:web:domain.com` → `https://domain.com/.well-known/did.json`
2. Fetch DID document via HTTPS
3. Verify certificate chain (optional)
4. Return DID document

## 🔄 Advanced Usage

### Adding Multiple Verification Methods

Edit `2-create-did-document.js` to add multiple keys:

```javascript
verificationMethod: [
    {
        id: `${didId}#key-1`,
        type: "JsonWebKey2020",
        controller: didId,
        publicKeyJwk: publicKeyJWK1,
    },
    {
        id: `${didId}#key-2`,
        type: "JsonWebKey2020",
        controller: didId,
        publicKeyJwk: publicKeyJWK2,
    },
]
```

### Adding Service Endpoints

Example service endpoints:

```javascript
service: [
    {
        id: `${didId}#linked-domain`,
        type: "LinkedDomains",
        serviceEndpoint: "https://example.com",
    },
    {
        id: `${didId}#vc-service`,
        type: "VerifiableCredentialService",
        serviceEndpoint: "https://example.com/credentials",
    },
]
```

### Using with Path Components

Create nested DIDs:

```
did:web:domain.com:users:alice
→ https://domain.com/users/alice/did.json

did:web:domain.com:tenants:acme:users:bob
→ https://domain.com/tenants/acme/users/bob/did.json
```

## 🛡️ Security Considerations

### For Demo/Presentation

-   ✅ Self-signed certificates are fine
-   ✅ Store keys locally
-   ✅ Use ngrok free tier
-   ✅ Share DID publicly

### For Production

-   ⚠️ Use CA-signed certificates
-   ⚠️ Store keys in HSM or secure vault
-   ⚠️ Use proper domain with SSL
-   ⚠️ Implement key rotation
-   ⚠️ Monitor for unauthorized changes
-   ⚠️ Consider certificate revocation

## 📚 References

-   [W3C DID Core Specification](https://www.w3.org/TR/did-core/)
-   [DID:web Method Specification](https://w3c-ccg.github.io/did-method-web/)
-   [Universal DID Resolver](https://dev.uniresolver.io/)
-   [JSON Web Key (JWK) - RFC 7517](https://tools.ietf.org/html/rfc7517)
-   [X.509 Certificates - RFC 5280](https://tools.ietf.org/html/rfc5280)

## 🤝 Contributing

This is a demonstration project. Feel free to:

-   Report issues
-   Suggest improvements
-   Fork the repo
-   Add new features

## 📄 License

MIT License

## 💡 Troubleshooting

### Docker Issues

#### Docker Build Fails with "DOMAIN required" Error

**Problem:** Forgot to provide DOMAIN build argument
**Solution:**

```bash
docker build --build-arg DOMAIN=your-domain.ngrok-free.app -t did-web-demo .
```

#### Container Exits Immediately

**Problem:** Check logs for errors
**Solution:**

```bash
docker logs did-web-demo
```

#### Port 3000 Already in Use

**Problem:** Another service using port 3000
**Solution:**

```bash
# Use a different port
docker run -d -p 3001:3000 --name did-web-demo did-web-demo

# Or stop the conflicting service
lsof -ti:3000 | xargs kill
```

#### Can't Access DID Document

**Problem:** Container not running or ngrok not configured
**Solution:**

```bash
# Check container status
docker ps

# Check if server is responding
curl http://localhost:3000/health

# Verify ngrok is running with correct domain
```

#### Rebuild with Different Domain

**Problem:** Need to change domain after building
**Solution:**

```bash
# Remove old container and image
docker rm -f did-web-demo
docker rmi did-web-demo

# Rebuild with new domain
docker build --build-arg DOMAIN=new-domain.ngrok-free.app -t did-web-demo .
docker run -d -p 3000:3000 --name did-web-demo did-web-demo
```

### Manual Setup Issues

#### "Public key not found" Error

**Solution:** Run `npm run generate-keys` first

#### ngrok Domain Mismatch

**Solution:** Ensure the domain in ngrok matches the domain used in `npm run create-did`

#### DID Resolution Fails

**Checks:**

1. Is the server running? (`npm start` or `docker ps`)
2. Is ngrok connected and forwarding?
3. Does the domain match?
4. Can you access `https://your-domain/.well-known/did.json` directly?

#### Certificate Issues

**Solution:** If OpenSSL is not available, the script falls back to a placeholder certificate. Install OpenSSL for proper certificate generation.

## 🎉 Success Indicators

You've successfully set up DID:web when:

-   ✅ Universal resolver can resolve your DID
-   ✅ DID document is accessible via HTTPS
-   ✅ Certificate chain is available at x5u URL
-   ✅ Public key JWK matches your generated key

---

**Happy DID Demo!** 🚀

For questions or issues, please refer to the documentation or create an issue in the repository
