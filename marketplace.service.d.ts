declare const ethers: any;
declare const config: any;
declare const MARKETPLACE_ABI: string[];
/**
 * Marketplace Service for Creative Works
 * Handles interactions with the CreativeWorksMarketplace smart contract
 */
declare class MarketplaceService {
    private provider;
    private wallet;
    private contract;
    private contractAddress;
    constructor();
    /**
     * Initialize Web3 provider, wallet, and contract
     */
    private initializeProvider;
    /**
     * Publish a creative work to the marketplace
     * @param workData - Work data to publish
     * @returns Transaction result
     */
    publishWork(workData: {
        title: string;
        summary: string;
        licenseAgreement: string;
        askingPrice: string;
    }): Promise<any>;
    /**
     * Acquire a creative work from the marketplace
     * @param workId - ID of the work to acquire
     * @param price - Price to pay (in wei)
     * @returns Transaction result
     */
    acquireWork(workId: number, price: string): Promise<any>;
    /**
     * Get details of a specific work
     * @param workId - ID of the work
     * @returns Work details
     */
    getWorkDetails(workId: number): Promise<any>;
    /**
     * Get all works from the marketplace
     * @returns Array of work details
     */
    getAllWorks(): Promise<any[]>;
    /**
     * Get works by creator
     * @param creatorAddress - Creator's wallet address
     * @returns Array of work details
     */
    getWorksByCreator(creatorAddress: string): Promise<any[]>;
    /**
     * Get available works (not sold)
     * @returns Array of available work details
     */
    getAvailableWorks(): Promise<any[]>;
    /**
     * Get marketplace statistics
     * @returns Marketplace statistics
     */
    getMarketplaceStats(): Promise<any>;
    /**
     * Listen to marketplace events
     * @param eventName - Name of the event to listen to
     * @param callback - Callback function for event handling
     */
    listenToEvents(eventName: string, callback: (event: any) => void): Promise<void>;
    /**
     * Test marketplace connection
     * @returns Connection status
     */
    testConnection(): Promise<boolean>;
}
declare const marketplaceService: MarketplaceService;
//# sourceMappingURL=marketplace.service.d.ts.map