"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../config');
/**
 * Global error handling middleware
 */
const errorHandler = (error, req, res, next) => {
    console.error('💥 Global error handler:', error);
    // Default error response
    let statusCode = 500;
    let message = 'Internal server error';
    let details = undefined;
    // Handle specific error types
    if (error.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        details = error.message;
    }
    else if (error.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    }
    else if (error.name === 'ForbiddenError') {
        statusCode = 403;
        message = 'Forbidden';
    }
    else if (error.name === 'NotFoundError') {
        statusCode = 404;
        message = 'Resource not found';
    }
    else if (error.name === 'ConflictError') {
        statusCode = 409;
        message = 'Resource conflict';
    }
    else if (error.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Database validation failed';
        details = error.message;
    }
    else if (error.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = 'Resource already exists';
        details = 'A record with this information already exists';
    }
    else if (error.name === 'SequelizeForeignKeyConstraintError') {
        statusCode = 400;
        message = 'Invalid reference';
        details = 'Referenced resource does not exist';
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    else if (error.name === 'MulterError') {
        statusCode = 400;
        message = 'File upload error';
        details = error.message;
    }
    // Log error details
    console.error(`❌ Error ${statusCode}: ${message}`, {
        error: error.message,
        stack: config.logLevel === 'debug' ? error.stack : undefined,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id || 'anonymous',
        timestamp: new Date().toISOString()
    });
    // Send error response
    const errorResponse = {
        success: false,
        message,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method
    };
    // Include details in development mode
    if (config.logLevel === 'debug' && details) {
        errorResponse.details = details;
    }
    // Include compliance contact for IP-related errors
    if (req.path.includes('/ip-assets') || req.path.includes('/assets')) {
        errorResponse.complianceContact = config.complianceContact;
    }
    res.status(statusCode).json(errorResponse);
};
/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
};
/**
 * Async error wrapper to catch async errors in route handlers
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
/**
 * Custom error classes for better error handling
 */
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}
module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler,
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError
};
//# sourceMappingURL=errorHandler.middleware.js.map