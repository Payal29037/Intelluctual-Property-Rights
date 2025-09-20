"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Validation middleware for IP asset creation
 */
const validateIPAsset = (req, res, next) => {
    const { title, ipType, description, ipfsHash } = req.body;
    const errors = [];
    // Title validation
    if (!title || typeof title !== 'string') {
        errors.push('Title is required and must be a string');
    }
    else if (title.length < 3 || title.length > 255) {
        errors.push('Title must be between 3 and 255 characters');
    }
    // IP Type validation
    const validIPTypes = ['copyright', 'patent', 'trademark', 'trade_secret', 'design'];
    if (!ipType || typeof ipType !== 'string') {
        errors.push('IP type is required and must be a string');
    }
    else if (!validIPTypes.includes(ipType.toLowerCase())) {
        errors.push(`IP type must be one of: ${validIPTypes.join(', ')}`);
    }
    // Description validation
    if (!description || typeof description !== 'string') {
        errors.push('Description is required and must be a string');
    }
    else if (description.length < 10 || description.length > 5000) {
        errors.push('Description must be between 10 and 5000 characters');
    }
    // IPFS Hash validation (basic CID format check)
    if (!ipfsHash || typeof ipfsHash !== 'string') {
        errors.push('IPFS hash is required and must be a string');
    }
    else if (!/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(ipfsHash)) {
        errors.push('Invalid IPFS hash format');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors
        });
    }
    next();
};
/**
 * Validation middleware for user registration
 */
const validateRegistration = (req, res, next) => {
    const { username, email, password, walletAddress } = req.body;
    const errors = [];
    // Username validation
    if (!username || typeof username !== 'string') {
        errors.push('Username is required and must be a string');
    }
    else if (username.length < 3 || username.length > 30) {
        errors.push('Username must be between 3 and 30 characters');
    }
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, and underscores');
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string') {
        errors.push('Email is required and must be a string');
    }
    else if (!emailRegex.test(email)) {
        errors.push('Invalid email format');
    }
    // Password validation
    if (!password || typeof password !== 'string') {
        errors.push('Password is required and must be a string');
    }
    else if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }
    // Wallet address validation (basic Ethereum address format)
    if (!walletAddress || typeof walletAddress !== 'string') {
        errors.push('Wallet address is required and must be a string');
    }
    else if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
        errors.push('Invalid wallet address format');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors
        });
    }
    next();
};
/**
 * Validation middleware for login
 */
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];
    if (!email || typeof email !== 'string') {
        errors.push('Email is required and must be a string');
    }
    if (!password || typeof password !== 'string') {
        errors.push('Password is required and must be a string');
    }
    if (errors.length > 0) {
        return res.status(400).json({
            message: 'Validation failed',
            errors
        });
    }
    next();
};
/**
 * Sanitization middleware to prevent XSS attacks
 */
const sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
        return str
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    };
    const sanitizeObject = (obj) => {
        if (typeof obj === 'string') {
            return sanitizeString(obj);
        }
        else if (Array.isArray(obj)) {
            return obj.map(sanitizeObject);
        }
        else if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitizeObject(obj[key]);
            }
            return sanitized;
        }
        return obj;
    };
    req.body = sanitizeObject(req.body);
    req.query = sanitizeObject(req.query);
    req.params = sanitizeObject(req.params);
    next();
};
module.exports = {
    validateIPAsset,
    validateRegistration,
    validateLogin,
    sanitizeInput
};
//# sourceMappingURL=validation.middleware.js.map