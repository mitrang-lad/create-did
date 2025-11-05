/**
 * Create DID Document for DID:web (Non-Interactive for Docker)
 *
 * This script creates a DID document without user interaction,
 * using environment variables or command line arguments.
 *
 * Usage:
 *   node create-did-docker.js <domain>
 *   DOMAIN=example.com node create-did-docker.js
 */

const fs = require('fs');
const path = require('path');

function createDIDDocument() {
    console.log('\n📝 DID Document Creator (Docker Mode)\n');
    console.log('=' .repeat(50));

    // Get domain from command line argument or environment variable
    const domain = process.argv[2] || process.env.DOMAIN;

    if (!domain || domain.trim() === '') {
        console.error('❌ Domain is required!');
        console.error('Usage: node create-did-docker.js <domain>');
        console.error('   or: DOMAIN=example.com node create-did-docker.js');
        process.exit(1);
    }

    // Check if keys exist
    const keysDir = path.join(__dirname, 'keys');
    const publicKeyPath = path.join(keysDir, 'public-key.json');

    if (!fs.existsSync(publicKeyPath)) {
        console.error('❌ Public key not found!');
        console.log('Keys should be generated during Docker build.\n');
        process.exit(1);
    }

    // Read public key
    const publicKeyJWK = JSON.parse(fs.readFileSync(publicKeyPath, 'utf8'));

    // Create DID without path component (Docker mode is simple)
    const didId = `did:web:${domain.trim()}`;
    console.log(`✅ Creating DID: ${didId}\n`);

    // Construct x5u URL (always use .well-known for Docker mode)
    const x5uURL = `https://${domain.trim()}/.well-known/x509CertificateChain.pem`;

    // Add x5u to public key JWK
    publicKeyJWK.x5u = x5uURL;

    // Fragment identifier for verification method
    const fragmentId = 'JWK2020-RSA';

    // Create DID Document (minimal for Docker mode)
    const didDocument = {
        '@context': ['https://www.w3.org/ns/did/v1'],
        id: didId,
        verificationMethod: [
            {
                '@context': 'https://w3c-ccg.github.io/lds-jws2020/contexts/v1/',
                id: `${didId}#${fragmentId}`,
                type: 'JsonWebKey2020',
                controller: didId,
                publicKeyJwk: publicKeyJWK
            }
        ],
        assertionMethod: [`${didId}#${fragmentId}`]
    };

    // No authentication or service endpoints in Docker mode (keep it simple)
    console.log('Docker Mode: No authentication or service endpoints added');

    // Create output directory
    const outputDir = path.join(__dirname, 'did-document');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Save DID document
    const didDocPath = path.join(outputDir, 'did.json');
    fs.writeFileSync(didDocPath, JSON.stringify(didDocument, null, 2));

    // Create .well-known structure for hosting
    const wellKnownDir = path.join(__dirname, '.well-known');
    if (!fs.existsSync(wellKnownDir)) {
        fs.mkdirSync(wellKnownDir);
    }

    fs.writeFileSync(path.join(wellKnownDir, 'did.json'), JSON.stringify(didDocument, null, 2));

    // Copy certificate to .well-known
    const certSource = path.join(keysDir, 'x509CertificateChain.pem');
    const certDest = path.join(wellKnownDir, 'x509CertificateChain.pem');
    fs.copyFileSync(certSource, certDest);

    console.log('\n✅ DID Document created successfully!\n');
    console.log('Generated files:');
    console.log('  • did-document/did.json');
    console.log('  • .well-known/did.json');
    console.log('  • .well-known/x509CertificateChain.pem');

    console.log('\n📋 DID Document:');
    console.log('=' .repeat(50));
    console.log(JSON.stringify(didDocument, null, 2));
    console.log('=' .repeat(50));

    console.log('\n✅ Ready to start server!');
    console.log(`🆔 DID: ${didId}`);
    console.log(`🔗 Resolve at: https://dev.uniresolver.io/#${didId}\n`);
}

try {
    createDIDDocument();
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
}
