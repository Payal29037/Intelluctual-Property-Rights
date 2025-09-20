"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
const config = require('../config');
// IPFS client configuration - using dynamic import to handle compatibility
let ipfs = null;
const initializeIPFS = async () => {
    if (!ipfs) {
        try {
            const { create } = await Promise.resolve().then(() => __importStar(require('ipfs-http-client')));
            ipfs = create({ url: config.ipfsApiUrl });
            console.log('✅ IPFS client initialized');
        }
        catch (error) {
            console.warn('⚠️ IPFS client not available, using mock client:', error);
            // Create a mock IPFS client for development
            ipfs = {
                add: async (data) => ({ cid: { toString: () => 'mock-hash-' + Date.now() } }),
                pin: { add: async (hash) => ({ cid: { toString: () => hash } }) },
                cat: async (hash) => Buffer.from('mock-data'),
                id: async () => ({ id: 'mock-peer-id' }),
                version: async () => ({ version: '0.0.0' })
            };
        }
    }
    return ipfs;
};
/**
 * IPFS Service for IP Asset Management
 * Handles uploading, pinning, and managing IP assets on IPFS
 */
class IPFSService {
    /**
     * Upload metadata to IPFS
     * @param metadata - The metadata object to upload
     * @returns IPFS hash
     */
    async uploadMetadata(metadata) {
        try {
            console.log('📤 Uploading metadata to IPFS...', metadata);
            const ipfsClient = await initializeIPFS();
            const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
            const result = await ipfsClient.add(metadataBuffer, {
                pin: true,
                timeout: 30000
            });
            const ipfsHash = result.cid.toString();
            console.log(`✅ Metadata uploaded to IPFS: ${ipfsHash}`);
            return ipfsHash;
        }
        catch (error) {
            console.error('❌ Error uploading metadata to IPFS:', error);
            throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Pin content to IPFS
     * @param hash - The IPFS hash to pin
     * @returns Success status
     */
    async pinContent(hash) {
        try {
            console.log(`📌 Pinning content to IPFS: ${hash}`);
            const ipfsClient = await initializeIPFS();
            await ipfsClient.pin.add(hash);
            console.log(`✅ Content pinned to IPFS: ${hash}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Error pinning content to IPFS: ${error}`);
            return false;
        }
    }
    /**
     * Retrieve content from IPFS
     * @param hash - The IPFS hash
     * @returns Content buffer
     */
    async getContent(hash) {
        try {
            console.log(`📥 Retrieving content from IPFS: ${hash}`);
            const ipfsClient = await initializeIPFS();
            const chunks = [];
            for await (const chunk of ipfsClient.cat(hash)) {
                chunks.push(chunk);
            }
            const content = Buffer.concat(chunks);
            console.log(`✅ Content retrieved from IPFS: ${hash}`);
            return content;
        }
        catch (error) {
            console.error(`❌ Error retrieving content from IPFS: ${error}`);
            throw new Error(`Failed to retrieve content from IPFS: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get IPFS node information
     * @returns Node information
     */
    async getNodeInfo() {
        try {
            const ipfsClient = await initializeIPFS();
            const id = await ipfsClient.id();
            const version = await ipfsClient.version();
            return {
                id: id.id,
                version: version.version,
                addresses: id.addresses || []
            };
        }
        catch (error) {
            console.error('❌ Error getting IPFS node info:', error);
            return {
                id: 'unknown',
                version: '0.0.0',
                addresses: []
            };
        }
    }
    /**
     * Test IPFS connection
     * @returns Connection status
     */
    async testConnection() {
        try {
            const ipfsClient = await initializeIPFS();
            await ipfsClient.version();
            return true;
        }
        catch (error) {
            console.error('❌ IPFS connection test failed:', error);
            return false;
        }
    }
    /**
     * Upload file to IPFS
     * @param fileBuffer - File buffer
     * @param filename - Original filename
     * @returns IPFS hash
     */
    async uploadFile(fileBuffer, filename) {
        try {
            console.log(`📤 Uploading file to IPFS: ${filename}`);
            const ipfsClient = await initializeIPFS();
            const result = await ipfsClient.add(fileBuffer, {
                pin: true,
                timeout: 30000
            });
            const ipfsHash = result.cid.toString();
            console.log(`✅ File uploaded to IPFS: ${ipfsHash}`);
            return ipfsHash;
        }
        catch (error) {
            console.error('❌ Error uploading file to IPFS:', error);
            throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get IPFS gateway URL for content
     * @param hash - IPFS hash
     * @returns Gateway URL
     */
    getGatewayUrl(hash) {
        return `${config.ipfsGateway}${hash}`;
    }
}
// Export singleton instance
const ipfsService = new IPFSService();
module.exports = { ipfsService };
//# sourceMappingURL=ipfs.service.js.map