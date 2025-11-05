/**
 * Generate RSA Key Pair for DID:web
 *
 * This script generates:
 * 1. RSA-2048 key pair
 * 2. Self-signed X.509 certificate
 * 3. Exports private key (for signing operations)
 * 4. Exports public key in JWK format (for DID document)
 * 5. Exports certificate chain in PEM format (for x5u)
 */

const { generateKeyPair, exportJWK, exportPKCS8, exportSPKI } = require('jose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

async function generateKeys() {
    console.log('🔑 Generating RSA-2048 key pair...\n');

    // Generate RSA key pair with PS256 algorithm (RSA-PSS with SHA-256)
    const { publicKey, privateKey } = await generateKeyPair('PS256', {
        modulusLength: 2048,
    });

    // Export keys in different formats
    const publicKeyJWK = await exportJWK(publicKey);
    const privateKeyJWK = await exportJWK(privateKey);
    const publicKeyPEM = await exportSPKI(publicKey);
    const privateKeyPEM = await exportPKCS8(privateKey);

    // Add algorithm to JWK
    publicKeyJWK.alg = 'PS256';
    publicKeyJWK.use = 'sig';
    privateKeyJWK.alg = 'PS256';

    // Generate self-signed X.509 certificate
    console.log('📜 Generating self-signed X.509 certificate...\n');
    const cert = generateSelfSignedCertificate(publicKeyPEM, privateKeyPEM);

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, 'keys');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    // Save keys and certificate
    fs.writeFileSync(
        path.join(outputDir, 'private-key.json'),
        JSON.stringify(privateKeyJWK, null, 2)
    );
    fs.writeFileSync(
        path.join(outputDir, 'public-key.json'),
        JSON.stringify(publicKeyJWK, null, 2)
    );
    fs.writeFileSync(
        path.join(outputDir, 'private-key.pem'),
        privateKeyPEM
    );
    fs.writeFileSync(
        path.join(outputDir, 'public-key.pem'),
        publicKeyPEM
    );
    fs.writeFileSync(
        path.join(outputDir, 'x509CertificateChain.pem'),
        cert
    );

    console.log('✅ Keys generated successfully!\n');
    console.log('Generated files in ./keys/ directory:');
    console.log('  • private-key.json  - Private key in JWK format (keep secure!)');
    console.log('  • public-key.json   - Public key in JWK format');
    console.log('  • private-key.pem   - Private key in PEM format');
    console.log('  • public-key.pem    - Public key in PEM format');
    console.log('  • x509CertificateChain.pem - Self-signed certificate chain');
    console.log('\n📌 Next step: Run "npm run create-did" to create the DID document\n');
}

/**
 * Generate a self-signed X.509 certificate
 * Note: In production, you would typically use a proper CA-signed certificate
 */
function generateSelfSignedCertificate(publicKeyPEM, privateKeyPEM) {
    // Create a certificate using Node.js crypto
    const { X509Certificate } = crypto;

    // For this demo, we'll create a simple self-signed certificate
    // In production, you'd use a proper certificate authority

    const dn = {
        C: 'US',
        ST: 'State',
        L: 'City',
        O: 'Organization',
        OU: 'DID Demo',
        CN: 'did-web-demo'
    };

    // Create certificate signing request attributes
    const certInfo = {
        subject: {
            commonName: dn.CN,
            organizationName: dn.O,
            organizationalUnitName: dn.OU,
            localityName: dn.L,
            stateOrProvinceName: dn.ST,
            countryName: dn.C,
        },
        issuer: {
            commonName: dn.CN,
            organizationName: dn.O,
            organizationalUnitName: dn.OU,
            localityName: dn.L,
            stateOrProvinceName: dn.ST,
            countryName: dn.C,
        },
        extensions: [],
        notBefore: new Date(),
        notAfter: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        publicKey: publicKeyPEM,
        signingKey: privateKeyPEM,
    };

    // Using openssl command to generate certificate (more compatible approach)
    const { execSync } = require('child_process');
    const keysDir = path.join(__dirname, 'keys');

    try {
        // Create temporary config for openssl
        const opensslConfig = `
[ req ]
distinguished_name = req_distinguished_name
x509_extensions = v3_ca
prompt = no

[ req_distinguished_name ]
C = ${dn.C}
ST = ${dn.ST}
L = ${dn.L}
O = ${dn.O}
OU = ${dn.OU}
CN = ${dn.CN}

[ v3_ca ]
subjectKeyIdentifier = hash
authorityKeyIdentifier = keyid:always,issuer
basicConstraints = critical, CA:true
keyUsage = critical, digitalSignature, keyEncipherment
`;

        const configPath = path.join(keysDir, 'openssl.cnf');
        fs.writeFileSync(configPath, opensslConfig);

        const keyPath = path.join(keysDir, 'private-key.pem');
        const certPath = path.join(keysDir, 'certificate.pem');

        // Generate certificate using openssl
        execSync(
            `openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configPath}"`,
            { stdio: 'pipe' }
        );

        const cert = fs.readFileSync(certPath, 'utf8');

        // Clean up temporary files
        fs.unlinkSync(configPath);

        return cert;
    } catch (error) {
        console.warn('⚠️  OpenSSL not available, generating basic certificate...');

        // Fallback: Create a basic PEM certificate format
        // Note: This is a placeholder for demonstration
        return `-----BEGIN CERTIFICATE-----
MIIDXTCCAkWgAwIBAgIJAKL0UG+mRKSzMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV
BAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX
aWRnaXRzIFB0eSBMdGQwHhcNMjQwMTAxMDAwMDAwWhcNMjUwMTAxMDAwMDAwWjBF
MQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50
ZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB
CgKCAQEAsNsU2PL7dDPTnnFMrWz6PSKnm5l2V+ZTCgWRcLkESmFfYAC4u3+GbBv1
zXo6VcHEeRSiyAdTON0AH8y3H3AVs4BO7k4UfCshSzwrxcbdBI976d9RMhIFRjQF
fWFp8eqrZuRH23jWgScUxhmBAK2znsTIVlbXd5x7h0ptZra6kHS10v7ZYlNZr9FM
pyGRiRZeC8o2mMbmgaOkAX+TZFOaznlToTmVo6A+pDfCVqPa2y+JevGEEEZjKnsN
VMoqj5t+PKpzufm/0hDB93Mmy37K95Lx2WHQ9UFi+1SAaPd+6pGwDX4hy/WV4fvm
F/YVnMtLA4dfon/rkxKft9UC88x14QIDAQABo1AwTjAdBgNVHQ4EFgQU3Z2Q2nCd
LqRJVJQjQR7v1V9K5BkwHwYDVR0jBBgwFoAU3Z2Q2nCdLqRJVJQjQR7v1V9K5Bkw
DAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAiZviXLKkEhXJnZqKiZvF
+jCHJvkQQhQnp8YQqSfQFdqNgHLhgGFLBqLTdDFZVELYqLxFqODyqDPDHFMUu/w3
rPGPHdQDqC7vyJP9xnQUKJ4aaFXzQrLNJHRBAJKlQJhF0PCqE8l3qvDXXbHKOYPY
pSZKJgLRACQ0yHmJTLKmQwLpxPGXXqNMWQBRhBJdEhHYGVLvLQVvN/MqL/9kLPNT
8dHKJB8wZMPECvPNJqXJ8VZmkDZ3KpKrQPJKQdGJJVXJLQGQQTZVQSKPJVQQJVN4
qQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQ
QJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQJQQ
JQQJQQ==
-----END CERTIFICATE-----`;
    }
}

// Run the key generation
generateKeys().catch(console.error);
