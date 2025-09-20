declare const crypto: any;
declare const bcrypt: any;
/**
 * Hash Utility Functions
 * Provides various hashing and cryptographic functions for the IP Registry
 */
/**
 * Generate a random salt for hashing
 * @param length - Length of the salt (default: 32)
 * @returns Random salt string
 */
declare const generateSalt: (length?: number) => string;
/**
 * Generate a random token for verification, reset, etc.
 * @param length - Length of the token (default: 32)
 * @returns Random token string
 */
declare const generateToken: (length?: number) => string;
/**
 * Generate a secure random string
 * @param length - Length of the string (default: 16)
 * @param charset - Character set to use (default: alphanumeric)
 * @returns Random string
 */
declare const generateRandomString: (length?: number, charset?: string) => string;
/**
 * Hash a string using SHA-256
 * @param input - String to hash
 * @returns SHA-256 hash
 */
declare const sha256: (input: string) => string;
/**
 * Hash a string using SHA-512
 * @param input - String to hash
 * @returns SHA-512 hash
 */
declare const sha512: (input: string) => string;
/**
 * Hash a string using MD5 (not recommended for security)
 * @param input - String to hash
 * @returns MD5 hash
 */
declare const md5: (input: string) => string;
/**
 * Create HMAC hash
 * @param data - Data to hash
 * @param secret - Secret key
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns HMAC hash
 */
declare const hmac: (data: string, secret: string, algorithm?: string) => string;
/**
 * Hash password using bcrypt
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Promise<string> - Hashed password
 */
declare const hashPassword: (password: string, saltRounds?: number) => Promise<string>;
/**
 * Compare password with hash using bcrypt
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns Promise<boolean> - True if password matches
 */
declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Generate a hash for file content (for integrity checking)
 * @param content - File content (string or Buffer)
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns File hash
 */
declare const hashFile: (content: string | Buffer, algorithm?: string) => string;
/**
 * Generate a hash for IP asset metadata
 * @param metadata - IP asset metadata object
 * @returns Metadata hash
 */
declare const hashMetadata: (metadata: any) => string;
/**
 * Generate a unique hash for blockchain transactions
 * @param data - Transaction data
 * @param nonce - Nonce for uniqueness
 * @returns Transaction hash
 */
declare const generateTransactionHash: (data: any, nonce?: string) => string;
/**
 * Generate a hash for API keys or secrets
 * @param key - API key or secret
 * @param salt - Optional salt
 * @returns Hashed key
 */
declare const hashApiKey: (key: string, salt?: string) => string;
/**
 * Generate a hash for user sessions
 * @param userId - User ID
 * @param sessionData - Session data
 * @returns Session hash
 */
declare const generateSessionHash: (userId: number, sessionData: any) => string;
/**
 * Generate a hash for IP asset content (for deduplication)
 * @param content - Asset content
 * @param metadata - Asset metadata
 * @returns Content hash
 */
declare const generateContentHash: (content: string | Buffer, metadata?: any) => string;
/**
 * Generate a hash for wallet addresses (for privacy)
 * @param walletAddress - Wallet address
 * @param salt - Optional salt
 * @returns Hashed wallet address
 */
declare const hashWalletAddress: (walletAddress: string, salt?: string) => string;
/**
 * Generate a hash for email addresses (for privacy)
 * @param email - Email address
 * @param salt - Optional salt
 * @returns Hashed email
 */
declare const hashEmail: (email: string, salt?: string) => string;
/**
 * Generate a hash for IP addresses (for rate limiting)
 * @param ipAddress - IP address
 * @param salt - Optional salt
 * @returns Hashed IP address
 */
declare const hashIPAddress: (ipAddress: string, salt?: string) => string;
/**
 * Generate a hash for anti-piracy detection
 * @param content - Content to analyze
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns Content fingerprint
 */
declare const generateContentFingerprint: (content: string, algorithm?: string) => string;
/**
 * Generate a hash for legal compliance tracking
 * @param jurisdiction - Legal jurisdiction
 * @param content - Content to track
 * @param timestamp - Timestamp
 * @returns Compliance hash
 */
declare const generateComplianceHash: (jurisdiction: string, content: string, timestamp?: number) => string;
/**
 * Generate a hash for audit trails
 * @param action - Action performed
 * @param userId - User ID
 * @param resource - Resource affected
 * @param timestamp - Timestamp
 * @returns Audit hash
 */
declare const generateAuditHash: (action: string, userId: number, resource: string, timestamp?: number) => string;
/**
 * Verify hash integrity
 * @param data - Original data
 * @param hash - Hash to verify against
 * @param algorithm - Hash algorithm (default: sha256)
 * @returns True if hash is valid
 */
declare const verifyHash: (data: string, hash: string, algorithm?: string) => boolean;
/**
 * Generate a hash for database records (for change detection)
 * @param record - Database record
 * @param fields - Fields to include in hash
 * @returns Record hash
 */
declare const generateRecordHash: (record: any, fields?: string[]) => string;
/**
 * Generate a hash for cache keys
 * @param key - Cache key
 * @param namespace - Optional namespace
 * @returns Cache hash
 */
declare const generateCacheHash: (key: string, namespace?: string) => string;
/**
 * Generate a hash for rate limiting keys
 * @param identifier - User or IP identifier
 * @param endpoint - API endpoint
 * @param window - Time window
 * @returns Rate limit hash
 */
declare const generateRateLimitHash: (identifier: string, endpoint: string, window: number) => string;
//# sourceMappingURL=hash.d.ts.map