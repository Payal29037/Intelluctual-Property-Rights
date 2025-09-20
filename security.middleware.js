"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helmet = require('helmet');
const config = require('../config');
/**
 * Security headers middleware using Helmet
 */
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", config.ipfsApiUrl, config.web3ProviderUrl],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
});
/**
 * CORS configuration for IP Registry
 */
const corsConfig = (req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://yourdomain.com', // Replace with your actual domain
        ...config.legalJurisdictions.map((jurisdiction) => `https://${jurisdiction.toLowerCase()}.yourdomain.com`)
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
};
/**
 * IP whitelist middleware for admin endpoints
 */
const ipWhitelist = (allowedIPs) => {
    return (req, res, next) => {
        const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        if (!allowedIPs.includes(clientIP)) {
            return res.status(403).json({
                message: 'Access denied. IP not whitelisted.',
                ip: clientIP
            });
        }
        next();
    };
};
/**
 * Request size limiter
 */
const requestSizeLimiter = (maxSize = 10 * 1024 * 1024) => {
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        if (contentLength > maxSize) {
            return res.status(413).json({
                message: 'Request entity too large',
                maxSize: `${maxSize / (1024 * 1024)}MB`
            });
        }
        next();
    };
};
/**
 * Anti-piracy detection middleware
 * Checks for suspicious patterns that might indicate piracy attempts
 */
const antiPiracyDetection = (req, res, next) => {
    const suspiciousPatterns = [
        /crack/i,
        /keygen/i,
        /serial/i,
        /pirate/i,
        /torrent/i,
        /warez/i,
        /hack/i,
        /bypass/i
    ];
    const checkSuspiciousContent = (obj) => {
        if (typeof obj === 'string') {
            return suspiciousPatterns.some(pattern => pattern.test(obj));
        }
        else if (Array.isArray(obj)) {
            return obj.some(checkSuspiciousContent);
        }
        else if (obj && typeof obj === 'object') {
            return Object.values(obj).some(checkSuspiciousContent);
        }
        return false;
    };
    if (checkSuspiciousContent(req.body) || checkSuspiciousContent(req.query)) {
        // Log suspicious activity
        console.warn(`🚨 Suspicious activity detected from IP: ${req.ip}`, {
            body: req.body,
            query: req.query,
            userAgent: req.headers['user-agent'],
            timestamp: new Date().toISOString()
        });
        return res.status(400).json({
            message: 'Request contains potentially suspicious content',
            complianceContact: config.complianceContact
        });
    }
    return next();
};
/**
 * Blockchain verification middleware
 * Verifies that the user owns the wallet address they claim
 */
const verifyWalletOwnership = async (req, res, next) => {
    try {
        const { walletAddress } = req.body;
        const userWalletAddress = req.user?.walletAddress;
        if (walletAddress && walletAddress !== userWalletAddress) {
            return res.status(403).json({
                message: 'Wallet address does not match user account'
            });
        }
        return next();
    }
    catch (error) {
        console.error('Wallet verification error:', error);
        return res.status(500).json({
            message: 'Failed to verify wallet ownership'
        });
    }
};
module.exports = {
    securityHeaders,
    corsConfig,
    ipWhitelist,
    requestSizeLimiter,
    antiPiracyDetection,
    verifyWalletOwnership
};
//# sourceMappingURL=security.middleware.js.map