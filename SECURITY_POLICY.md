# Rentala Platform - Security Policy & Compliance Guide

## 1. Overview

This document outlines the security measures, compliance standards, and best practices implemented in the Rentala Platform to protect tenant and property manager data.

## 2. Security Architecture

### 2.1 Authentication & Authorization

#### JWT (JSON Web Tokens)
- **Token Expiration**: 24 hours
- **Algorithm**: HS256 (HMAC with SHA-256)
- **Storage**: HttpOnly cookies (recommended for production)
- **Refresh Tokens**: Implement refresh token rotation for extended sessions

#### Password Security
- **Hashing**: bcryptjs with 10 salt rounds
- **Minimum Length**: 8 characters
- **Complexity**: Recommended (uppercase, lowercase, numbers, special characters)
- **Storage**: Never stored in plain text

#### Account Lockout Protection
- **Failed Attempts**: 5 consecutive failed login attempts
- **Lockout Duration**: 15 minutes
- **Reset**: Automatic after lockout period or admin intervention

### 2.2 Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 requests | 15 minutes |
| `/api/auth/register` | 5 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| Sensitive Operations | 3 requests | 1 hour |

### 2.3 Input Validation & Sanitization

#### XSS Prevention
- All user inputs are sanitized using the `xss` library
- HTML tags are stripped from all inputs
- Special characters are escaped

#### SQL Injection Prevention
- Parameterized queries (prepared statements) used throughout
- NoSQL injection patterns removed from inputs
- Input validation on all endpoints

#### CSRF Protection
- SameSite cookies enabled
- CSRF tokens recommended for state-changing operations

### 2.4 Data Encryption

#### At Rest
- Sensitive fields (ID numbers, financial data) should be encrypted using AES-256
- Database encryption recommended for production

#### In Transit
- HTTPS/TLS 1.2+ required for all communications
- Secure headers enforced:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`

### 2.5 Tenant Isolation

#### Data Access Control
- **Tenants** can only access:
  - Their own lease information
  - Their own payment history
  - Their own maintenance requests
  - Their own unit details

- **Property Managers** can only access:
  - Their own properties
  - Tenants in their properties
  - Leases for their units
  - Maintenance requests for their properties

- **Admins** have full access to all data

#### Validation
Every API endpoint validates that the requesting user has permission to access the requested resource.

```javascript
// Example: Validate property access
const validatePropertyAccess = (db) => {
    return (req, res, next) => {
        db.get(
            'SELECT id FROM properties WHERE id = ? AND userId = ?',
            [propertyId, req.user.id],
            (err, row) => {
                if (!row) return res.status(403).json({ error: 'Access denied' });
                next();
            }
        );
    };
};
```

## 3. Audit Logging

### 3.1 Logged Events

All sensitive operations are logged with:
- **Timestamp**: When the action occurred
- **User ID & Email**: Who performed the action
- **Action Type**: CREATE, READ, UPDATE, DELETE, LOGIN, LOGOUT
- **Resource Type**: Property, Tenant, Lease, Payment, Maintenance
- **Resource ID**: Which specific resource was accessed
- **IP Address**: Source of the request
- **User Agent**: Browser/client information

### 3.2 Audit Log Queries

```sql
-- View all actions by a user
SELECT * FROM audit_logs WHERE userId = ? ORDER BY createdAt DESC;

-- View all access to sensitive resources
SELECT * FROM audit_logs WHERE resourceType IN ('payment', 'tenant') ORDER BY createdAt DESC;

-- View failed login attempts
SELECT * FROM audit_logs WHERE action = 'LOGIN' AND details LIKE '%failed%';
```

## 4. Compliance Standards

### 4.1 GDPR (General Data Protection Regulation)

#### Data Subject Rights
- **Right to Access**: Users can request all their data
- **Right to Erasure**: Users can request deletion (implement with soft deletes)
- **Right to Portability**: Users can export their data
- **Right to Rectification**: Users can correct their data

#### Implementation
```javascript
// Endpoint to retrieve user's personal data
app.get('/api/user/data', authenticateToken, (req, res) => {
    // Return all data associated with this user
});

// Endpoint to request data deletion
app.post('/api/user/delete', authenticateToken, (req, res) => {
    // Soft delete user data (mark as deleted, don't remove)
});
```

#### Data Processing Agreement
- Maintain records of data processing activities
- Document data retention policies
- Implement privacy by design

### 4.2 POPIA (Protection of Personal Information Act - South Africa)

#### Conditions for Processing
- **Lawfulness**: Process data only for legitimate purposes
- **Purpose Limitation**: Use data only for stated purposes
- **Minimization**: Collect only necessary data
- **Accuracy**: Keep data accurate and up-to-date
- **Retention**: Delete data when no longer needed

#### Implementation
- Privacy Policy clearly stating data usage
- Consent mechanisms for data collection
- Regular data audits and cleanup

### 4.3 PCI DSS (Payment Card Industry Data Security Standard)

If handling credit card payments:
- **Never store** full credit card numbers
- Use **tokenization** for payment processing
- Implement **3D Secure** for online payments
- Regular **security assessments**

## 5. Security Best Practices

### 5.1 Development

- [ ] Use environment variables for sensitive configuration
- [ ] Never commit secrets to version control
- [ ] Implement code review process
- [ ] Use HTTPS in development
- [ ] Regular dependency updates
- [ ] Security testing in CI/CD pipeline

### 5.2 Deployment

- [ ] Enable HTTPS/TLS with valid certificates
- [ ] Use strong JWT_SECRET (32+ characters)
- [ ] Configure CORS properly
- [ ] Enable security headers
- [ ] Regular security patches
- [ ] Database backups encrypted
- [ ] Monitor for suspicious activity

### 5.3 Monitoring & Incident Response

#### Alerts
- Multiple failed login attempts
- Unusual API access patterns
- Data access outside normal hours
- Large data exports

#### Incident Response Plan
1. **Detection**: Monitor logs and alerts
2. **Containment**: Isolate affected systems
3. **Investigation**: Analyze audit logs
4. **Remediation**: Fix vulnerabilities
5. **Communication**: Notify affected users if necessary
6. **Documentation**: Record lessons learned

## 6. Data Retention Policy

| Data Type | Retention Period | Notes |
|-----------|-----------------|-------|
| User Accounts | Until deletion requested | Soft delete |
| Login Logs | 90 days | For security audits |
| Audit Logs | 1 year | Compliance requirement |
| Payment Records | 7 years | Tax/legal requirement |
| Tenant Data | Until lease ends + 3 years | Legal hold |
| Maintenance Records | 5 years | Liability protection |

## 7. Security Checklist

### Before Production Deployment

- [ ] Change default JWT_SECRET to strong random value
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS to specific domains
- [ ] Set up database encryption
- [ ] Enable audit logging
- [ ] Configure rate limiting appropriately
- [ ] Set up monitoring and alerting
- [ ] Create incident response plan
- [ ] Conduct security audit
- [ ] Implement backup strategy
- [ ] Document security policies
- [ ] Train staff on security procedures

### Regular Maintenance

- [ ] Weekly: Review audit logs for anomalies
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Security assessment
- [ ] Annually: Penetration testing
- [ ] Annually: Compliance audit

## 8. Vulnerability Reporting

If you discover a security vulnerability:

1. **Do not** publicly disclose the vulnerability
2. **Email** security@rentala.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. We will acknowledge receipt within 48 hours
4. We will provide updates on remediation progress

## 9. Third-Party Security

### Dependencies
- Regular security audits using `npm audit`
- Keep dependencies updated
- Review package.json for known vulnerabilities
- Use `npm ci` for reproducible installs

### External Services
- Verify SSL certificates
- Use API keys with minimal permissions
- Rotate credentials regularly
- Monitor for unauthorized access

## 10. Encryption Implementation

### Current Status
- ✅ In-transit encryption (HTTPS)
- ✅ Password hashing (bcryptjs)
- ⏳ At-rest encryption (recommended for production)

### Future Enhancements

```javascript
// Example: Encrypt sensitive fields
const crypto = require('crypto');

function encryptField(data, encryptionKey) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decryptField(encryptedData, encryptionKey) {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);
    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
```

## 11. Security Headers

All responses include security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
```

## 12. Contact & Support

For security concerns or questions:
- **Email**: security@rentala.com
- **Security Team**: [Contact information]
- **Emergency**: [Emergency contact]

---

**Last Updated**: January 6, 2026
**Version**: 1.0.0
**Status**: Active
