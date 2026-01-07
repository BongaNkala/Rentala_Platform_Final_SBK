const crypto = require('crypto');

/**
 * Encryption Module
 * Provides AES-256 encryption/decryption for sensitive data
 */

// Get encryption key from environment or generate one
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
    crypto.scryptSync(process.env.JWT_SECRET || 'rentala_secret_key_2026', 'salt', 32);

/**
 * Encrypt sensitive data using AES-256-CBC
 * @param {string} data - Data to encrypt
 * @returns {string} - Encrypted data in format: iv:encryptedData
 */
function encryptField(data) {
    if (!data) return null;
    
    try {
        // Generate random initialization vector
        const iv = crypto.randomBytes(16);
        
        // Create cipher
        const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        
        // Encrypt data
        let encrypted = cipher.update(data.toString(), 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Return iv:encrypted format
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('❌ Encryption error:', error.message);
        throw new Error('Failed to encrypt data');
    }
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data in format: iv:encryptedData
 * @returns {string} - Decrypted data
 */
function decryptField(encryptedData) {
    if (!encryptedData) return null;
    
    try {
        // Split iv and encrypted data
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }
        
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        
        // Create decipher
        const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
        
        // Decrypt data
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('❌ Decryption error:', error.message);
        throw new Error('Failed to decrypt data');
    }
}

/**
 * Hash sensitive data (one-way)
 * @param {string} data - Data to hash
 * @returns {string} - SHA-256 hash
 */
function hashField(data) {
    if (!data) return null;
    
    return crypto
        .createHash('sha256')
        .update(data)
        .digest('hex');
}

/**
 * Verify hashed data
 * @param {string} data - Original data
 * @param {string} hash - Hash to verify against
 * @returns {boolean} - True if hash matches
 */
function verifyHash(data, hash) {
    return hashField(data) === hash;
}

/**
 * Generate secure random token
 * @param {number} length - Token length (default: 32)
 * @returns {string} - Random token
 */
function generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Middleware to encrypt specific fields in request body
 * @param {string[]} fields - Fields to encrypt
 */
function encryptRequestFields(fields = []) {
    return (req, res, next) => {
        fields.forEach(field => {
            if (req.body[field]) {
                req.body[field] = encryptField(req.body[field]);
            }
        });
        next();
    };
}

/**
 * Middleware to decrypt specific fields in response
 * @param {string[]} fields - Fields to decrypt
 */
function decryptResponseFields(fields = []) {
    return (req, res, next) => {
        const originalJson = res.json;
        
        res.json = function(data) {
            if (Array.isArray(data)) {
                data.forEach(item => {
                    fields.forEach(field => {
                        if (item[field]) {
                            item[field] = decryptField(item[field]);
                        }
                    });
                });
            } else if (data && typeof data === 'object') {
                fields.forEach(field => {
                    if (data[field]) {
                        data[field] = decryptField(data[field]);
                    }
                });
            }
            
            return originalJson.call(this, data);
        };
        
        next();
    };
}

/**
 * Mask sensitive data for logging/display
 * @param {string} data - Data to mask
 * @param {number} visibleChars - Number of visible characters (default: 4)
 * @returns {string} - Masked data
 */
function maskSensitiveData(data, visibleChars = 4) {
    if (!data || data.length <= visibleChars) return '****';
    
    const visible = data.substring(0, visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return visible + masked;
}

/**
 * Validate encryption key strength
 * @returns {object} - Validation result
 */
function validateEncryptionKey() {
    const keyLength = ENCRYPTION_KEY.length;
    const isValid = keyLength === 32; // AES-256 requires 32 bytes
    
    return {
        isValid,
        keyLength,
        algorithm: 'AES-256-CBC',
        message: isValid ? 'Encryption key is valid' : 'Encryption key is invalid'
    };
}

/**
 * Database encryption utilities
 */
const databaseEncryption = {
    /**
     * Encrypt entire database record
     */
    encryptRecord: (record, fieldsToEncrypt = []) => {
        const encrypted = { ...record };
        fieldsToEncrypt.forEach(field => {
            if (encrypted[field]) {
                encrypted[field] = encryptField(encrypted[field]);
            }
        });
        return encrypted;
    },
    
    /**
     * Decrypt entire database record
     */
    decryptRecord: (record, fieldsToDecrypt = []) => {
        const decrypted = { ...record };
        fieldsToDecrypt.forEach(field => {
            if (decrypted[field]) {
                decrypted[field] = decryptField(decrypted[field]);
            }
        });
        return decrypted;
    },
    
    /**
     * Get list of fields that should be encrypted
     */
    getSensitiveFields: () => {
        return [
            'idNumber',
            'passportNumber',
            'bankAccountNumber',
            'creditCardNumber',
            'ssn',
            'medicalInfo',
            'emergencyContact'
        ];
    }
};

module.exports = {
    encryptField,
    decryptField,
    hashField,
    verifyHash,
    generateToken,
    encryptRequestFields,
    decryptResponseFields,
    maskSensitiveData,
    validateEncryptionKey,
    databaseEncryption,
    ENCRYPTION_KEY
};
