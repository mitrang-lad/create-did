/**
 * Create DID Document for DID:web
 *
 * This script creates a DID document conforming to the W3C DID specification
 * using the public key generated in step 1.
 *
 * DID:web format: did:web:<domain>[:path]
 * Example: did:web:example.com
 *          did:web:example.ngrok-free.app
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function createDIDDocument() {
    console.log('\n📝 DID Document Creator for did:web\n');
    console.log('=' .repeat(50));

    // Check if keys exist
    const keysDir = path.join(__dirname, 'keys');
    const publicKeyPath = path.join(keysDir, 'public-key.json');

    if (!fs.existsSync(publicKeyPath)) {
        console.error('❌ Public key not found!');
        console.log('Please run "npm run generate-keys" first.\n');
        rl.close();
        process.exit(1);
    }

    // Read public key
    const publicKeyJWK = JSON.parse(fs.readFileSync(publicKeyPath, 'utf8'));

    // Get domain from user
    console.log('\nEnter your domain (without https://):');
    console.log('Examples:');
    console.log('  • example.com');
    console.log('  • abc123.ngrok-free.app');
    console.log('  • did.learn.smartsenselabs.com');
    const domain = await question('\nDomain: ');

    if (!domain || domain.trim() === '') {
        console.error('❌ Domain is required!');
        rl.close();
        process.exit(1);
    }

    // Ask if there's a path component (optional)
    const hasPath = await question('\nDo you want to add a path? (y/n): ');
    let pathComponent = '';
    let didId = '';

    if (hasPath.toLowerCase() === 'y') {
        pathComponent = await question('Enter path (e.g., "user" or "tenant/user"): ');
        // Convert path separators to colons for DID format
        const didPath = pathComponent.split('/').join(':');
        didId = `did:web:${domain.trim()}:${didPath}`;
    } else {
        didId = `did:web:${domain.trim()}`;
    }

    console.log(`\n✅ Creating DID: ${didId}\n`);

    // Construct x5u URL
    let x5uURL;
    if (pathComponent) {
        x5uURL = `https://${domain.trim()}/${pathComponent}/x509CertificateChain.pem`;
    } else {
        x5uURL = `https://${domain.trim()}/.well-known/x509CertificateChain.pem`;
    }

    // Add x5u to public key JWK
    publicKeyJWK.x5u = x5uURL;

    // Fragment identifier for verification method
    const fragmentId = 'JWK2020-RSA';

    // Create DID Document
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

    // Optionally add authentication
    const addAuth = await question('\nAdd authentication method? (y/n): ');
    if (addAuth.toLowerCase() === 'y') {
        didDocument.authentication = [`${didId}#${fragmentId}`];
    }

    // Optionally add services
    const addService = await question('Add service endpoints? (y/n): ');
    if (addService.toLowerCase() === 'y') {
        didDocument.service = [];

        let addMore = true;
        while (addMore) {
            const serviceType = await question('  Service type (e.g., "LinkedDomains", "VerifiableCredentialService"): ');
            const serviceEndpoint = await question('  Service endpoint URL: ');

            didDocument.service.push({
                id: `${didId}#${serviceType.toLowerCase()}`,
                type: serviceType,
                serviceEndpoint: serviceEndpoint
            });

            const more = await question('  Add another service? (y/n): ');
            addMore = more.toLowerCase() === 'y';
        }
    }

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

    // For did:web, the DID document should be hosted at:
    // - https://domain/.well-known/did.json (for did:web:domain)
    // - https://domain/path/did.json (for did:web:domain:path)

    if (pathComponent) {
        // Create path structure
        const pathDir = path.join(__dirname, pathComponent);
        if (!fs.existsSync(pathDir)) {
            fs.mkdirSync(pathDir, { recursive: true });
        }
        fs.writeFileSync(path.join(pathDir, 'did.json'), JSON.stringify(didDocument, null, 2));

        // Copy certificate to path location
        const certSource = path.join(keysDir, 'x509CertificateChain.pem');
        const certDest = path.join(pathDir, 'x509CertificateChain.pem');
        fs.copyFileSync(certSource, certDest);

        console.log('\n✅ DID Document created successfully!\n');
        console.log('Generated files:');
        console.log(`  • did-document/did.json - DID Document`);
        console.log(`  • ${pathComponent}/did.json - DID Document (for hosting)`);
        console.log(`  • ${pathComponent}/x509CertificateChain.pem - Certificate chain`);
    } else {
        fs.writeFileSync(path.join(wellKnownDir, 'did.json'), JSON.stringify(didDocument, null, 2));

        // Copy certificate to .well-known
        const certSource = path.join(keysDir, 'x509CertificateChain.pem');
        const certDest = path.join(wellKnownDir, 'x509CertificateChain.pem');
        fs.copyFileSync(certSource, certDest);

        console.log('\n✅ DID Document created successfully!\n');
        console.log('Generated files:');
        console.log('  • did-document/did.json - DID Document');
        console.log('  • .well-known/did.json - DID Document (for hosting)');
        console.log('  • .well-known/x509CertificateChain.pem - Certificate chain');
    }

    console.log('\n📋 DID Document Preview:');
    console.log('=' .repeat(50));
    console.log(JSON.stringify(didDocument, null, 2));
    console.log('=' .repeat(50));

    console.log('\n📌 Next steps:');
    console.log('1. Run "npm start" to start the server');
    console.log('2. Use ngrok to expose your server:');
    console.log(`   ngrok http 3000 --domain=${domain.trim()}`);
    console.log('3. Resolve your DID using a DID resolver');
    console.log(`   Example: https://dev.uniresolver.io/#${didId}`);
    console.log('');

    rl.close();
}

createDIDDocument().catch((error) => {
    console.error('Error:', error);
    rl.close();
    process.exit(1);
});
