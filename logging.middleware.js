"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../config');
/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    // Log request
    console.log(`📥 ${timestamp} ${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        userId: req.user?.id || 'anonymous',
        body: req.method !== 'GET' ? req.body : undefined
    });
    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function (chunk, encoding) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        // Log response
        console.log(`📤 ${timestamp} ${req.method} ${req.path} - ${statusCode} (${duration}ms)`, {
            ip: req.ip,
            userId: req.user?.id || 'anonymous',
            statusCode,
            duration: `${duration}ms`
        });
        // Log errors
        if (statusCode >= 400) {
            console.error(`❌ Error ${statusCode} for ${req.method} ${req.path}`, {
                ip: req.ip,
                userId: req.user?.id || 'anonymous',
                error: chunk?.toString(),
                body: req.body,
                query: req.query
            });
        }
        return originalEnd.call(this, chunk, encoding);
    };
    next();
};
/**
 * Error logging middleware
 */
const errorLogger = (error, req, res, next) => {
    const timestamp = new Date().toISOString();
    console.error(`💥 ${timestamp} Error in ${req.method} ${req.path}:`, {
        error: error.message,
        stack: error.stack,
        ip: req.ip,
        userId: req.user?.id || 'anonymous',
        body: req.body,
        query: req.query,
        userAgent: req.headers['user-agent']
    });
    next(error);
};
/**
 * Performance monitoring middleware
 */
const performanceMonitor = (req, res, next) => {
    const startTime = process.hrtime.bigint();
    res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        // Log slow requests
        if (duration > 1000) { // More than 1 second
            console.warn(`🐌 Slow request detected: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`, {
                ip: req.ip,
                userId: req.user?.id || 'anonymous',
                duration: `${duration.toFixed(2)}ms`
            });
        }
        // Log performance metrics
        if (config.logLevel === 'debug') {
            console.log(`📊 Performance: ${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
        }
    });
    next();
};
/**
 * Audit trail middleware for IP asset operations
 */
const auditTrail = (action) => {
    return (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            // Log audit trail for successful operations
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log(`📋 Audit: ${action}`, {
                    timestamp: new Date().toISOString(),
                    userId: req.user?.id || 'anonymous',
                    ip: req.ip,
                    action,
                    resource: req.path,
                    method: req.method,
                    statusCode: res.statusCode,
                    userAgent: req.headers['user-agent']
                });
            }
            return originalSend.call(this, data);
        };
        next();
    };
};
/**
 * Database query logging middleware
 */
const queryLogger = (req, res, next) => {
    if (config.logLevel === 'debug') {
        // This would typically be set up in your database configuration
        // For Sequelize, you can enable logging in the database config
        console.log(`🔍 Database query for ${req.method} ${req.path}`);
    }
    next();
};
module.exports = {
    requestLogger,
    errorLogger,
    performanceMonitor,
    auditTrail,
    queryLogger
};
//# sourceMappingURL=logging.middleware.js.map