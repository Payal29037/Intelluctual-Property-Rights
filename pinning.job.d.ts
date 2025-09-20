declare const IPAsset: any;
declare const create: any;
declare const config: any;
declare const ipfs: any;
/**
 * Pinning Job for IP Assets
 * This job handles pinning IP asset metadata to IPFS for decentralized storage
 * and ensures data persistence across the network.
 */
declare class PinningJob {
    private isRunning;
    private intervalId;
    /**
     * Start the pinning job with specified interval
     * @param intervalMs - Interval in milliseconds (default: 5 minutes)
     */
    start(intervalMs?: number): void;
    /**
     * Stop the pinning job
     */
    stop(): void;
    /**
     * Run the pinning job once
     */
    runPinningJob(): Promise<void>;
    /**
     * Get IP assets that need pinning
     * @returns Array of IP assets
     */
    private getAssetsToPin;
    /**
     * Pin a single asset to IPFS
     * @param asset - IP asset to pin
     */
    private pinAsset;
    /**
     * Log pinning results
     * @param results - Array of pinning results
     * @param assets - Array of assets that were processed
     */
    private logResults;
    /**
     * Pin a specific asset by ID
     * @param assetId - ID of the asset to pin
     */
    pinSpecificAsset(assetId: number): Promise<{
        success: boolean;
        assetId: number;
        message?: string;
        error?: string;
    } | {
        success: boolean;
        error: string;
    }>;
    /**
     * Get pinning job status
     */
    getStatus(): {
        isRunning: boolean;
        intervalId: string;
    };
}
declare const pinningJob: PinningJob;
//# sourceMappingURL=pinning.job.d.ts.map