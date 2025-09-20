"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../config');
// Simple in-memory rate limiter (for production, use Redis)
const requestCounts = new Map();
/**
 * Rate limiting middleware to prevent abuse
 * Implements sliding window rate limiting
 */
const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = config.rateLimit) => {
    return (req, res, next) => {
        const clientId = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;
        // Clean up old entries
        for (const [key, value] of requestCounts.entries()) {
            if (value.resetTime < now) {
                requestCounts.delete(key);
            }
        }
        const clientData = requestCounts.get(clientId);
        if (!clientData || clientData.resetTime < now) {
            // New window or expired window
            requestCounts.set(clientId, {
                count: 1,
                resetTime: now + windowMs
            });
            return next();
        }
        if (clientData.count >= maxRequests) {
            return res.status(429).json({
                message: 'Too many requests. Please try again later.',
                retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
            });
        }
        // Increment count
        clientData.count++;
        next();
    };
};
/**
 * Stricter rate limiter for sensitive endpoints (auth, IP creation)
 */
const strictRateLimiter = rateLimiter(5 * 60 * 1000, 10); // 10 requests per 5 minutes
/**
 * General rate limiter for regular endpoints
 */
const generalRateLimiter = rateLimiter(15 * 60 * 1000, config.rateLimit); // Default from config
module.exports = {
    rateLimiter,
    strictRateLimiter,
    generalRateLimiter
};
//# sourceMappingURL=rateLimiter.middleware.js.map