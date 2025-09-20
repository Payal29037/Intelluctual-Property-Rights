"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import your IP asset model and web3/contract service as needed
const { IPAsset } = require('../db/models/ipAsset.model');
const web3Service = require('../services/web3.service');
const ipfsService = require('../services/ipfs.service');
exports.createIPAsset = async (req, res) => {
    try {
        const { title, ipType, description, ipfsHash } = req.body;
        const owner = req.user?.id;
        const walletAddress = req.user?.walletAddress;
        // Input validation
        if (!title || typeof title !== 'string' || title.length < 3) {
            return res.status(400).json({ message: "Title is required and must be at least 3 characters." });
        }
        if (!ipType || typeof ipType !== 'string') {
            return res.status(400).json({ message: "IP type is required." });
        }
        if (!description || typeof description !== 'string' || description.length < 10) {
            return res.status(400).json({ message: "Description is required and must be at least 10 characters." });
        }
        if (!ipfsHash || typeof ipfsHash !== 'string') {
            return res.status(400).json({ message: "IPFS hash is required." });
        }
        if (!walletAddress) {
            return res.status(400).json({ message: "Wallet address is required." });
        }
        // Optionally: Store metadata on IPFS and get hash
        // const ipfsHash = await ipfsService.uploadMetadata({ title, ipType, description });
        // Register on blockchain (returns tx hash or asset ID)
        const blockchainResult = await web3Service.registerIP({
            title,
            ipType,
            description,
            ipfsHash,
            ownerAddress: walletAddress
        });
        // Save to DB (if using a DB)
        const { IPAsset } = require('../db/models/ipAsset.model');
        const asset = await IPAsset.create({ title, ipType, description, ipfsHash, owner, walletAddress, blockchainId: blockchainResult.id });
        console.log(`IP asset created: ${asset.id} by user ${owner}`);
        return res.status(201).json({
            message: "IP asset registered successfully.",
            blockchain: blockchainResult,
            asset,
        });
    }
    catch (err) {
        console.error("Failed to register IP asset:", err);
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({ message: "Failed to register IP asset.", error: errorMsg });
    }
};
exports.getIPAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const { IPAsset } = require('../db/models/ipAsset.model');
        const asset = await IPAsset.findByPk(id);
        if (!asset)
            return res.status(404).json({ message: "IP asset not found." });
        // Optionally: Fetch from blockchain
        const blockchainData = await web3Service.getIP(id);
        return res.status(200).json({
            asset,
            blockchain: blockchainData,
        });
    }
    catch (err) {
        console.error("Failed to fetch IP asset:", err);
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({ message: "Failed to fetch IP asset.", error: errorMsg });
    }
};
exports.updateIPAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, ipfsHash } = req.body;
        const { IPAsset } = require('../db/models/ipAsset.model');
        const asset = await IPAsset.findByPk(id);
        if (!asset)
            return res.status(404).json({ message: "IP asset not found." });
        // Authorization check: Only owner can update
        if (asset.owner !== req.user?.id) {
            return res.status(403).json({ message: "Only the owner can update this IP asset." });
        }
        // Optionally: Check on blockchain as well
        const blockchainOwner = await web3Service.getOwner(id);
        if (blockchainOwner !== req.user?.walletAddress) {
            return res.status(403).json({ message: "Only the owner can update this IP asset (blockchain check)." });
        }
        // Input validation
        if (!description || typeof description !== 'string' || description.length < 10) {
            return res.status(400).json({ message: "Description is required and must be at least 10 characters." });
        }
        if (!ipfsHash || typeof ipfsHash !== 'string') {
            return res.status(400).json({ message: "IPFS hash is required." });
        }
        // Update on blockchain
        const blockchainResult = await web3Service.updateDescription(id, description, ipfsHash);
        // Update in DB if needed
        asset.description = description;
        asset.ipfsHash = ipfsHash;
        await asset.save();
        console.log(`IP asset updated: ${asset.id} by user ${req.user?.id}`);
        return res.status(200).json({
            message: "IP asset updated successfully.",
            blockchain: blockchainResult,
            asset,
        });
    }
    catch (err) {
        console.error("Failed to update IP asset:", err);
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({ message: "Failed to update IP asset.", error: errorMsg });
    }
};
exports.transferIPAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const { newOwnerAddress } = req.body;
        const { IPAsset } = require('../db/models/ipAsset.model');
        const asset = await IPAsset.findByPk(id);
        if (!asset)
            return res.status(404).json({ message: "IP asset not found." });
        // Authorization check: Only owner can transfer
        if (asset.owner !== req.user?.id) {
            return res.status(403).json({ message: "Only the owner can transfer this IP asset." });
        }
        // Optionally: Check on blockchain as well
        const blockchainOwner = await web3Service.getOwner(id);
        if (blockchainOwner !== req.user?.walletAddress) {
            return res.status(403).json({ message: "Only the owner can transfer this IP asset (blockchain check)." });
        }
        // Transfer on blockchain
        const blockchainResult = await web3Service.transferOwnership(id, newOwnerAddress);
        // Update in DB if needed
        asset.owner = newOwnerAddress; // or map to user ID if needed
        await asset.save();
        console.log(`IP asset transferred: ${asset.id} by user ${req.user?.id} to ${newOwnerAddress}`);
        return res.status(200).json({
            message: "IP asset ownership transferred successfully.",
            blockchain: blockchainResult,
            asset,
        });
    }
    catch (err) {
        console.error("Failed to transfer IP asset:", err);
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({ message: "Failed to transfer IP asset.", error: errorMsg });
    }
};
exports.getOwnershipHistory = async (req, res) => {
    try {
        const { id } = req.params;
        // Optionally: Fetch from blockchain
        const history = await web3Service.getOwnershipHistory(id);
        return res.status(200).json({ history });
    }
    catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        return res.status(500).json({ message: "Failed to fetch ownership history.", error: errorMsg });
    }
};
//# sourceMappingURL=ipAssets.controller.js.map