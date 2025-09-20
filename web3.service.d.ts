declare const ethers: any;
declare const config: any;
/**
 * Web3 Service for Blockchain Interactions
 * Handles IP asset registration and verification on blockchain
 */
declare class Web3Service {
    private provider;
    private wallet;
    private contract;
    constructor();
    /**
     * Initialize Web3 provider and wallet
     */
    private initializeProvider;
    /**
     * Register IP asset on blockchain
     * @param assetData - IP asset data
     * @returns Blockchain registration result
     */
    registerIP(assetData: any): Promise<any>;
    /**
     * Verify IP asset ownership on blockchain
     * @param assetId - Blockchain asset ID
     * @param ownerAddress - Owner wallet address
     * @returns Verification result
     */
    verifyOwnership(assetId: string, ownerAddress: string): Promise<boolean>;
    /**
     * Get IP asset details from blockchain
     * @param assetId - Blockchain asset ID
     * @returns Asset details
     */
    getAssetDetails(assetId: string): Promise<any>;
    /**
     * Transfer IP asset ownership
     * @param assetId - Blockchain asset ID
     * @param fromAddress - Current owner address
     * @param toAddress - New owner address
     * @returns Transfer result
     */
    transferOwnership(assetId: string, fromAddress: string, toAddress: string): Promise<any>;
    /**
     * Get blockchain network information
     * @returns Network information
     */
    getNetworkInfo(): Promise<any>;
    /**
     * Test blockchain connection
     * @returns Connection status
     */
    testConnection(): Promise<boolean>;
    /**
     * Generate a mock blockchain ID
     * @returns Mock blockchain ID
     */
    private generateBlockchainId;
    /**
     * Generate a mock transaction hash
     * @returns Mock transaction hash
     */
    private generateTransactionHash;
}
declare const web3Service: Web3Service;
//# sourceMappingURL=web3.service.d.ts.map