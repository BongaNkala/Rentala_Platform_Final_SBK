const http = require('http');
const encryption = require('./middleware/encryption');

/**
 * Security Testing Suite
 * Tests all security features of the Rentala Platform
 */

const BASE_URL = 'http://localhost:3002';
let testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

/**
 * Make HTTP request
 */
function makeRequest(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(BASE_URL + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body ? JSON.parse(body) : null
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

/**
 * Test result logger
 */
function logTest(name, passed, message = '') {
    const status = passed ? `${colors.green}✓ PASS${colors.reset}` : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${status} - ${name}`);
    if (message) console.log(`  ${colors.yellow}${message}${colors.reset}`);
    
    testResults.tests.push({ name, passed, message });
    if (passed) testResults.passed++;
    else testResults.failed++;
}

/**
 * Test Suite
 */
async function runSecurityTests() {
    console.log(`\n${colors.blue}╔═══════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║  🔒 Rentala Security Test Suite      ║${colors.reset}`);
    console.log(`${colors.blue}╚═══════════════════════════════════════╝${colors.reset}\n`);

    // Test 1: Health Check
    console.log(`${colors.blue}[1] Basic Connectivity${colors.reset}`);
    try {
        const health = await makeRequest('GET', '/api/health');
        logTest('Health endpoint accessible', health.status === 200, `Status: ${health.status}`);
    } catch (e) {
        logTest('Health endpoint accessible', false, e.message);
    }

    // Test 2: Authentication - Register
    console.log(`\n${colors.blue}[2] Authentication - Registration${colors.reset}`);
    let testToken = null;
    try {
        const register = await makeRequest('POST', '/api/auth/register', {
            email: `test${Date.now()}@rentala.com`,
            password: 'TestPassword123!',
            firstName: 'Test',
            lastName: 'User'
        });
        logTest('User registration', register.status === 201, `Status: ${register.status}`);
        if (register.body && register.body.token) {
            testToken = register.body.token;
        }
    } catch (e) {
        logTest('User registration', false, e.message);
    }

    // Test 3: Authentication - Login
    console.log(`\n${colors.blue}[3] Authentication - Login${colors.reset}`);
    try {
        const login = await makeRequest('POST', '/api/auth/login', {
            email: 'demo@rentala.com',
            password: 'demopassword123'
        });
        logTest('Demo user login', login.status === 200, `Status: ${login.status}`);
        if (login.body && login.body.token) {
            testToken = login.body.token;
        }
    } catch (e) {
        logTest('Demo user login', false, e.message);
    }

    // Test 4: Rate Limiting
    console.log(`\n${colors.blue}[4] Rate Limiting${colors.reset}`);
    try {
        let rateLimitHit = false;
        for (let i = 0; i < 7; i++) {
            const response = await makeRequest('POST', '/api/auth/login', {
                email: 'test@rentala.com',
                password: 'wrongpassword'
            });
            if (response.status === 429) {
                rateLimitHit = true;
                break;
            }
        }
        logTest('Rate limiting enforced', rateLimitHit, 'Rate limit triggered after multiple requests');
    } catch (e) {
        logTest('Rate limiting enforced', false, e.message);
    }

    // Test 5: Input Sanitization - XSS Prevention
    console.log(`\n${colors.blue}[5] Input Sanitization${colors.reset}`);
    try {
        const xssPayload = '<script>alert("XSS")</script>';
        const response = await makeRequest('POST', '/api/auth/register', {
            email: `test${Date.now()}@rentala.com`,
            password: 'TestPassword123!',
            firstName: xssPayload,
            lastName: 'User'
        });
        
        // Check if XSS payload was sanitized
        const sanitized = response.body && response.body.user && 
                         !response.body.user.firstName.includes('<script>');
        logTest('XSS payload sanitized', sanitized, 'Script tags removed from input');
    } catch (e) {
        logTest('XSS payload sanitized', false, e.message);
    }

    // Test 6: Authentication Required
    console.log(`\n${colors.blue}[6] Authentication Requirements${colors.reset}`);
    try {
        const response = await makeRequest('GET', '/api/properties');
        logTest('Unauthenticated request blocked', response.status === 401, `Status: ${response.status}`);
    } catch (e) {
        logTest('Unauthenticated request blocked', false, e.message);
    }

    // Test 7: Authorized Request
    console.log(`\n${colors.blue}[7] Authorized Access${colors.reset}`);
    if (testToken) {
        try {
            const response = await makeRequest('GET', '/api/properties', null, testToken);
            logTest('Authenticated request successful', response.status === 200, `Status: ${response.status}`);
        } catch (e) {
            logTest('Authenticated request successful', false, e.message);
        }
    } else {
        logTest('Authenticated request successful', false, 'No valid token available');
    }

    // Test 8: Encryption Functions
    console.log(`\n${colors.blue}[8] Encryption & Hashing${colors.reset}`);
    try {
        const testData = 'sensitive-data-123';
        const encrypted = encryption.encryptField(testData);
        const decrypted = encryption.decryptField(encrypted);
        
        logTest('Data encryption/decryption', decrypted === testData, 'Data encrypted and decrypted correctly');
        
        const hash = encryption.hashField(testData);
        const verified = encryption.verifyHash(testData, hash);
        logTest('Data hashing', verified, 'Hash verification successful');
        
        const token = encryption.generateToken();
        logTest('Secure token generation', token.length === 64, `Token length: ${token.length}`);
    } catch (e) {
        logTest('Encryption functions', false, e.message);
    }

    // Test 9: Encryption Key Validation
    console.log(`\n${colors.blue}[9] Encryption Key Validation${colors.reset}`);
    try {
        const validation = encryption.validateEncryptionKey();
        logTest('Encryption key valid', validation.isValid, `Key length: ${validation.keyLength} bytes`);
    } catch (e) {
        logTest('Encryption key valid', false, e.message);
    }

    // Test 10: Sensitive Data Masking
    console.log(`\n${colors.blue}[10] Data Masking${colors.reset}`);
    try {
        const sensitive = '1234567890';
        const masked = encryption.maskSensitiveData(sensitive, 4);
        const isMasked = masked.includes('****') && masked.startsWith('1234');
        logTest('Sensitive data masked', isMasked, `Original: ${sensitive}, Masked: ${masked}`);
    } catch (e) {
        logTest('Sensitive data masked', false, e.message);
    }

    // Test 11: Metrics Endpoint
    console.log(`\n${colors.blue}[11] Protected Endpoints${colors.reset}`);
    if (testToken) {
        try {
            const response = await makeRequest('GET', '/api/metrics/overview', null, testToken);
            logTest('Metrics endpoint accessible', response.status === 200, `Status: ${response.status}`);
        } catch (e) {
            logTest('Metrics endpoint accessible', false, e.message);
        }
    } else {
        logTest('Metrics endpoint accessible', false, 'No valid token available');
    }

    // Test 12: CORS Headers
    console.log(`\n${colors.blue}[12] Security Headers${colors.reset}`);
    try {
        const response = await makeRequest('GET', '/api/health');
        const hasSecurityHeaders = 
            response.headers['x-content-type-options'] === 'nosniff' ||
            response.headers['x-frame-options'] === 'DENY' ||
            response.headers['x-xss-protection'];
        
        logTest('Security headers present', hasSecurityHeaders, 'CORS and security headers configured');
    } catch (e) {
        logTest('Security headers present', false, e.message);
    }

    // Summary
    console.log(`\n${colors.blue}╔═══════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.blue}║  📊 Test Results Summary              ║${colors.reset}`);
    console.log(`${colors.blue}╠═══════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.blue}║  Total Tests: ${testResults.passed + testResults.failed}${' '.repeat(24)}║${colors.reset}`);
    console.log(`${colors.green}║  Passed: ${testResults.passed}${' '.repeat(28)}║${colors.reset}`);
    console.log(`${colors.red}║  Failed: ${testResults.failed}${' '.repeat(28)}║${colors.reset}`);
    
    const passPercentage = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
    console.log(`${colors.blue}║  Success Rate: ${passPercentage}%${' '.repeat(20)}║${colors.reset}`);
    console.log(`${colors.blue}╚═══════════════════════════════════════╝${colors.reset}\n`);

    // Exit with appropriate code
    process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runSecurityTests().catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
});
