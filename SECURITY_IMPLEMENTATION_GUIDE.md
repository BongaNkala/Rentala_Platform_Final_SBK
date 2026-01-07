# Rentala Platform - Security Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing and maintaining the security features of the Rentala Platform.

## Phase 1: Authentication & Session Management

### 1.1 Enhanced Login with Account Lockout

**File**: `server-secure.js`

**Features**:
- 5 failed login attempts trigger 15-minute lockout
- Login attempts tracked in database
- Successful login resets attempt counter
- Failed attempts logged for audit trail

**Implementation**:
```javascript
// Login endpoint with account lockout
app.post('/api/auth/login', security.authLimiter, (req, res) => {
    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        return res.status(403).json({ error: 'Account temporarily locked' });
    }
    
    // Increment failed attempts on wrong password
    if (!validPassword) {
        const newAttempts = (user.loginAttempts || 0) + 1;
        if (newAttempts >= 5) {
            lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        db.run('UPDATE users SET loginAttempts = ?, lockedUntil = ? WHERE id = ?',
            [newAttempts, lockUntil, user.id]);
    }
});
```

### 1.2 Rate Limiting Configuration

**File**: `middleware/security.js`

**Endpoints Protected**:
- `/api/auth/login` - 5 requests per 15 minutes
- `/api/auth/register` - 5 requests per 15 minutes
- All `/api/*` - 100 requests per 15 minutes
- Sensitive operations - 3 requests per hour

**Customization**:
```javascript
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // Time window
    max: 5,                     // Max requests
    message: 'Too many attempts', // Error message
    skip: (req) => {            // Skip certain users
        return req.body.email === 'demo@rentala.com';
    }
});
```

## Phase 2: Input Validation & Sanitization

### 2.1 XSS Prevention

**Implementation**:
```javascript
// Sanitize all inputs
const sanitizeInput = (req, res, next) => {
    const sanitizeObject = (obj) => {
        for (let key in obj) {
            if (typeof obj[key] === 'string') {
                // Remove XSS attempts
                obj[key] = xss(obj[key], {
                    whiteList: {},  // No HTML allowed
                    stripIgnoredTag: true
                });
            }
        }
    };
    
    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);
    next();
};
```

### 2.2 SQL Injection Prevention

**Best Practice**: Always use parameterized queries

```javascript
// ✅ SAFE - Parameterized query
db.get('SELECT * FROM users WHERE email = ?', [email], callback);

// ❌ UNSAFE - String concatenation
db.get(`SELECT * FROM users WHERE email = '${email}'`, callback);
```

### 2.3 Frontend Sanitization

Add to `login.html` and `dashboard.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/dompurify@3.0.6/dist/purify.min.js"></script>

<script>
// Sanitize user input before sending to API
function sanitizeInput(input) {
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

// Use in forms
document.getElementById('emailInput').addEventListener('change', (e) => {
    e.target.value = sanitizeInput(e.target.value);
});
</script>
```

## Phase 3: Tenant Isolation & Access Control

### 3.1 API-Level Tenant Isolation

**Middleware**: `middleware/security.js`

```javascript
// Validate tenant access
const validateTenantAccess = (db) => {
    return (req, res, next) => {
        const { tenantId } = req.params;
        const userId = req.user.id;
        
        // Admins bypass checks
        if (req.user.role === 'admin') return next();
        
        // Verify ownership
        db.get(
            'SELECT id FROM tenants WHERE id = ? AND userId = ?',
            [tenantId, userId],
            (err, row) => {
                if (!row) return res.status(403).json({ error: 'Access denied' });
                next();
            }
        );
    };
};
```

### 3.2 Property Manager Isolation

```javascript
// Validate property access
const validatePropertyAccess = (db) => {
    return (req, res, next) => {
        const { propertyId } = req.params;
        const userId = req.user.id;
        
        // Admins bypass checks
        if (req.user.role === 'admin') return next();
        
        // Verify ownership
        db.get(
            'SELECT id FROM properties WHERE id = ? AND userId = ?',
            [propertyId, userId],
            (err, row) => {
                if (!row) return res.status(403).json({ error: 'Access denied' });
                next();
            }
        );
    };
};
```

### 3.3 Using Isolation Middleware in Routes

```javascript
// Delete property - requires ownership validation
app.delete('/api/properties/:id', 
    authenticateToken, 
    security.strictLimiter, 
    security.validatePropertyAccess(db), 
    (req, res) => {
        // Only property owner can delete
        db.run('DELETE FROM properties WHERE id = ?', [req.params.id], ...);
    }
);
```

## Phase 4: Audit Logging

### 4.1 Logging Configuration

**File**: `middleware/security.js`

```javascript
const auditLog = (action, resourceType) => {
    return (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function(data) {
            const logEntry = {
                timestamp: new Date().toISOString(),
                userId: req.user?.id,
                userEmail: req.user?.email,
                action: action,
                resourceType: resourceType,
                method: req.method,
                path: req.path,
                statusCode: res.statusCode,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            };
            
            // Log to database
            console.log('📋 AUDIT LOG:', JSON.stringify(logEntry));
            
            res.send = originalSend;
            return res.send(data);
        };
        
        next();
    };
};
```

### 4.2 Querying Audit Logs

```sql
-- View all actions by a user
SELECT * FROM audit_logs 
WHERE userId = 1 
ORDER BY createdAt DESC;

-- View all sensitive data access
SELECT * FROM audit_logs 
WHERE resourceType IN ('payment', 'tenant', 'property') 
ORDER BY createdAt DESC;

-- View failed login attempts
SELECT * FROM audit_logs 
WHERE action = 'LOGIN' AND details LIKE '%failed%' 
ORDER BY createdAt DESC;

-- View data access in specific time period
SELECT * FROM audit_logs 
WHERE createdAt BETWEEN '2026-01-01' AND '2026-01-31' 
ORDER BY createdAt DESC;
```

## Phase 5: HTTPS/TLS Configuration

### 5.1 Production HTTPS Setup

**Using Let's Encrypt with Node.js**:

```javascript
const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();

const options = {
    key: fs.readFileSync('/path/to/private-key.pem'),
    cert: fs.readFileSync('/path/to/certificate.pem')
};

https.createServer(options, app).listen(3002, () => {
    console.log('✅ HTTPS Server running on port 3002');
});

// Redirect HTTP to HTTPS
const httpApp = express();
httpApp.use((req, res) => {
    res.redirect(`https://${req.headers.host}${req.url}`);
});
httpApp.listen(3000);
```

### 5.2 Security Headers

```javascript
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
        },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    frameguard: { action: 'deny' },
    noSniff: true,
    xssFilter: true,
}));
```

## Phase 6: Database Security

### 6.1 Database Encryption (SQLite)

```bash
# Install SQLCipher (encrypted SQLite)
npm install sql.js

# Or use SQLCipher directly
npm install better-sqlite3
```

```javascript
const Database = require('better-sqlite3');

// Open encrypted database
const db = new Database('rentala.db', {
    readonly: false,
    fileMustExist: false,
    timeout: 5000,
    verbose: console.log
});

// Set encryption key
db.pragma('key = "your-encryption-key"');
```

### 6.2 Field-Level Encryption

```javascript
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
    crypto.scryptSync('password', 'salt', 32);

function encryptField(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decryptField(encryptedData) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Usage in API
app.post('/api/tenants', (req, res) => {
    const encryptedIdNumber = encryptField(req.body.idNumber);
    db.run('INSERT INTO tenants (idNumber) VALUES (?)', [encryptedIdNumber]);
});
```

## Phase 7: Deployment Checklist

### Pre-Production

- [ ] Change `JWT_SECRET` to strong random value (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/TLS with valid certificate
- [ ] Configure `ALLOWED_ORIGINS` for CORS
- [ ] Set up database backups
- [ ] Configure rate limiting thresholds
- [ ] Enable audit logging
- [ ] Set up monitoring and alerting
- [ ] Review and customize security headers
- [ ] Test all authentication flows
- [ ] Test tenant isolation (verify users can't access others' data)
- [ ] Conduct security audit
- [ ] Document incident response procedures

### Post-Deployment

- [ ] Monitor audit logs daily
- [ ] Review failed login attempts
- [ ] Check for unusual API access patterns
- [ ] Update dependencies monthly
- [ ] Conduct quarterly security assessments
- [ ] Perform annual penetration testing
- [ ] Review and update security policies

## Phase 8: Monitoring & Alerting

### 8.1 Key Metrics to Monitor

```javascript
// Monitor failed login attempts
db.all(`
    SELECT userId, COUNT(*) as attempts 
    FROM audit_logs 
    WHERE action = 'LOGIN' AND details LIKE '%failed%'
    AND createdAt > datetime('now', '-1 hour')
    GROUP BY userId
    HAVING attempts > 3
`);

// Monitor unusual API access
db.all(`
    SELECT userId, COUNT(*) as requests 
    FROM audit_logs 
    WHERE createdAt > datetime('now', '-15 minutes')
    GROUP BY userId
    HAVING requests > 100
`);

// Monitor data access patterns
db.all(`
    SELECT userId, resourceType, COUNT(*) as accesses 
    FROM audit_logs 
    WHERE resourceType IN ('payment', 'tenant')
    AND createdAt > datetime('now', '-1 day')
    GROUP BY userId, resourceType
`);
```

### 8.2 Alert Configuration

```javascript
// Alert on suspicious activity
const checkSuspiciousActivity = () => {
    // Check for brute force attempts
    // Check for unusual access patterns
    // Check for data export attempts
    // Send alerts to security team
};

// Run checks every 5 minutes
setInterval(checkSuspiciousActivity, 5 * 60 * 1000);
```

## Phase 9: Compliance Reporting

### 9.1 GDPR Compliance Report

```javascript
// Generate GDPR compliance report
app.get('/api/admin/reports/gdpr', authenticateToken, (req, res) => {
    const report = {
        generatedAt: new Date().toISOString(),
        dataProcessingActivities: [],
        dataRetentionPolicies: [],
        userRights: [],
        incidentLog: [],
        thirdPartyProcessors: []
    };
    
    // Populate report from database
    res.json(report);
});
```

### 9.2 POPIA Compliance Report

```javascript
// Generate POPIA compliance report
app.get('/api/admin/reports/popia', authenticateToken, (req, res) => {
    const report = {
        generatedAt: new Date().toISOString(),
        dataProcessingRecords: [],
        consentRecords: [],
        dataMinimization: [],
        retentionCompliance: [],
        subjectRights: []
    };
    
    // Populate report from database
    res.json(report);
});
```

## Phase 10: Incident Response

### 10.1 Incident Response Plan

1. **Detection**: Monitor logs and alerts
2. **Containment**: Isolate affected systems
3. **Investigation**: Analyze audit logs
4. **Remediation**: Fix vulnerabilities
5. **Communication**: Notify affected users
6. **Documentation**: Record lessons learned

### 10.2 Incident Logging

```javascript
// Log security incidents
const logIncident = (incidentType, severity, description) => {
    db.run(`
        INSERT INTO security_incidents 
        (type, severity, description, reportedAt, status)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'open')
    `, [incidentType, severity, description]);
};

// Example usage
logIncident('BRUTE_FORCE', 'HIGH', 'Multiple failed login attempts from IP 192.168.1.1');
```

## Maintenance Schedule

| Task | Frequency | Owner |
|------|-----------|-------|
| Review audit logs | Daily | Security Team |
| Update dependencies | Weekly | DevOps |
| Security assessment | Monthly | Security Team |
| Penetration testing | Quarterly | External Auditor |
| Compliance audit | Annually | Compliance Officer |
| Security training | Annually | HR/Security |

## Support & Escalation

**Security Issues**: security@rentala.com  
**Privacy Concerns**: privacy@rentala.com  
**Emergency**: [Emergency Contact Number]

---

**Version**: 1.0.0  
**Last Updated**: January 6, 2026  
**Next Review**: April 6, 2026
