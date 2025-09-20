"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
// Import our custom middleware
const { securityHeaders, corsConfig, requestSizeLimiter, requestLogger, performanceMonitor, errorHandler, notFoundHandler } = require("./middlewares");
// Import routes
const routes = require("./routes");
// Import services for health checks
const { ipfsService } = require("./services/ipfs.service");
const { web3Service } = require("./services/web3.service");
const { marketplaceService } = require("./services/marketplace.service");
// Import configuration
const config = require("./config");
/**
 * Create and configure Express application
 * @returns Configured Express app
 */
const createApp = () => {
    const app = express();
    // ==================== TRUST PROXY ====================
    // Trust proxy for accurate IP addresses (important for rate limiting)
    app.set('trust proxy', 1);
    // ==================== SECURITY MIDDLEWARE ====================
    // Helmet for security headers
    app.use(helmet({
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
    }));
    // CORS configuration
    app.use(corsConfig);
    // ==================== COMPRESSION & PARSING ====================
    // Gzip compression
    app.use(compression());
    // Body parsing middleware
    app.use(express.json({
        limit: '10mb',
        verify: (req, res, buf) => {
            // Store raw body for webhook verification if needed
            req.rawBody = buf;
        }
    }));
    app.use(express.urlencoded({
        extended: true,
        limit: '10mb'
    }));
    // Request size limiter
    app.use(requestSizeLimiter(10 * 1024 * 1024)); // 10MB limit
    // ==================== LOGGING & MONITORING ====================
    // Request logging
    app.use(requestLogger);
    // Performance monitoring
    app.use(performanceMonitor);
    // ==================== RATE LIMITING ====================
    // Global rate limiter
    const globalRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: config.rateLimit || 3000, // limit each IP to requests per windowMs
        message: {
            success: false,
            message: 'Too many requests from this IP, please try again later.',
            retryAfter: Math.ceil(15 * 60 * 1000 / 1000) // seconds
        },
        standardHeaders: true,
        legacyHeaders: false,
        skip: (req) => {
            // Skip rate limiting for health checks
            return req.path === '/health' || req.path === '/status';
        }
    });
    app.use(globalRateLimit);
    // ==================== API ROUTES ====================
    // Main API routes
    app.use("/api", routes);
    // ==================== HEALTH & STATUS ENDPOINTS ====================
    // Basic health check
    app.get("/health", (req, res) => {
        res.status(200).json({
            status: "OK",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: "1.0.0"
        });
    });
    // Detailed status check
    app.get("/status", async (req, res) => {
        try {
            // Check database connection
            const sequelize = require("./db/index");
            await sequelize.authenticate();
            // Check IPFS connection
            const ipfsStatus = await ipfsService.testConnection();
            // Check blockchain connection
            const blockchainStatus = await web3Service.testConnection();
            // Check marketplace connection
            const marketplaceStatus = await marketplaceService.testConnection();
            res.status(200).json({
                status: "operational",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                services: {
                    database: "connected",
                    ipfs: ipfsStatus ? "connected" : "disconnected",
                    blockchain: blockchainStatus ? "connected" : "disconnected",
                    marketplace: marketplaceStatus ? "connected" : "disconnected"
                },
                environment: process.env.NODE_ENV || "development",
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB"
                }
            });
        }
        catch (error) {
            res.status(503).json({
                status: "degraded",
                version: "1.0.0",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                error: error instanceof Error ? error.message : String(error),
                services: {
                    database: "error",
                    ipfs: "unknown",
                    blockchain: "unknown",
                    marketplace: "unknown"
                }
            });
        }
    });
    // ==================== API DOCUMENTATION ====================
    // API documentation endpoint
    app.get("/api/docs", (req, res) => {
        res.status(200).json({
            name: "IP Registry API",
            version: "1.0.0",
            description: "Digital Creators & Patent Holders Platform API",
            endpoints: {
                auth: {
                    "POST /api/auth/register": "Register new user",
                    "POST /api/auth/login": "User login",
                    "POST /api/auth/refresh-token": "Refresh JWT token",
                    "GET /api/auth/verify": "Verify email address",
                    "POST /api/auth/request-password-reset": "Request password reset",
                    "POST /api/auth/reset-password": "Reset password",
                    "GET /api/auth/profile": "Get user profile",
                    "PUT /api/auth/profile": "Update user profile",
                    "POST /api/auth/change-password": "Change password"
                },
                ipAssets: {
                    "POST /api/ip-assets": "Create IP asset",
                    "GET /api/ip-assets": "Get user's IP assets",
                    "GET /api/ip-assets/:id": "Get specific IP asset",
                    "PUT /api/ip-assets/:id": "Update IP asset",
                    "DELETE /api/ip-assets/:id": "Delete IP asset"
                },
                marketplace: {
                    "POST /api/marketplace/publish": "Publish work to marketplace",
                    "POST /api/marketplace/acquire/:workId": "Acquire work from marketplace",
                    "GET /api/marketplace/works": "Get all works",
                    "GET /api/marketplace/works/search": "Search works",
                    "GET /api/marketplace/works/:workId": "Get work details"
                },
                public: {
                    "GET /api/public/ip-assets": "Browse public IP assets",
                    "GET /api/public/ip-assets/search": "Search public IP assets"
                }
            },
            authentication: "Bearer token required for protected endpoints",
            rateLimiting: `${config.rateLimit || 3000} requests per 15 minutes`,
            compliance: {
                contact: config.complianceContact,
                jurisdictions: config.legalJurisdictions
            }
        });
    });
    // ==================== ERROR HANDLING ====================
    // 404 handler for undefined routes
    app.use(notFoundHandler);
    // Global error handler
    app.use(errorHandler);
    // ==================== GRACEFUL SHUTDOWN ====================
    // Handle graceful shutdown
    const gracefulShutdown = (signal) => {
        console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
        // Close database connections
        const sequelize = require("./db/index");
        sequelize.close().then(() => {
            console.log('✅ Database connection closed.');
            process.exit(0);
        }).catch((err) => {
            console.error('❌ Error closing database connection:', err);
            process.exit(1);
        });
    };
    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
        console.error('💥 Uncaught Exception:', error);
        gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
        gracefulShutdown('UNHANDLED_REJECTION');
    });
    return app;
};
module.exports = createApp;
//# sourceMappingURL=app.js.map