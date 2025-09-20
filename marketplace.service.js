"use strict";
const { ethers } = require('ethers');
const config = require('../config');
// Marketplace contract ABI (extracted from the Solidity contract)
const MARKETPLACE_ABI = [
    "function publishWork(string memory _title, string memory _summary, string memory _licenseAgreement, uint _askingPrice) public",
    "function acquireWork(uint _workId) public payable",
    "function getWorkDetails(uint _workId) public view returns (uint id, address originalCreator, address currentOwner, string memory title, string memory summary, string memory licenseAgreement, uint askingPrice, bool isUnavailable)",
    "function totalWorksCount() public view returns (uint)",
    "event WorkListed(uint indexed id, address indexed creator, string title, uint price)",
    "event WorkAcquired(uint indexed id, address indexed newOwner, uint price)",
    "event OwnershipTransferred(uint indexed id, address indexed oldOwner, address indexed newOwner)"
];
/**
 * Marketplace Service for Creative Works
 * Handles interactions with the CreativeWorksMarketplace smart contract
 */
class MarketplaceService {
    constructor() {
        this.initializeProvider();
        this.contractAddress = config.marketplaceContractAddress || '';
    }
    /**
     * Initialize Web3 provider, wallet, and contract
     */
    initializeProvider() {
        try {
            // Initialize provider
            this.provider = new ethers.JsonRpcProvider(config.web3ProviderUrl);
            // Initialize wallet (you'll need to set up a wallet for contract interactions)
            // For now, we'll use a placeholder
            this.wallet = null; // Set up with your private key or mnemonic
            // Initialize contract
            if (this.contractAddress) {
                this.contract = new ethers.Contract(this.contractAddress, MARKETPLACE_ABI, this.provider);
                if (this.wallet) {
                    this.contract = this.contract.connect(this.wallet);
                }
            }
            console.log('✅ Marketplace service initialized');
        }
        catch (error) {
            console.error('❌ Error initializing marketplace service:', error);
        }
    }
    /**
     * Publish a creative work to the marketplace
     * @param workData - Work data to publish
     * @returns Transaction result
     */
    async publishWork(workData) {
        try {
            console.log('📝 Publishing work to marketplace...', workData);
            if (!this.contract || !this.wallet) {
                throw new Error('Contract or wallet not initialized');
            }
            // Convert price to wei
            const priceInWei = ethers.parseEther(workData.askingPrice);
            // Call the smart contract
            const tx = await this.contract.publishWork(workData.title, workData.summary, workData.licenseAgreement, priceInWei);
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            const result = {
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                workId: null, // Will be extracted from events
                status: 'published'
            };
            // Extract work ID from events
            const workListedEvent = receipt.logs.find((log) => log.topics[0] === this.contract.interface.getEvent('WorkListed').topicHash);
            if (workListedEvent) {
                const decoded = this.contract.interface.parseLog(workListedEvent);
                result.workId = decoded.args.id.toString();
            }
            console.log(`✅ Work published successfully: ${result.workId}`);
            return result;
        }
        catch (error) {
            console.error('❌ Error publishing work to marketplace:', error);
            throw new Error(`Failed to publish work: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Acquire a creative work from the marketplace
     * @param workId - ID of the work to acquire
     * @param price - Price to pay (in wei)
     * @returns Transaction result
     */
    async acquireWork(workId, price) {
        try {
            console.log(`💰 Acquiring work ${workId} from marketplace...`);
            if (!this.contract || !this.wallet) {
                throw new Error('Contract or wallet not initialized');
            }
            // Convert price to wei
            const priceInWei = ethers.parseEther(price);
            // Call the smart contract with payment
            const tx = await this.contract.acquireWork(workId, {
                value: priceInWei
            });
            // Wait for transaction confirmation
            const receipt = await tx.wait();
            const result = {
                transactionHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                workId: workId.toString(),
                price: priceInWei.toString(),
                status: 'acquired'
            };
            console.log(`✅ Work acquired successfully: ${workId}`);
            return result;
        }
        catch (error) {
            console.error(`❌ Error acquiring work ${workId}:`, error);
            throw new Error(`Failed to acquire work: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get details of a specific work
     * @param workId - ID of the work
     * @returns Work details
     */
    async getWorkDetails(workId) {
        try {
            console.log(`📋 Getting work details for ${workId}...`);
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            // Call the smart contract
            const workDetails = await this.contract.getWorkDetails(workId);
            const result = {
                id: workDetails.id.toString(),
                originalCreator: workDetails.originalCreator,
                currentOwner: workDetails.currentOwner,
                title: workDetails.title,
                summary: workDetails.summary,
                licenseAgreement: workDetails.licenseAgreement,
                askingPrice: ethers.formatEther(workDetails.askingPrice), // Convert from wei to ether
                isUnavailable: workDetails.isUnavailable,
                status: 'retrieved'
            };
            console.log(`✅ Work details retrieved: ${workId}`);
            return result;
        }
        catch (error) {
            console.error(`❌ Error getting work details for ${workId}:`, error);
            throw new Error(`Failed to get work details: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get all works from the marketplace
     * @returns Array of work details
     */
    async getAllWorks() {
        try {
            console.log('📋 Getting all works from marketplace...');
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            // Get total works count
            const totalWorks = await this.contract.totalWorksCount();
            const works = [];
            // Fetch details for each work
            for (let i = 1; i <= totalWorks; i++) {
                try {
                    const workDetails = await this.getWorkDetails(i);
                    works.push(workDetails);
                }
                catch (error) {
                    console.warn(`⚠️ Failed to fetch work ${i}:`, error);
                }
            }
            console.log(`✅ Retrieved ${works.length} works from marketplace`);
            return works;
        }
        catch (error) {
            console.error('❌ Error getting all works:', error);
            throw new Error(`Failed to get all works: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get works by creator
     * @param creatorAddress - Creator's wallet address
     * @returns Array of work details
     */
    async getWorksByCreator(creatorAddress) {
        try {
            console.log(`📋 Getting works by creator: ${creatorAddress}...`);
            const allWorks = await this.getAllWorks();
            const creatorWorks = allWorks.filter(work => work.originalCreator.toLowerCase() === creatorAddress.toLowerCase());
            console.log(`✅ Found ${creatorWorks.length} works by creator`);
            return creatorWorks;
        }
        catch (error) {
            console.error('❌ Error getting works by creator:', error);
            throw new Error(`Failed to get works by creator: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get available works (not sold)
     * @returns Array of available work details
     */
    async getAvailableWorks() {
        try {
            console.log('📋 Getting available works from marketplace...');
            const allWorks = await this.getAllWorks();
            const availableWorks = allWorks.filter(work => !work.isUnavailable);
            console.log(`✅ Found ${availableWorks.length} available works`);
            return availableWorks;
        }
        catch (error) {
            console.error('❌ Error getting available works:', error);
            throw new Error(`Failed to get available works: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get marketplace statistics
     * @returns Marketplace statistics
     */
    async getMarketplaceStats() {
        try {
            console.log('📊 Getting marketplace statistics...');
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            const totalWorks = await this.contract.totalWorksCount();
            const allWorks = await this.getAllWorks();
            const stats = {
                totalWorks: totalWorks.toString(),
                availableWorks: allWorks.filter(work => !work.isUnavailable).length,
                soldWorks: allWorks.filter(work => work.isUnavailable).length,
                totalValue: allWorks.reduce((sum, work) => sum + parseFloat(work.askingPrice), 0).toFixed(4),
                contractAddress: this.contractAddress,
                status: 'active'
            };
            console.log('✅ Marketplace statistics retrieved');
            return stats;
        }
        catch (error) {
            console.error('❌ Error getting marketplace stats:', error);
            return {
                totalWorks: '0',
                availableWorks: 0,
                soldWorks: 0,
                totalValue: '0',
                contractAddress: this.contractAddress,
                status: 'error',
                error: error instanceof Error ? error.message : String(error)
            };
        }
    }
    /**
     * Listen to marketplace events
     * @param eventName - Name of the event to listen to
     * @param callback - Callback function for event handling
     */
    async listenToEvents(eventName, callback) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }
            console.log(`👂 Listening to ${eventName} events...`);
            this.contract.on(eventName, callback);
        }
        catch (error) {
            console.error(`❌ Error listening to ${eventName} events:`, error);
            throw new Error(`Failed to listen to events: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Test marketplace connection
     * @returns Connection status
     */
    async testConnection() {
        try {
            if (!this.contract) {
                return false;
            }
            await this.contract.totalWorksCount();
            console.log('✅ Marketplace connection successful');
            return true;
        }
        catch (error) {
            console.error('❌ Marketplace connection failed:', error);
            return false;
        }
    }
}
// Create singleton instance
const marketplaceService = new MarketplaceService();
// Export the service instance and class
module.exports = {
    marketplaceService,
    MarketplaceService
};
//# sourceMappingURL=marketplace.service.js.map