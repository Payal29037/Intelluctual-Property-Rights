"use strict";
const crypto = require('crypto');
const bcrypt = require('bcrypt');
/**
 * Hash Utility Functions
 * Provides various hashing and cryptographic functions for the IP Registry
 */
/**
 * Generate a random salt for hashing
 * @param length - Length of the salt (default: 32)
 * @returns Random salt string
 */
const generateSalt = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};
/**
 * Generate a random token for verification, reset, etc.
 * @param length - Length of the token (default: 32)
 * @returns Random token string
 */
const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};
/**
 * Generate a secure random string
 * @param length - Length of the string (default: 16)
 * @param charset - Character set to use (default: alphanumeric)
 * @returns Random string
 */
const generateRandomString = (length = 16, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
};
/**
 * Hash a string using SHA-256
 * @param input - String to hash
 * @returns SHA-256 hash
 */
const sha256 = (input) => {
    return crypto.createHash('sha256').update(input).digest('hex');
};
/**
 * Hash a string using SHA-512
 * @param input - String to hash
 * @returns SHA-512 hash
 */
const sha512 = (input) => {
    return crypto.createHash('sha512').update(input).digest('hex');
};
/**
 * Hash a string using MD5 (not recommended for security)
 * @param input - String to hash
 * @returns MD5 hash
 */
const md5 = (input) => {
    return crypto.createHash('md5').update(input).digest('hex');
};
/**
 * Create HMAC hash
 * @param data - Data to hash
 * @param secret - Secret key
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns HMAC hash
 */
const hmac = (data, secret, algorithm = 'sha256') => {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
};
/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Promise<string> - Hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
    return await bcrypt.hash(password, saltRounds);
};
/**
 * Compare password with hash using bcrypt
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns Promise<boolean> - True if password matches
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};
/**
 * Generate a hash for file content (for integrity checking)
 * @param content - File content (string or Buffer)
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns File hash
 */
const hashFile = (content, algorithm = 'sha256') => {
    return crypto.createHash(algorithm).update(content).digest('hex');
};
/**
 * Generate a hash for IP asset metadata
 * @param metadata - IP asset metadata object
 * @returns Metadata hash
 */
const hashMetadata = (metadata) => {
    const sortedMetadata = JSON.stringify(metadata, Object.keys(metadata).sort());
    return sha256(sortedMetadata);
};
/**
 * Generate a unique hash for blockchain transactions
 * @param data - Transaction data
 * @param nonce - Nonce for uniqueness
 * @returns Transaction hash
 */
const generateTransactionHash = (data, nonce) => {
    const timestamp = Date.now().toString();
    const input = JSON.stringify({ data, nonce, timestamp });
    return sha256(input);
};
/**
 * Generate a hash for API keys or secrets
 * @param key - API key or secret
 * @param salt - Optional salt
 * @returns Hashed key
 */
const hashApiKey = (key, salt) => {
    const input = salt ? `${key}:${salt}` : key;
    return sha256(input);
};
/**
 * Generate a hash for user sessions
 * @param userId - User ID
 * @param sessionData - Session data
 * @returns Session hash
 */
const generateSessionHash = (userId, sessionData) => {
    const input = `${userId}:${JSON.stringify(sessionData)}:${Date.now()}`;
    return sha256(input);
};
/**
 * Generate a hash for IP asset content (for deduplication)
 * @param content - Asset content
 * @param metadata - Asset metadata
 * @returns Content hash
 */
const generateContentHash = (content, metadata) => {
    const contentHash = hashFile(content);
    if (metadata) {
        const metadataHash = hashMetadata(metadata);
        return sha256(`${contentHash}:${metadataHash}`);
    }
    return contentHash;
};
/**
 * Generate a hash for wallet addresses (for privacy)
 * @param walletAddress - Wallet address
 * @param salt - Optional salt
 * @returns Hashed wallet address
 */
const hashWalletAddress = (walletAddress, salt) => {
    const input = salt ? `${walletAddress}:${salt}` : walletAddress;
    return sha256(input);
};
/**
 * Generate a hash for email addresses (for privacy)
 * @param email - Email address
 * @param salt - Optional salt
 * @returns Hashed email
 */
const hashEmail = (email, salt) => {
    const input = salt ? `${email}:${salt}` : email;
    return sha256(input);
};
/**
 * Generate a hash for IP addresses (for rate limiting)
 * @param ipAddress - IP address
 * @param salt - Optional salt
 * @returns Hashed IP address
 */
const hashIPAddress = (ipAddress, salt) => {
    const input = salt ? `${ipAddress}:${salt}` : ipAddress;
    return sha256(input);
};
/**
 * Generate a hash for anti-piracy detection
 * @param content - Content to analyze
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns Content fingerprint
 */
const generateContentFingerprint = (content, algorithm = 'sha256') => {
    // Normalize content for consistent hashing
    const normalizedContent = content
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
    return crypto.createHash(algorithm).update(normalizedContent).digest('hex');
};
/**
 * Generate a hash for legal compliance tracking
 * @param jurisdiction - Legal jurisdiction
 * @param content - Content to track
 * @param timestamp - Timestamp
 * @returns Compliance hash
 */
const generateComplianceHash = (jurisdiction, content, timestamp) => {
    const ts = timestamp || Date.now();
    const input = `${jurisdiction}:${content}:${ts}`;
    return sha256(input);
};
/**
 * Generate a hash for audit trails
 * @param action - Action performed
 * @param userId - User ID
 * @param resource - Resource affected
 * @param timestamp - Timestamp
 * @returns Audit hash
 */
const generateAuditHash = (action, userId, resource, timestamp) => {
    const ts = timestamp || Date.now();
    const input = `${action}:${userId}:${resource}:${ts}`;
    return sha256(input);
};
/**
 * Verify hash integrity
 * @param data - Original data
 * @param hash - Hash to verify against
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns True if hash is valid
 */
const verifyHash = (data, hash, algorithm = 'sha256') => {
    const computedHash = crypto.createHash(algorithm).update(data).digest('hex');
    return computedHash === hash;
};
/**
 * Generate a hash for database records (for change detection)
 * @param record - Database record
 * @param fields - Fields to include in hash
 * @returns Record hash
 */
const generateRecordHash = (record, fields) => {
    let dataToHash = record;
    if (fields && Array.isArray(fields)) {
        dataToHash = {};
        fields.forEach(field => {
            if (record.hasOwnProperty(field)) {
                dataToHash[field] = record[field];
            }
        });
    }
    return hashMetadata(dataToHash);
};
/**
 * Generate a hash for cache keys
 * @param key - Cache key
 * @param namespace - Optional namespace
 * @returns Cache hash
 */
const generateCacheHash = (key, namespace) => {
    const input = namespace ? `${namespace}:${key}` : key;
    return sha256(input);
};
/**
 * Generate a hash for rate limiting keys
 * @param identifier - User or IP identifier
 * @param endpoint - API endpoint
 * @param window - Time window
 * @returns Rate limit hash
 */
const generateRateLimitHash = (identifier, endpoint, window) => {
    const input = `${identifier}:${endpoint}:${window}`;
    return sha256(input);
};
// Export all functions
module.exports = {
    generateSalt,
    generateToken,
    generateRandomString,
    sha256,
    sha512,
    md5,
    hmac,
    hashPassword,
    comparePassword,
    hashFile,
    hashMetadata,
    generateTransactionHash,
    hashApiKey,
    generateSessionHash,
    generateContentHash,
    hashWalletAddress,
    hashEmail,
    hashIPAddress,
    generateContentFingerprint,
    generateComplianceHash,
    generateAuditHash,
    verifyHash,
    generateRecordHash,
    generateCacheHash,
    generateRateLimitHash
};
//# sourceMappingURL=hash.js.map