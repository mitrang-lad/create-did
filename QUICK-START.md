# 🚀 Quick Start Guide

## For Your Presentation Demo

### Prerequisites

-   Docker installed
-   ngrok account with static domain (or free random domain)

### The Simplest Way (3 Commands!)

```bash
# 1. Build (replace with your ngrok domain)
docker build --build-arg DOMAIN=your-domain.ngrok-free.app -t did-web-demo .

# 2. Run
docker run -d -p 3000:3000 --name did-web-demo did-web-demo

# 3. Expose with ngrok (use SAME domain as build)
ngrok http 3000 --domain=your-domain.ngrok-free.app
```

That's it! Your DID is now live and resolvable.

### Verify It Works

**Check locally:**

```bash
curl http://localhost:3000/.well-known/did.json
```

**Check via ngrok:**

```bash
curl https://your-domain.ngrok-free.app/.well-known/did.json
```

**Resolve via Universal Resolver:**
Visit: `https://dev.uniresolver.io/#did:web:your-domain.ngrok-free.app`

### What You Get

Your DID will be:

```
did:web:your-domain.ngrok-free.app
```

Resolvable at:

```
https://your-domain.ngrok-free.app/.well-known/did.json
```

With certificate at:

```
https://your-domain.ngrok-free.app/.well-known/x509CertificateChain.pem
```

### During Your Presentation

1. **Show the Build** - Explain automated key generation

    ```bash
    docker build --build-arg DOMAIN=demo.ngrok-free.app -t did-web-demo .
    ```

    Point out the build steps generating keys and DID document.

2. **Run the Container** - Show how simple deployment is

    ```bash
    docker run -d -p 3000:3000 --name did-web-demo did-web-demo
    docker logs did-web-demo
    ```

3. **Expose with ngrok** - Demonstrate public accessibility

    ```bash
    ngrok http 3000 --domain=demo.ngrok-free.app
    ```

4. **Resolve the DID** - Show it actually works!

    - Open browser to universal resolver
    - Show the DID document
    - Explain the structure

5. **Open Demo UI** - Show the nice interface
    - Navigate to `https://demo.ngrok-free.app/`
    - Show the visual interface

### Key Points to Explain

1. **Keys are generated during build** - Not in ngrok's SSL cert
2. **x5u certificate is separate** - Your key, not ngrok's
3. **Domain must match** - Build arg and ngrok domain
4. **Fully automated** - One build, one run, done!

### Clean Up After Demo

```bash
# Stop and remove
docker stop did-web-demo
docker rm did-web-demo

# Or rebuild for another demo
docker rm -f did-web-demo
docker build --build-arg DOMAIN=new-domain.ngrok-free.app -t did-web-demo .
docker run -d -p 3000:3000 --name did-web-demo did-web-demo
```

### Alternative: Manual Setup

If you want more control or to show the process step-by-step:

```bash
# 1. Generate keys
npm run generate-keys

# 2. Create DID (interactive)
npm run create-did

# 3. Start server
npm start

# 4. Expose with ngrok
ngrok http 3000 --domain=your-domain.ngrok-free.app
```

---

## Need Help?

-   See `README.md` for detailed documentation
-   See `DOCKER.md` for Docker reference
-   Check troubleshooting section in README

## Success Checklist

-   ✅ Docker image built with your domain
-   ✅ Container running on port 3000
-   ✅ ngrok connected with same domain
-   ✅ DID document accessible via HTTPS
-   ✅ Universal resolver can resolve your DID
-   ✅ Demo UI shows your DID info

**You're ready!** 🎉
