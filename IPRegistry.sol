// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Intellectual Property Rights (IPR) Management on Ethereum
/// @author 
/// @notice This contract allows registering, viewing, updating, and transferring ownership of Intellectual Properties
contract IPRManagement {

    /// @dev Structure to hold Intellectual Property details
    struct IP {
        uint id;                // Unique ID for the IP
        string title;           // Title of the IP
        string ipType;          // Type: Patent, Trademark, Copyright, etc.
        address owner;          // Current Owner's Ethereum address
        string description;     // Brief description
        string ipfsHash;        // IPFS hash for off-chain metadata
        uint timestamp;         // Registration time
    }

    uint public ipCount;                          // Counter for IPs
    mapping(uint => IP) public ips;               // Stores IPs by ID
    mapping(uint => address[]) public ownershipHistory; // Tracks all past owners

    /// @dev Events for logging blockchain activity
    event IPRegistered(
        uint indexed id,
        string title,
        string ipType,
        address indexed owner,
        string ipfsHash,
        uint timestamp
    );

    event OwnershipTransferred(
        uint indexed id,
        address indexed oldOwner,
        address indexed newOwner,
        uint timestamp
    );

    event IPUpdated(
        uint indexed id,
        string newDescription,
        string newIpfsHash,
        uint timestamp
    );

    /// @dev Modifier to check that caller is the owner of an IP
    modifier onlyOwner(uint _id) {
        require(_id > 0 && _id <= ipCount, "Invalid IP ID");
        require(msg.sender == ips[_id].owner, "Only owner can perform this action");
        _;
    }

    /// @notice Register a new Intellectual Property
    /// @param _title Title of the IP
    /// @param _ipType Type of IP (Patent, Trademark, etc.)
    /// @param _description Description of the IP
    function registerIP(
        string memory _title,
        string memory _ipType,
        string memory _description,
        string memory _ipfsHash
    ) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_ipType).length > 0, "IP type cannot be empty");

        ipCount++;
        ips[ipCount] = IP(ipCount, _title, _ipType, msg.sender, _description, _ipfsHash, block.timestamp);

        // Track ownership history
        ownershipHistory[ipCount].push(msg.sender);

        emit IPRegistered(ipCount, _title, _ipType, msg.sender, _ipfsHash, block.timestamp);
    }

    /// @notice Get details of a registered IP by ID
    /// @param _id ID of the IP
    /// @return IP struct with details
    function getIP(uint _id) public view returns (IP memory) {
        require(_id > 0 && _id <= ipCount, "Invalid IP ID");
        return ips[_id];
    }

    /// @notice Transfer ownership of an IP
    /// @param _id ID of the IP
    /// @param _newOwner Ethereum address of the new owner
    function transferOwnership(uint _id, address _newOwner) public onlyOwner(_id) {
        require(_newOwner != address(0), "New owner cannot be zero address");

        address oldOwner = ips[_id].owner;
        ips[_id].owner = _newOwner;

        ownershipHistory[_id].push(_newOwner);

        emit OwnershipTransferred(_id, oldOwner, _newOwner, block.timestamp);
    }

    /// @notice Update IP description (only by owner)
    /// @param _id ID of the IP
    /// @param _newDescription Updated description
    function updateDescription(uint _id, string memory _newDescription, string memory _newIpfsHash) public onlyOwner(_id) {
        require(bytes(_newDescription).length > 0, "Description cannot be empty");

        ips[_id].description = _newDescription;
        ips[_id].ipfsHash = _newIpfsHash;

        emit IPUpdated(_id, _newDescription, _newIpfsHash, block.timestamp);
    }

    /// @notice Get ownership history of an IP
    /// @param _id ID of the IP
    /// @return Array of addresses that owned the IP
    function getOwnershipHistory(uint _id) public view returns (address[] memory) {
        require(_id > 0 && _id <= ipCount, "Invalid IP ID");
        return ownershipHistory[_id];
    }
}
