"use strict";
const { IPAsset } = require('../db/models/ipAsset.model');
const { create } = require('ipfs-http-client');
const config = require('../config');
// IPFS client configuration
const ipfs = create({ url: config.ipfsApiUrl });
/**
 * Pinning Job for IP Assets
 * This job handles pinning IP asset metadata to IPFS for decentralized storage
 * and ensures data persistence across the network.
 */
class PinningJob {
    constructor() {
        this.isRunning = false;
        this.intervalId = null;
    }
    /**
     * Start the pinning job with specified interval
     * @param intervalMs - Interval in milliseconds (default: 5 minutes)
     */
    start(intervalMs = 5 * 60 * 1000) {
        if (this.isRunning) {
            console.log('⚠️ Pinning job is already running');
            return;
        }
        console.log(`🚀 Starting IPFS pinning job (interval: ${intervalMs / 1000}s)`);
        this.isRunning = true;
        // Run immediately on start
        this.runPinningJob();
        // Schedule recurring runs
        this.intervalId = setInterval(() => {
            this.runPinningJob();
        }, intervalMs);
    }
    /**
     * Stop the pinning job
     */
    stop() {
        if (!this.isRunning) {
            console.log('⚠️ Pinning job is not running');
            return;
        }
        console.log('🛑 Stopping IPFS pinning job');
        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    /**
     * Run the pinning job once
     */
    async runPinningJob() {
        try {
            console.log('📌 Starting IPFS pinning job...');
            // Get all IP assets that need pinning
            const assetsToPin = await this.getAssetsToPin();
            if (assetsToPin.length === 0) {
                console.log('✅ No assets need pinning at this time');
                return;
            }
            console.log(`📋 Found ${assetsToPin.length} assets to pin`);
            // Process each asset
            const results = await Promise.allSettled(assetsToPin.map((asset) => this.pinAsset(asset)));
            // Log results
            this.logResults(results, assetsToPin);
        }
        catch (error) {
            console.error('❌ Error in pinning job:', error);
        }
    }
    /**
     * Get IP assets that need pinning
     * @returns Array of IP assets
     */
    async getAssetsToPin() {
        try {
            // Get assets created in the last 24 hours that might need pinning
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const assets = await IPAsset.findAll({
                where: {
                    createdAt: {
                        [require('sequelize').Op.gte]: oneDayAgo
                    }
                },
                order: [['createdAt', 'DESC']],
                limit: 100 // Process max 100 assets per run
            });
            return assets;
        }
        catch (error) {
            console.error('❌ Error fetching assets to pin:', error);
            return [];
        }
    }
    /**
     * Pin a single asset to IPFS
     * @param asset - IP asset to pin
     */
    async pinAsset(asset) {
        try {
            console.log(`📌 Pinning asset: ${asset.title} (${asset.ipfsHash})`);
            // Check if already pinned
            const pins = await ipfs.pin.ls();
            const isAlreadyPinned = pins.some((pin) => pin.cid.toString() === asset.ipfsHash);
            if (isAlreadyPinned) {
                console.log(`✅ Asset ${asset.ipfsHash} is already pinned`);
                return { success: true, assetId: asset.id, message: 'Already pinned' };
            }
            // Pin the asset
            await ipfs.pin.add(asset.ipfsHash, {
                recursive: false,
                timeout: 30000 // 30 second timeout
            });
            console.log(`✅ Successfully pinned asset: ${asset.title}`);
            return { success: true, assetId: asset.id, message: 'Pinned successfully' };
        }
        catch (error) {
            console.error(`❌ Failed to pin asset ${asset.title}:`, error);
            return { success: false, assetId: asset.id, error: error instanceof Error ? error.message : String(error) };
        }
    }
    /**
     * Log pinning results
     * @param results - Array of pinning results
     * @param assets - Array of assets that were processed
     */
    logResults(results, assets) {
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
        const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length;
        console.log(`📊 Pinning job completed:`);
        console.log(`   ✅ Successful: ${successful}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📋 Total processed: ${results.length}`);
        // Log failed assets for debugging
        if (failed > 0) {
            console.log('❌ Failed assets:');
            results.forEach((result, index) => {
                if (result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)) {
                    const asset = assets[index];
                    const error = result.status === 'rejected' ? result.reason : result.value.error;
                    console.log(`   - ${asset.title} (${asset.ipfsHash}): ${error}`);
                }
            });
        }
    }
    /**
     * Pin a specific asset by ID
     * @param assetId - ID of the asset to pin
     */
    async pinSpecificAsset(assetId) {
        try {
            const asset = await IPAsset.findByPk(assetId);
            if (!asset) {
                throw new Error(`Asset with ID ${assetId} not found`);
            }
            console.log(`📌 Manually pinning asset: ${asset.title}`);
            const result = await this.pinAsset(asset);
            if (result.success) {
                console.log(`✅ Successfully pinned asset: ${asset.title}`);
            }
            else {
                console.error(`❌ Failed to pin asset: ${asset.title}`);
            }
            return result;
        }
        catch (error) {
            console.error(`❌ Error pinning specific asset ${assetId}:`, error);
            return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
    }
    /**
     * Get pinning job status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            intervalId: this.intervalId ? 'active' : 'inactive'
        };
    }
}
// Create singleton instance
const pinningJob = new PinningJob();
// Export the job instance and class
module.exports = {
    pinningJob,
    PinningJob
};
// Auto-start the job if this file is run directly
if (require.main === module) {
    console.log('🚀 Starting IPFS pinning job...');
    pinningJob.start();
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, stopping pinning job...');
        pinningJob.stop();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, stopping pinning job...');
        pinningJob.stop();
        process.exit(0);
    });
}
//# sourceMappingURL=pinning.job.js.map