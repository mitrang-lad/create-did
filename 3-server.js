/**
 * Simple HTTP Server for hosting DID:web documents
 *
 * This server hosts:
 * 1. DID Document at /.well-known/did.json or /path/did.json
 * 2. X.509 Certificate Chain at /.well-known/x509CertificateChain.pem or /path/x509CertificateChain.pem
 * 3. Simple demo UI at root path
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins (useful for testing with DID resolvers)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Serve static files from .well-known directory
app.use('/.well-known', express.static(path.join(__dirname, '.well-known')));

// Check if there are any custom path directories and serve them
const currentDir = __dirname;
const entries = fs.readdirSync(currentDir, { withFileTypes: true });

// Serve any directories that contain did.json (excluding node_modules, .well-known, etc.)
const excludedDirs = ['node_modules', 'keys', 'did-document', '.well-known', '.git'];
entries.forEach(entry => {
    if (entry.isDirectory() && !excludedDirs.includes(entry.name) && !entry.name.startsWith('.')) {
        const didPath = path.join(currentDir, entry.name, 'did.json');
        if (fs.existsSync(didPath)) {
            app.use(`/${entry.name}`, express.static(path.join(currentDir, entry.name)));
            console.log(`📂 Serving DID document at: /${entry.name}/did.json`);
        }
    }
});

// Root endpoint - Demo UI
app.get('/', (req, res) => {
    const wellKnownPath = path.join(__dirname, '.well-known', 'did.json');
    let didDocument = null;
    let didId = 'Not configured yet';

    if (fs.existsSync(wellKnownPath)) {
        didDocument = JSON.parse(fs.readFileSync(wellKnownPath, 'utf8'));
        didId = didDocument.id;
    }

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DID:web Demo Server</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .content {
            padding: 40px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        .info-box {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 15px 0;
            border-radius: 4px;
        }
        .info-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 5px;
        }
        .did-id {
            font-family: 'Courier New', monospace;
            background: #edf2f7;
            padding: 10px;
            border-radius: 4px;
            word-break: break-all;
            font-size: 0.9em;
        }
        .endpoints {
            background: #f7fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 15px 0;
        }
        .endpoint {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        .endpoint-url {
            font-family: 'Courier New', monospace;
            color: #667eea;
            font-size: 0.9em;
        }
        .endpoint-url a {
            color: #667eea;
            text-decoration: none;
        }
        .endpoint-url a:hover {
            text-decoration: underline;
        }
        .badge {
            display: inline-block;
            background: #48bb78;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.85em;
            margin: 5px 0;
        }
        .badge.warning {
            background: #ed8936;
        }
        .steps {
            counter-reset: step-counter;
            list-style: none;
        }
        .steps li {
            counter-increment: step-counter;
            margin: 15px 0;
            padding-left: 50px;
            position: relative;
        }
        .steps li:before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 0;
            background: #667eea;
            color: white;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }
        code {
            background: #2d3748;
            color: #68d391;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        .footer {
            background: #f7fafc;
            padding: 20px 40px;
            text-align: center;
            color: #718096;
            border-top: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 DID:web Demo Server</h1>
            <p>Decentralized Identifiers for Self-Sovereign Identity</p>
        </div>

        <div class="content">
            <div class="section">
                <h2>📋 Server Status</h2>
                <div class="info-box">
                    <span class="badge">✓ Server Running</span>
                    <span class="badge ${didDocument ? '' : 'warning'}">${didDocument ? '✓ DID Configured' : '⚠ DID Not Configured'}</span>
                </div>
            </div>

            ${didDocument ? `
            <div class="section">
                <h2>🆔 DID Identifier</h2>
                <div class="did-id">${didId}</div>
            </div>

            <div class="section">
                <h2>🔗 Available Endpoints</h2>
                <div class="endpoints">
                    <div class="endpoint">
                        <strong>DID Document</strong>
                        <div class="endpoint-url">
                            <a href="/.well-known/did.json" target="_blank">
                                ${req.protocol}://${req.get('host')}/.well-known/did.json
                            </a>
                        </div>
                    </div>
                    <div class="endpoint">
                        <strong>X.509 Certificate Chain</strong>
                        <div class="endpoint-url">
                            <a href="/.well-known/x509CertificateChain.pem" target="_blank">
                                ${req.protocol}://${req.get('host')}/.well-known/x509CertificateChain.pem
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>🔍 Resolve Your DID</h2>
                <div class="info-box">
                    <p>Use a universal DID resolver to verify your DID:</p>
                    <div class="endpoint-url" style="margin-top: 10px;">
                        <a href="https://dev.uniresolver.io/#${didId}" target="_blank">
                            https://dev.uniresolver.io/#${didId}
                        </a>
                    </div>
                </div>
            </div>
            ` : `
            <div class="section">
                <h2>🚀 Getting Started</h2>
                <ol class="steps">
                    <li>Generate keys: <code>npm run generate-keys</code></li>
                    <li>Create DID document: <code>npm run create-did</code></li>
                    <li>Restart this server to load the DID document</li>
                    <li>Use ngrok to expose your server with a domain</li>
                </ol>
            </div>
            `}

            <div class="section">
                <h2>📚 About DID:web</h2>
                <div class="info-box">
                    <p><strong>What is DID:web?</strong></p>
                    <p>
                        DID:web is a DID method that uses web domains for decentralized identifiers.
                        It leverages existing web infrastructure (HTTPS, DNS) to provide a simple
                        way to create and resolve DIDs without requiring a blockchain.
                    </p>
                    <br>
                    <p><strong>Format:</strong> <code>did:web:domain.com</code> or <code>did:web:domain.com:path</code></p>
                    <br>
                    <p><strong>Resolution:</strong> DID documents are hosted at <code>https://domain/.well-known/did.json</code></p>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>DID:web Demo Server | Port ${PORT}</p>
            <p style="margin-top: 10px; font-size: 0.9em;">
                Learn more: <a href="https://w3c-ccg.github.io/did-method-web/" target="_blank" style="color: #667eea;">DID:web Specification</a>
            </p>
        </div>
    </div>
</body>
</html>
    `;

    res.send(html);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        port: PORT
    });
});

// API endpoint to get DID document info
app.get('/api/did-info', (req, res) => {
    const wellKnownPath = path.join(__dirname, '.well-known', 'did.json');

    if (!fs.existsSync(wellKnownPath)) {
        return res.status(404).json({
            error: 'DID document not found',
            message: 'Please run the setup scripts first'
        });
    }

    const didDocument = JSON.parse(fs.readFileSync(wellKnownPath, 'utf8'));

    res.json({
        did: didDocument.id,
        document: didDocument,
        endpoints: {
            didDocument: `${req.protocol}://${req.get('host')}/.well-known/did.json`,
            certificate: `${req.protocol}://${req.get('host')}/.well-known/x509CertificateChain.pem`,
            resolver: `https://dev.uniresolver.io/#${didDocument.id}`
        }
    });
});

// Error handling for 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Endpoint ${req.path} not found`,
        availableEndpoints: [
            '/',
            '/.well-known/did.json',
            '/.well-known/x509CertificateChain.pem',
            '/health',
            '/api/did-info'
        ]
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 DID:web Server Started!');
    console.log('='.repeat(60));
    console.log(`\n📍 Server running on: http://localhost:${PORT}`);
    console.log(`\n🌐 Available endpoints:`);
    console.log(`   • Home:         http://localhost:${PORT}/`);
    console.log(`   • DID Document: http://localhost:${PORT}/.well-known/did.json`);
    console.log(`   • Certificate:  http://localhost:${PORT}/.well-known/x509CertificateChain.pem`);
    console.log(`   • API Info:     http://localhost:${PORT}/api/did-info`);
    console.log(`   • Health:       http://localhost:${PORT}/health`);

    // Check if DID document exists
    const wellKnownPath = path.join(__dirname, '.well-known', 'did.json');
    if (fs.existsSync(wellKnownPath)) {
        const didDocument = JSON.parse(fs.readFileSync(wellKnownPath, 'utf8'));
        console.log(`\n🆔 DID: ${didDocument.id}`);
        console.log('\n✅ Ready to serve DID:web documents!');
    } else {
        console.log('\n⚠️  DID document not found!');
        console.log('   Run the following commands to set up:');
        console.log('   1. npm run generate-keys');
        console.log('   2. npm run create-did');
    }

    console.log('\n💡 To expose with ngrok:');
    console.log('   ngrok http 3000 --domain=your-domain.ngrok-free.app');
    console.log('\n' + '='.repeat(60) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('✅ HTTP server closed');
    });
});
