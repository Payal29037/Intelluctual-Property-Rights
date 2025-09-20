"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { authService } = require('../services/auth.service');
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'No token provided.'
        });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token format.'
        });
    }
    try {
        // Use auth service to verify token and get user data
        const result = await authService.verifyToken(token);
        if (!result.success) {
            return res.status(401).json({
                success: false,
                message: 'Token verification failed.'
            });
        }
        // Set user data in request object
        req.user = result.user;
        next();
    }
    catch (err) {
        console.error('Auth middleware error:', err);
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};
module.exports = authenticate;
//# sourceMappingURL=auth.middleware.js.map