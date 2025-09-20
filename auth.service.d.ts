declare const bcrypt: any;
declare const jwt: any;
declare const crypto: any;
declare const User: any;
declare const config: any;
/**
 * Authentication Service
 * Handles user authentication, registration, password management, and security
 */
declare class AuthService {
    private readonly saltRounds;
    private readonly jwtExpiry;
    private readonly refreshTokenExpiry;
    /**
     * Register a new user
     * @param userData - User registration data
     * @returns Registration result
     */
    register(userData: {
        username: string;
        email: string;
        password: string;
        walletAddress: string;
    }): Promise<any>;
    /**
     * Authenticate user login
     * @param credentials - Login credentials
     * @returns Authentication result
     */
    login(credentials: {
        email: string;
        password: string;
    }): Promise<any>;
    /**
     * Refresh JWT token
     * @param refreshToken - Refresh token
     * @returns New tokens
     */
    refreshToken(refreshToken: string): Promise<any>;
    /**
     * Verify email address
     * @param token - Verification token
     * @returns Verification result
     */
    verifyEmail(token: string): Promise<any>;
    /**
     * Request password reset
     * @param email - User email
     * @returns Password reset result
     */
    requestPasswordReset(email: string): Promise<any>;
    /**
     * Reset password
     * @param token - Reset token
     * @param newPassword - New password
     * @returns Password reset result
     */
    resetPassword(token: string, newPassword: string): Promise<any>;
    /**
     * Get user profile
     * @param userId - User ID
     * @returns User profile
     */
    getProfile(userId: number): Promise<any>;
    /**
     * Update user profile
     * @param userId - User ID
     * @param updateData - Profile update data
     * @returns Update result
     */
    updateProfile(userId: number, updateData: {
        username?: string;
        email?: string;
        walletAddress?: string;
    }): Promise<any>;
    /**
     * Change password
     * @param userId - User ID
     * @param currentPassword - Current password
     * @param newPassword - New password
     * @returns Password change result
     */
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<any>;
    /**
     * Verify JWT token
     * @param token - JWT token
     * @returns Token verification result
     */
    verifyToken(token: string): Promise<any>;
    /**
     * Generate JWT tokens
     * @param user - User object
     * @returns JWT tokens
     */
    private generateTokens;
    /**
     * Generate verification token
     * @returns Verification token
     */
    private generateVerificationToken;
    /**
     * Generate password reset token
     * @returns Reset token
     */
    private generateResetToken;
    /**
     * Handle failed login attempt
     * @param user - User object
     */
    private handleFailedLogin;
    /**
     * Get user statistics
     * @returns User statistics
     */
    getUserStats(): Promise<any>;
}
declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map