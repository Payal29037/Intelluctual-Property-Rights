"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { marketplaceService } = require('../services/marketplace.service');
const { ipfsService } = require('../services/ipfs.service');
/**
 * Marketplace Controller
 * Handles marketplace-related API endpoints
 */
/**
 * Publish a creative work to the marketplace
 */
exports.publishWork = async (req, res) => {
    try {
        const { title, summary, licenseAgreement, askingPrice, ipfsHash } = req.body;
        const creatorAddress = req.user?.walletAddress;
        // Validate required fields
        if (!title || !summary || !licenseAgreement || !askingPrice) {
            return res.status(400).json({
                success: false,
                message: 'Title, summary, license agreement, and asking price are required'
            });
        }
        if (!creatorAddress) {
            return res.status(400).json({
                success: false,
                message: 'Creator wallet address is required'
            });
        }
        // Validate price is positive
        if (parseFloat(askingPrice) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Asking price must be greater than 0'
            });
        }
        // Prepare work data for blockchain
        const workData = {
            title,
            summary,
            licenseAgreement,
            askingPrice
        };
        // Publish to blockchain
        const blockchainResult = await marketplaceService.publishWork(workData);
        // If IPFS hash provided, ensure it's pinned
        if (ipfsHash) {
            await ipfsService.pinContent(ipfsHash);
        }
        res.status(201).json({
            success: true,
            message: 'Work published successfully',
            data: {
                workId: blockchainResult.workId,
                transactionHash: blockchainResult.transactionHash,
                blockNumber: blockchainResult.blockNumber,
                creator: creatorAddress,
                title,
                askingPrice,
                ipfsHash: ipfsHash || null
            }
        });
    }
    catch (error) {
        console.error('Error publishing work:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to publish work',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * Acquire a creative work from the marketplace
 */
exports.acquireWork = async (req, res) => {
    try {
        const { workId } = req.params;
        const { price } = req.body;
        const buyerAddress = req.user?.walletAddress;
        if (!buyerAddress) {
            return res.status(400).json({
                success: false,
                message: 'Buyer wallet address is required'
            });
        }
        if (!price) {
            return res.status(400).json({
                success: false,
                message: 'Price is required'
            });
        }
        // Validate work ID
        const workIdNum = parseInt(workId);
        if (isNaN(workIdNum) || workIdNum <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid work ID'
            });
        }
        // Acquire work from blockchain
        const result = await marketplaceService.acquireWork(workIdNum, price);
        res.status(200).json({
            success: true,
            message: 'Work acquired successfully',
            data: {
                workId: result.workId,
                transactionHash: result.transactionHash,
                blockNumber: result.blockNumber,
                buyer: buyerAddress,
                price
            }
        });
    }
    catch (error) {
        console.error('Error acquiring work:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to acquire work',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * Get work details
 */
exports.getWorkDetails = async (req, res) => {
    try {
        const { workId } = req.params;
        // Validate work ID
        const workIdNum = parseInt(workId);
        if (isNaN(workIdNum) || workIdNum <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid work ID'
            });
        }
        // Get work details from blockchain
        const workDetails = await marketplaceService.getWorkDetails(workIdNum);
        res.status(200).json({
            success: true,
            data: workDetails
        });
    }
    catch (error) {
        console.error('Error getting work details:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get work details',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * Get all works from marketplace
 */
exports.getAllWorks = async (req, res) => {
    try {
        const { page = 1, limit = 20, available = false } = req.query;
        let works;
        if (available === 'true') {
            works = await marketplaceService.getAvailableWorks();
        }
        else {
            works = await marketplaceService.getAllWorks();
        }
        // Simple pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedWorks = works.slice(startIndex, endIndex);
        res.status(200).json({
            success: true,
            data: {
                works: paginatedWorks,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: works.length,
                    pages: Math.ceil(works.length / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Error getting all works:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get works',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * Get works by creator
 */
exports.getWorksByCreator = async (req, res) => {
    try {
        const { creatorAddress } = req.params;
        const { page = 1, limit = 20 } = req.query;
        // Validate Ethereum address format
        if (!/^0x[a-fA-F0-9]{40}$/.test(creatorAddress)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid creator address format'
            });
        }
        const works = await marketplaceService.getWorksByCreator(creatorAddress);
        // Simple pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedWorks = works.slice(startIndex, endIndex);
        res.status(200).json({
            success: true,
            data: {
                works: paginatedWorks,
                creator: creatorAddress,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: works.length,
                    pages: Math.ceil(works.length / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Error getting works by creator:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get works by creator',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * Get user's own works
 */
exports.getUserWorks = async (req, res) => {
    try {
        const userAddress = req.user?.walletAddress;
        const { page = 1, limit = 20 } = req.query;
        if (!userAddress) {
            return res.status(400).json({
                success: false,
                message: 'User wallet address is required'
            });
        }
        const works = await marketplaceService.getWorksByCreator(userAddress);
        // Simple pagination
        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedWorks = works.slice(startIndex, endIndex);
        res.status(200).json({
            success: true,
            data: {
                works: paginatedWorks,
                creator: userAddress,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total: works.length,
                    pages: Math.ceil(works.length / Number(limit))
                }
            }
        });
    }
    catch (error) {
        console.error('Error getting user works:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get user works',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * Search works
 */
exports.searchWorks = async (req, res) => {
    try {
        const { q, type, minPrice, maxPrice, available = 'true' } = req.query;
        let works;
        if (available === 'true') {
            works = await marketplaceService.getAvailableWorks();
        }
        else {
            works = await marketplaceService.getAllWorks();
        }
        // Apply filters
        let filteredWorks = works;
        // Search by title or summary
        if (q) {
            const searchTerm = q.toLowerCase();
            filteredWorks = filteredWorks.filter((work) => work.title.toLowerCase().includes(searchTerm) ||
                work.summary.toLowerCase().includes(searchTerm));
        }
        // Filter by type (if you add work types to the contract)
        if (type) {
            // This would need to be implemented based on your contract structure
            // filteredWorks = filteredWorks.filter(work => work.type === type);
        }
        // Filter by price range
        if (minPrice) {
            filteredWorks = filteredWorks.filter((work) => parseFloat(work.askingPrice) >= parseFloat(minPrice));
        }
        if (maxPrice) {
            filteredWorks = filteredWorks.filter((work) => parseFloat(work.askingPrice) <= parseFloat(maxPrice));
        }
        res.status(200).json({
            success: true,
            data: {
                works: filteredWorks,
                filters: {
                    query: q,
                    type,
                    minPrice,
                    maxPrice,
                    available
                },
                total: filteredWorks.length
            }
        });
    }
    catch (error) {
        console.error('Error searching works:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search works',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * Get marketplace statistics
 */
exports.getMarketplaceStats = async (req, res) => {
    try {
        const stats = await marketplaceService.getMarketplaceStats();
        res.status(200).json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        console.error('Error getting marketplace stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get marketplace statistics',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
/**
 * Get marketplace health status
 */
exports.getMarketplaceHealth = async (req, res) => {
    try {
        const isConnected = await marketplaceService.testConnection();
        const stats = await marketplaceService.getMarketplaceStats();
        res.status(200).json({
            success: true,
            data: {
                status: isConnected ? 'healthy' : 'unhealthy',
                connected: isConnected,
                contractAddress: stats.contractAddress,
                totalWorks: stats.totalWorks,
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
        console.error('Error getting marketplace health:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get marketplace health',
            error: error instanceof Error ? error.message : String(error)
        });
    }
};
//# sourceMappingURL=marketplace.controller.js.map