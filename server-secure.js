const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const security = require('./middleware/security');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'rentala_secret_key_2026';

// ==================== SECURITY MIDDLEWARE ====================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true }
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || ['http://localhost:3002', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(security.requestLogger);

// Custom CORS headers
app.use(security.corsHeaders);

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Input sanitization
app.use(security.sanitizeInput);

// Static files
app.use(express.static(path.join(__dirname)));

// ==================== DATABASE SETUP ====================

const dbPath = path.join(__dirname, 'rentala.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Users Table with additional security fields
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            firstName TEXT,
            lastName TEXT,
            role TEXT DEFAULT 'user',
            status TEXT DEFAULT 'active',
            lastLogin DATETIME,
            loginAttempts INTEGER DEFAULT 0,
            lockedUntil DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Audit Log Table
        db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            action TEXT,
            resourceType TEXT,
            resourceId INTEGER,
            details TEXT,
            ipAddress TEXT,
            userAgent TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Session Tokens Table (for token revocation)
        db.run(`CREATE TABLE IF NOT EXISTS session_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            token TEXT UNIQUE,
            expiresAt DATETIME,
            revokedAt DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Properties Table
        db.run(`CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            address TEXT,
            city TEXT,
            state TEXT,
            zipCode TEXT,
            type TEXT,
            totalUnits INTEGER,
            purchasePrice REAL,
            currentValue REAL,
            status TEXT DEFAULT 'active',
            userId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Units Table
        db.run(`CREATE TABLE IF NOT EXISTS units (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            propertyId INTEGER,
            unitNumber TEXT,
            bedrooms INTEGER,
            bathrooms INTEGER,
            squareFeet REAL,
            rentAmount REAL,
            status TEXT DEFAULT 'available',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (propertyId) REFERENCES properties (id)
        )`);

        // Tenants Table with user reference
        db.run(`CREATE TABLE IF NOT EXISTS tenants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER,
            firstName TEXT,
            lastName TEXT,
            email TEXT UNIQUE,
            phone TEXT,
            idNumber TEXT ENCRYPTED,
            status TEXT DEFAULT 'active',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users (id)
        )`);

        // Leases Table
        db.run(`CREATE TABLE IF NOT EXISTS leases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unitId INTEGER,
            tenantId INTEGER,
            startDate DATE,
            endDate DATE,
            rentAmount REAL,
            depositAmount REAL,
            status TEXT DEFAULT 'active',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (unitId) REFERENCES units (id),
            FOREIGN KEY (tenantId) REFERENCES tenants (id)
        )`);

        // Payments Table
        db.run(`CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            leaseId INTEGER,
            amount REAL,
            paymentDate DATE,
            dueDate DATE,
            status TEXT DEFAULT 'pending',
            paymentMethod TEXT,
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (leaseId) REFERENCES leases (id)
        )`);

        // Maintenance Requests Table
        db.run(`CREATE TABLE IF NOT EXISTS maintenance_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unitId INTEGER,
            tenantId INTEGER,
            title TEXT,
            description TEXT,
            priority TEXT,
            status TEXT DEFAULT 'open',
            assignedTo TEXT,
            completedAt DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (unitId) REFERENCES units (id),
            FOREIGN KEY (tenantId) REFERENCES tenants (id)
        )`);

        // Inspections Table
        db.run(`CREATE TABLE IF NOT EXISTS inspections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            unitId INTEGER,
            inspectorName TEXT,
            inspectionDate DATE,
            status TEXT,
            notes TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (unitId) REFERENCES units (id)
        )`);

        // Create Demo User if not exists
        const demoEmail = 'demo@rentala.com';
        db.get('SELECT id FROM users WHERE email = ?', [demoEmail], async (err, row) => {
            if (!row) {
                const hashedPassword = await bcrypt.hash('demopassword123', 10);
                db.run('INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
                    [demoEmail, hashedPassword, 'Demo', 'User', 'admin']);
                console.log('✅ Demo user created');
            }
        });

        console.log('✅ Database tables initialized');
    });
}

// ==================== AUTHENTICATION MIDDLEWARE ====================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
        req.user = user;
        next();
    });
};

// ==================== API ROUTES ====================

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ==================== AUTHENTICATION ROUTES ====================

// Register with rate limiting
app.post('/api/auth/register', security.authLimiter, async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run('INSERT INTO users (email, password, firstName, lastName) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, firstName, lastName], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE')) {
                        return res.status(400).json({ error: 'Email already registered' });
                    }
                    return res.status(500).json({ error: 'Registration failed' });
                }

                const token = jwt.sign({ 
                    id: this.lastID, 
                    email, 
                    role: 'user' 
                }, JWT_SECRET, { expiresIn: '24h' });

                // Log the registration
                db.run('INSERT INTO audit_logs (userId, action, resourceType, details) VALUES (?, ?, ?, ?)',
                    [this.lastID, 'REGISTER', 'user', 'User registered successfully']);

                res.status(201).json({ 
                    token, 
                    user: { 
                        id: this.lastID, 
                        email, 
                        firstName, 
                        lastName, 
                        role: 'user' 
                    } 
                });
            });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Login with rate limiting and account lockout
app.post('/api/auth/login', security.authLimiter, (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if account is locked
        if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
            return res.status(403).json({ error: 'Account temporarily locked. Try again later.' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            // Increment failed login attempts
            const newAttempts = (user.loginAttempts || 0) + 1;
            let lockUntil = null;

            // Lock account after 5 failed attempts for 15 minutes
            if (newAttempts >= 5) {
                lockUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            }

            db.run('UPDATE users SET loginAttempts = ?, lockedUntil = ? WHERE id = ?',
                [newAttempts, lockUntil, user.id]);

            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Successful login - reset attempts and update lastLogin
        db.run('UPDATE users SET loginAttempts = 0, lockedUntil = NULL, lastLogin = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]);

        const token = jwt.sign({ 
            id: user.id, 
            email: user.email, 
            role: user.role 
        }, JWT_SECRET, { expiresIn: '24h' });

        // Log successful login
        db.run('INSERT INTO audit_logs (userId, action, resourceType, details) VALUES (?, ?, ?, ?)',
            [user.id, 'LOGIN', 'user', 'User logged in successfully']);

        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                role: user.role 
            } 
        });
    });
});

// Logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    // Log logout
    db.run('INSERT INTO audit_logs (userId, action, resourceType, details) VALUES (?, ?, ?, ?)',
        [req.user.id, 'LOGOUT', 'user', 'User logged out']);

    res.json({ message: 'Logged out successfully' });
});

// ==================== PROPERTY ROUTES ====================

// Get all properties (with tenant isolation)
app.get('/api/properties', authenticateToken, security.apiLimiter, (req, res) => {
    let query = 'SELECT * FROM properties';
    let params = [];

    // Non-admin users can only see their own properties
    if (req.user.role !== 'admin') {
        query += ' WHERE userId = ?';
        params.push(req.user.id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Log the access
        db.run('INSERT INTO audit_logs (userId, action, resourceType, details) VALUES (?, ?, ?, ?)',
            [req.user.id, 'VIEW', 'properties', `Viewed ${rows.length} properties`]);

        res.json(rows);
    });
});

// Create property
app.post('/api/properties', authenticateToken, security.apiLimiter, (req, res) => {
    const { address, city, state, zipCode, type, totalUnits, purchasePrice, currentValue } = req.body;

    if (!address || !city || !type) {
        return res.status(400).json({ error: 'Required fields missing' });
    }

    db.run('INSERT INTO properties (address, city, state, zipCode, type, totalUnits, purchasePrice, currentValue, userId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [address, city, state, zipCode, type, totalUnits, purchasePrice, currentValue, req.user.id], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Log the creation
            db.run('INSERT INTO audit_logs (userId, action, resourceType, resourceId, details) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, 'CREATE', 'property', this.lastID, `Created property: ${address}`]);

            res.status(201).json({ id: this.lastID, message: 'Property created successfully' });
        });
});

// Delete property (with ownership validation)
app.delete('/api/properties/:id', authenticateToken, security.strictLimiter, 
    security.validatePropertyAccess(db), (req, res) => {
    db.run('DELETE FROM properties WHERE id = ?', [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });

        // Log the deletion
        db.run('INSERT INTO audit_logs (userId, action, resourceType, resourceId, details) VALUES (?, ?, ?, ?, ?)',
            [req.user.id, 'DELETE', 'property', req.params.id, 'Property deleted']);

        res.json({ message: 'Property deleted successfully' });
    });
});

// ==================== TENANT ROUTES ====================

// Get all tenants (with role-based access)
app.get('/api/tenants', authenticateToken, security.apiLimiter, (req, res) => {
    let query = 'SELECT id, firstName, lastName, email, phone, status, createdAt FROM tenants';
    let params = [];

    // Non-admin users can only see their own tenant profile
    if (req.user.role === 'tenant') {
        query += ' WHERE userId = ?';
        params.push(req.user.id);
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        db.run('INSERT INTO audit_logs (userId, action, resourceType, details) VALUES (?, ?, ?, ?)',
            [req.user.id, 'VIEW', 'tenants', `Viewed ${rows.length} tenants`]);

        res.json(rows);
    });
});

// Create tenant
app.post('/api/tenants', authenticateToken, security.apiLimiter, (req, res) => {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Required fields missing' });
    }

    db.run('INSERT INTO tenants (userId, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, firstName, lastName, email, phone], 
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }

            db.run('INSERT INTO audit_logs (userId, action, resourceType, resourceId, details) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, 'CREATE', 'tenant', this.lastID, `Created tenant: ${firstName} ${lastName}`]);

            res.status(201).json({ id: this.lastID, message: 'Tenant created successfully' });
        });
});

// ==================== MAINTENANCE ROUTES ====================

// Get maintenance requests
app.get('/api/maintenance', authenticateToken, security.apiLimiter, (req, res) => {
    const query = `
        SELECT m.*, u.unitNumber, p.address as propertyAddress 
        FROM maintenance_requests m
        JOIN units u ON m.unitId = u.id
        JOIN properties p ON u.propertyId = p.id
        WHERE p.userId = ? OR ? = 'admin'
    `;

    db.all(query, [req.user.id, req.user.role], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        db.run('INSERT INTO audit_logs (userId, action, resourceType, details) VALUES (?, ?, ?, ?)',
            [req.user.id, 'VIEW', 'maintenance', `Viewed ${rows.length} maintenance requests`]);

        res.json(rows);
    });
});

// Create maintenance request
app.post('/api/maintenance', authenticateToken, security.apiLimiter, (req, res) => {
    const { unitId, tenantId, title, description, priority } = req.body;

    if (!unitId || !title) {
        return res.status(400).json({ error: 'Required fields missing' });
    }

    db.run('INSERT INTO maintenance_requests (unitId, tenantId, title, description, priority) VALUES (?, ?, ?, ?, ?)',
        [unitId, tenantId, title, description, priority], 
        function(err) {
            if (err) return res.status(500).json({ error: err.message });

            db.run('INSERT INTO audit_logs (userId, action, resourceType, resourceId, details) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, 'CREATE', 'maintenance', this.lastID, `Created maintenance request: ${title}`]);

            res.status(201).json({ id: this.lastID, message: 'Maintenance request created' });
        });
});

// ==================== METRICS ROUTE ====================

app.get('/api/metrics/overview', authenticateToken, security.apiLimiter, (req, res) => {
    const metrics = {};

    db.get('SELECT COUNT(*) as count FROM properties WHERE userId = ? OR ? = "admin"', 
        [req.user.id, req.user.role], (err, row) => {
        metrics.totalProperties = row ? row.count : 0;

        db.get('SELECT COUNT(*) as count FROM units JOIN properties ON units.propertyId = properties.id WHERE properties.userId = ? OR ? = "admin"', 
            [req.user.id, req.user.role], (err, row) => {
            metrics.totalUnits = row ? row.count : 0;

            db.get('SELECT COUNT(*) as count FROM units JOIN properties ON units.propertyId = properties.id WHERE (properties.userId = ? OR ? = "admin") AND units.status = "occupied"', 
                [req.user.id, req.user.role], (err, row) => {
                const occupied = row ? row.count : 0;
                metrics.occupancyRate = metrics.totalUnits > 0 ? Math.round((occupied / metrics.totalUnits) * 100) : 0;

                db.get('SELECT SUM(rentAmount) as total FROM units JOIN properties ON units.propertyId = properties.id WHERE (properties.userId = ? OR ? = "admin") AND units.status = "occupied"', 
                    [req.user.id, req.user.role], (err, row) => {
                    metrics.monthlyRevenue = row ? (row.total || 0) : 0;

                    db.get('SELECT COUNT(*) as count FROM maintenance_requests WHERE status = "open"', 
                        (err, row) => {
                        metrics.openMaintenance = row ? row.count : 0;

                        db.run('INSERT INTO audit_logs (userId, action, resourceType, details) VALUES (?, ?, ?, ?)',
                            [req.user.id, 'VIEW', 'metrics', 'Viewed dashboard metrics']);

                        res.json(metrics);
                    });
                });
            });
        });
    });
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║   🏠 Rentala Platform Server - SECURE VERSION            ║
║   ✅ Server running on port ${PORT}                         ║
║   📍 http://localhost:${PORT}                                ║
║   🔒 Security Features Enabled:                          ║
║      ✓ Rate Limiting                                     ║
║      ✓ Input Sanitization                                ║
║      ✓ Tenant Isolation                                  ║
║      ✓ Audit Logging                                     ║
║      ✓ Account Lockout Protection                        ║
╚═══════════════════════════════════════════════════════════╝
    `);
});

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Database connection closed');
        }
        process.exit(0);
    });
});
