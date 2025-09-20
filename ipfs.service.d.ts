declare const config: any;
declare let ipfs: any;
declare const initializeIPFS: () => Promise<any>;
/**
 * IPFS Service for IP Asset Management
 * Handles uploading, pinning, and managing IP assets on IPFS
 */
declare class IPFSService {
    /**
     * Upload metadata to IPFS
     * @param metadata - The metadata object to upload
     * @returns IPFS hash
     */
    uploadMetadata(metadata: any): Promise<string>;
    /**
     * Pin content to IPFS
     * @param hash - The IPFS hash to pin
     * @returns Success status
     */
    pinContent(hash: string): Promise<boolean>;
    /**
     * Retrieve content from IPFS
     * @param hash - The IPFS hash
     * @returns Content buffer
     */
    getContent(hash: string): Promise<Buffer>;
    /**
     * Get IPFS node information
     * @returns Node information
     */
    getNodeInfo(): Promise<any>;
    /**
     * Test IPFS connection
     * @returns Connection status
     */
    testConnection(): Promise<boolean>;
    /**
     * Upload file to IPFS
     * @param fileBuffer - File buffer
     * @param filename - Original filename
     * @returns IPFS hash
     */
    uploadFile(fileBuffer: Buffer, filename: string): Promise<string>;
    /**
     * Get IPFS gateway URL for content
     * @param hash - IPFS hash
     * @returns Gateway URL
     */
    getGatewayUrl(hash: string): string;
}
declare const ipfsService: IPFSService;
//# sourceMappingURL=ipfs.service.d.ts.map