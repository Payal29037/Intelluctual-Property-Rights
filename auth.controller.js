"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { authService } = require('../services/auth.service');
/**
 * Authentication Controller
 * Handles all authentication-related API endpoints
 */
// Register new user
exports.register = async (req, res) => {
    try {
        const { username, email, password, walletAddress } = req.body;
        if (!username || !email || !password || !walletAddress) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        const result = await authService.register({ username, email, password, walletAddress });
        return res.status(201).json(result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(400).json({ message: 'Registration failed.', error: errorMsg });
    }
};
// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }
        const result = await authService.login({ email, password });
        return res.status(200).json(result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(401).json({ message: 'Login failed.', error: errorMsg });
    }
};
// Refresh token
exports.refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required.' });
        }
        const result = await authService.refreshToken(refreshToken);
        return res.status(200).json(result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(401).json({ message: 'Token refresh failed.', error: errorMsg });
    }
};
// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ message: 'Verification token is required.' });
        }
        const result = await authService.verifyEmail(token);
        return res.status(200).json(result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(400).json({ message: 'Email verification failed.', error: errorMsg });
    }
};
// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized.' });
        const result = await authService.getProfile(userId);
        return res.status(200).json(result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ message: 'Failed to get profile.', error: errorMsg });
    }
};
// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized.' });
        const { username, email, walletAddress } = req.body;
        if (!username && !email && !walletAddress) {
            return res.status(400).json({ message: 'Nothing to update.' });
        }
        const result = await authService.updateProfile(userId, { username, email, walletAddress });
        return res.status(200).json(result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ message: 'Failed to update profile.', error: errorMsg });
    }
};
// Request password reset
exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        const result = await authService.requestPasswordReset(email);
        return res.status(200).json(result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ message: 'Password reset request failed.', error: errorMsg });
    }
};
// Reset password
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required.' });
        }
        const result = await authService.resetPassword(token, newPassword);
        return res.status(200).json(result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ message: 'Password reset failed.', error: errorMsg });
    }
};
// Change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized.' });
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required.' });
        }
        const result = await authService.changePassword(userId, currentPassword, newPassword);
        return res.status(200).json(result);
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        return res.status(500).json({ message: 'Failed to change password.', error: errorMsg });
    }
};
//# sourceMappingURL=auth.controller.js.map