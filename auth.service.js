"use strict";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../db/models/user.model');
const config = require('../config');
/**
 * Authentication Service
 * Handles user authentication, registration, password management, and security
 */
class AuthService {
    constructor() {
        this.saltRounds = 12;
        this.jwtExpiry = '24h';
        this.refreshTokenExpiry = '7d';
    }
    /**
     * Register a new user
     * @param userData - User registration data
     * @returns Registration result
     */
    async register(userData) {
        try {
            console.log('👤 Registering new user...', { username: userData.username, email: userData.email });
            // Check if user already exists
            const existingUser = await User.findOne({
                where: {
                    [require('sequelize').Op.or]: [
                        { email: userData.email },
                        { username: userData.username }
                    ]
                }
            });
            if (existingUser) {
                throw new Error('User with this email or username already exists');
            }
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, this.saltRounds);
            // Generate verification token
            const verificationToken = this.generateVerificationToken();
            // Create user
            const user = await User.create({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                walletAddress: userData.walletAddress,
                verificationToken,
                isVerified: false
            });
            // Generate JWT tokens
            const tokens = this.generateTokens(user);
            console.log(`✅ User registered successfully: ${user.username}`);
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    walletAddress: user.walletAddress,
                    isVerified: user.isVerified
                },
                tokens,
                verificationToken // Send for email verification
            };
        }
        catch (error) {
            console.error('❌ Error registering user:', error);
            throw new Error(`Registration failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Authenticate user login
     * @param credentials - Login credentials
     * @returns Authentication result
     */
    async login(credentials) {
        try {
            console.log('🔐 Authenticating user...', { email: credentials.email });
            // Find user by email
            const user = await User.findOne({
                where: { email: credentials.email }
            });
            if (!user) {
                throw new Error('Invalid credentials');
            }
            // Check if account is locked
            if (user.lockUntil && user.lockUntil > new Date()) {
                const lockTimeRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 1000 / 60);
                throw new Error(`Account is locked. Try again in ${lockTimeRemaining} minutes`);
            }
            // Verify password
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) {
                await this.handleFailedLogin(user);
                throw new Error('Invalid credentials');
            }
            // Reset failed login attempts on successful login
            await user.update({
                failedLoginAttempts: 0,
                lockUntil: null
            });
            // Generate JWT tokens
            const tokens = this.generateTokens(user);
            console.log(`✅ User authenticated successfully: ${user.username}`);
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    walletAddress: user.walletAddress,
                    isVerified: user.isVerified
                },
                tokens
            };
        }
        catch (error) {
            console.error('❌ Error authenticating user:', error);
            throw new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Refresh JWT token
     * @param refreshToken - Refresh token
     * @returns New tokens
     */
    async refreshToken(refreshToken) {
        try {
            console.log('🔄 Refreshing token...');
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, config.jwtSecret);
            // Find user
            const user = await User.findByPk(decoded.id);
            if (!user) {
                throw new Error('User not found');
            }
            // Generate new tokens
            const tokens = this.generateTokens(user);
            console.log(`✅ Token refreshed successfully for user: ${user.username}`);
            return {
                success: true,
                tokens
            };
        }
        catch (error) {
            console.error('❌ Error refreshing token:', error);
            throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Verify email address
     * @param token - Verification token
     * @returns Verification result
     */
    async verifyEmail(token) {
        try {
            console.log('📧 Verifying email...');
            const user = await User.findOne({
                where: { verificationToken: token }
            });
            if (!user) {
                throw new Error('Invalid verification token');
            }
            if (user.isVerified) {
                return {
                    success: true,
                    message: 'Email already verified'
                };
            }
            // Mark user as verified
            await user.update({
                isVerified: true,
                verificationToken: null
            });
            console.log(`✅ Email verified successfully for user: ${user.username}`);
            return {
                success: true,
                message: 'Email verified successfully'
            };
        }
        catch (error) {
            console.error('❌ Error verifying email:', error);
            throw new Error(`Email verification failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Request password reset
     * @param email - User email
     * @returns Password reset result
     */
    async requestPasswordReset(email) {
        try {
            console.log('🔑 Requesting password reset...', { email });
            const user = await User.findOne({
                where: { email }
            });
            if (!user) {
                // Don't reveal if user exists or not
                return {
                    success: true,
                    message: 'If an account with this email exists, a password reset link has been sent'
                };
            }
            // Generate reset token
            const resetToken = this.generateResetToken();
            const resetExpires = new Date(Date.now() + 3600000); // 1 hour
            // Update user with reset token
            await user.update({
                resetPasswordToken: resetToken,
                resetPasswordExpires: resetExpires
            });
            console.log(`✅ Password reset token generated for user: ${user.username}`);
            return {
                success: true,
                message: 'If an account with this email exists, a password reset link has been sent',
                resetToken // In production, send via email
            };
        }
        catch (error) {
            console.error('❌ Error requesting password reset:', error);
            throw new Error(`Password reset request failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Reset password
     * @param token - Reset token
     * @param newPassword - New password
     * @returns Password reset result
     */
    async resetPassword(token, newPassword) {
        try {
            console.log('🔑 Resetting password...');
            const user = await User.findOne({
                where: {
                    resetPasswordToken: token,
                    resetPasswordExpires: {
                        [require('sequelize').Op.gt]: new Date()
                    }
                }
            });
            if (!user) {
                throw new Error('Invalid or expired reset token');
            }
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
            // Update user password and clear reset token
            await user.update({
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
                failedLoginAttempts: 0,
                lockUntil: null
            });
            console.log(`✅ Password reset successfully for user: ${user.username}`);
            return {
                success: true,
                message: 'Password reset successfully'
            };
        }
        catch (error) {
            console.error('❌ Error resetting password:', error);
            throw new Error(`Password reset failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get user profile
     * @param userId - User ID
     * @returns User profile
     */
    async getProfile(userId) {
        try {
            console.log(`👤 Getting profile for user: ${userId}`);
            const user = await User.findByPk(userId, {
                attributes: ['id', 'username', 'email', 'walletAddress', 'isVerified', 'createdAt']
            });
            if (!user) {
                throw new Error('User not found');
            }
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    walletAddress: user.walletAddress,
                    isVerified: user.isVerified,
                    createdAt: user.createdAt
                }
            };
        }
        catch (error) {
            console.error('❌ Error getting profile:', error);
            throw new Error(`Failed to get profile: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Update user profile
     * @param userId - User ID
     * @param updateData - Profile update data
     * @returns Update result
     */
    async updateProfile(userId, updateData) {
        try {
            console.log(`👤 Updating profile for user: ${userId}`);
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Check if username or email already exists
            if (updateData.username || updateData.email) {
                const existingUser = await User.findOne({
                    where: {
                        [require('sequelize').Op.or]: [
                            updateData.username ? { username: updateData.username } : {},
                            updateData.email ? { email: updateData.email } : {}
                        ].filter(condition => Object.keys(condition).length > 0),
                        [require('sequelize').Op.not]: { id: userId }
                    }
                });
                if (existingUser) {
                    throw new Error('Username or email already exists');
                }
            }
            // Update user
            const updatedUser = await user.update(updateData);
            console.log(`✅ Profile updated successfully for user: ${user.username}`);
            return {
                success: true,
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    walletAddress: updatedUser.walletAddress,
                    isVerified: updatedUser.isVerified
                }
            };
        }
        catch (error) {
            console.error('❌ Error updating profile:', error);
            throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Change password
     * @param userId - User ID
     * @param currentPassword - Current password
     * @param newPassword - New password
     * @returns Password change result
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            console.log(`🔑 Changing password for user: ${userId}`);
            const user = await User.findByPk(userId);
            if (!user) {
                throw new Error('User not found');
            }
            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('Current password is incorrect');
            }
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
            // Update password
            await user.update({
                password: hashedPassword,
                failedLoginAttempts: 0,
                lockUntil: null
            });
            console.log(`✅ Password changed successfully for user: ${user.username}`);
            return {
                success: true,
                message: 'Password changed successfully'
            };
        }
        catch (error) {
            console.error('❌ Error changing password:', error);
            throw new Error(`Failed to change password: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Verify JWT token
     * @param token - JWT token
     * @returns Token verification result
     */
    async verifyToken(token) {
        try {
            const decoded = jwt.verify(token, config.jwtSecret);
            const user = await User.findByPk(decoded.id);
            if (!user) {
                throw new Error('User not found');
            }
            return {
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    walletAddress: user.walletAddress,
                    isVerified: user.isVerified
                }
            };
        }
        catch (error) {
            throw new Error(`Token verification failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate JWT tokens
     * @param user - User object
     * @returns JWT tokens
     */
    generateTokens(user) {
        const payload = {
            id: user.id,
            username: user.username,
            email: user.email,
            walletAddress: user.walletAddress
        };
        const accessToken = jwt.sign(payload, config.jwtSecret, {
            expiresIn: this.jwtExpiry
        });
        const refreshToken = jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: this.refreshTokenExpiry });
        return {
            accessToken,
            refreshToken,
            expiresIn: this.jwtExpiry
        };
    }
    /**
     * Generate verification token
     * @returns Verification token
     */
    generateVerificationToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    /**
     * Generate password reset token
     * @returns Reset token
     */
    generateResetToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    /**
     * Handle failed login attempt
     * @param user - User object
     */
    async handleFailedLogin(user) {
        const maxAttempts = 5;
        const lockTime = 15 * 60 * 1000; // 15 minutes
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;
        const lockUntil = failedAttempts >= maxAttempts ? new Date(Date.now() + lockTime) : null;
        await user.update({
            failedLoginAttempts: failedAttempts,
            lockUntil
        });
        if (lockUntil) {
            console.warn(`🚨 Account locked for user: ${user.username} due to too many failed attempts`);
        }
    }
    /**
     * Get user statistics
     * @returns User statistics
     */
    async getUserStats() {
        try {
            const totalUsers = await User.count();
            const verifiedUsers = await User.count({
                where: { isVerified: true }
            });
            const lockedUsers = await User.count({
                where: {
                    lockUntil: {
                        [require('sequelize').Op.gt]: new Date()
                    }
                }
            });
            return {
                totalUsers,
                verifiedUsers,
                lockedUsers,
                unverifiedUsers: totalUsers - verifiedUsers
            };
        }
        catch (error) {
            console.error('❌ Error getting user stats:', error);
            throw new Error(`Failed to get user statistics: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
// Create singleton instance
const authService = new AuthService();
// Export the service instance and class
module.exports = {
    authService,
    AuthService
};
//# sourceMappingURL=auth.service.js.map