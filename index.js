"use strict";
// Configuration for Digital Creators & Patent Holders Platform
// This config supports anti-piracy, IP protection, scalability, interoperability, and legal compliance.
const dotenv = require("dotenv");
dotenv.config();
const config = {
    // ==================== SERVER CONFIGURATION ====================
    // Server port
    port: (() => {
        const port = Number(process.env.PORT);
        return !isNaN(port) && port > 0 ? port : 5000;
    })(),
    // Node environment
    nodeEnv: process.env.NODE_ENV || "development",
    // ==================== DATABASE CONFIGURATION ====================
    // Database connection string
    databaseUrl: process.env.DATABASE_URL || "",
    // ==================== JWT CONFIGURATION ====================
    // JWT secret for authentication
    jwtSecret: process.env.JWT_SECRET || "your_jwt_secret",
    // ==================== IPFS CONFIGURATION ====================
    // IPFS API endpoint for decentralized storage
    ipfsApiUrl: process.env.IPFS_API_URL || "",
    ipfsGateway: process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs/",
    // ==================== WEB3 CONFIGURATION ====================
    // Web3 provider for blockchain interactions
    web3ProviderUrl: process.env.WEB3_PROVIDER_URL || "",
    privateKey: process.env.PRIVATE_KEY || "",
    gasPrice: process.env.GAS_PRICE || "20000000000",
    gasLimit: process.env.GAS_LIMIT || "500000",
    confirmationsRequired: Number(process.env.CONFIRMATIONS_REQUIRED) || 1,
    // ==================== MARKETPLACE CONTRACT ====================
    // Marketplace contract address
    marketplaceContractAddress: process.env.MARKETPLACE_CONTRACT_ADDRESS || "",
    // ==================== ANTI-PIRACY & IP PROTECTION ====================
    // Anti-piracy and IP protection settings
    enableAntiPiracy: process.env.ENABLE_ANTI_PIRACY === "true",
    supportedChains: (process.env.SUPPORTED_CHAINS || "ethereum,polygon")
        .split(",")
        .map(chain => chain.trim())
        .filter(chain => chain),
    // ==================== LEGAL COMPLIANCE ====================
    // Scalability and interoperability options
    legalJurisdictions: (process.env.LEGAL_JURISDICTIONS || "US,EU,IN").split(",").map(jurisdiction => jurisdiction.trim()),
    // Legal compliance settings
    complianceContact: process.env.COMPLIANCE_CONTACT || "support@yourdomain.com",
    // ==================== LOGGING & MONITORING ====================
    // Advanced monitoring and feature flags
    logLevel: process.env.LOG_LEVEL || "info",
    enableFeatureX: process.env.ENABLE_FEATURE_X === "true",
    debug: process.env.DEBUG === "true",
    // ==================== RATE LIMITING ====================
    // Rate limiting / abuse prevention
    rateLimit: (() => {
        const rateLimit = Number(process.env.RATE_LIMIT);
        return rateLimit > 0 ? rateLimit : 3000;
    })(), // requests per hour
    // ==================== EMAIL CONFIGURATION ====================
    // Email settings
    smtp: {
        host: process.env.SMTP_HOST || "",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        user: process.env.SMTP_USER || "",
        pass: process.env.SMTP_PASS || ""
    },
    emailFrom: process.env.EMAIL_FROM || "noreply@yourdomain.com",
    emailFromName: process.env.EMAIL_FROM_NAME || "IP Registry",
    // ==================== FILE UPLOAD CONFIGURATION ====================
    // File upload settings
    maxFileSize: Number(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/gif,application/pdf,text/plain")
        .split(",")
        .map(type => type.trim()),
    uploadDir: process.env.UPLOAD_DIR || "uploads",
    // ==================== CACHE CONFIGURATION ====================
    // Cache settings
    redisUrl: process.env.REDIS_URL || "",
    redisPassword: process.env.REDIS_PASSWORD || "",
    cacheTtl: Number(process.env.CACHE_TTL) || 3600,
    // ==================== MONITORING & ANALYTICS ====================
    // Monitoring settings
    sentryDsn: process.env.SENTRY_DSN || "",
    gaTrackingId: process.env.GA_TRACKING_ID || "",
    // ==================== DEVELOPMENT CONFIGURATION ====================
    // Development settings
    enableApiDocs: process.env.ENABLE_API_DOCS !== "false",
    corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001")
        .split(",")
        .map(origin => origin.trim()),
    // ==================== PRODUCTION CONFIGURATION ====================
    // Production settings
    sslCertPath: process.env.SSL_CERT_PATH || "",
    sslKeyPath: process.env.SSL_KEY_PATH || "",
    trustProxy: process.env.TRUST_PROXY === "true",
    // ==================== SECURITY CONFIGURATION ====================
    // Security settings
    sessionSecret: process.env.SESSION_SECRET || "your_session_secret",
    encryptionKey: process.env.ENCRYPTION_KEY || "your_encryption_key_32_characters_long",
    // ==================== API CONFIGURATION ====================
    // API settings
    apiVersion: process.env.API_VERSION || "v1",
    apiPrefix: process.env.API_PREFIX || "/api",
    apiRateLimitEnabled: process.env.API_RATE_LIMIT_ENABLED !== "false",
    // ==================== FEATURE FLAGS ====================
    // Feature flags
    enableMarketplace: process.env.ENABLE_MARKETPLACE !== "false",
    enableTrading: process.env.ENABLE_TRADING !== "false",
    enableNft: process.env.ENABLE_NFT !== "false",
    enableAnalytics: process.env.ENABLE_ANALYTICS !== "false",
    // ==================== NOTIFICATION CONFIGURATION ====================
    // Notification settings
    webhookUrl: process.env.WEBHOOK_URL || "",
    notifyOnRegistration: process.env.NOTIFY_ON_REGISTRATION !== "false",
    notifyOnVerification: process.env.NOTIFY_ON_VERIFICATION !== "false",
    notifyOnPurchase: process.env.NOTIFY_ON_PURCHASE !== "false",
    // ==================== TESTING CONFIGURATION ====================
    // Testing settings
    testDatabaseUrl: process.env.TEST_DATABASE_URL || "",
    testJwtSecret: process.env.TEST_JWT_SECRET || "test_jwt_secret",
    // ==================== DEPLOYMENT CONFIGURATION ====================
    // Deployment settings
    deploymentEnv: process.env.DEPLOYMENT_ENV || "development",
    healthCheckTimeout: Number(process.env.HEALTH_CHECK_TIMEOUT) || 5000,
    shutdownTimeout: Number(process.env.SHUTDOWN_TIMEOUT) || 10000
};
module.exports = config;
//# sourceMappingURL=index.js.map