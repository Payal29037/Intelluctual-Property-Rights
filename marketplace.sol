// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CreativeWorksMarketplace {

    // Represents a single creative work for sale
    struct Work {
        uint workId;
        address payable originalCreator;
        address payable currentOwner;
        string title;
        string summary;
        string licenseAgreement;
        uint askingPrice;
        bool isUnavailable;
    }

    uint public totalWorksCount = 0;
    mapping(uint => Work) public allWorks;

    bool private locked = false; // For reentrancy protection

    event WorkListed(uint indexed id, address indexed creator, string title, uint price);
    event WorkAcquired(uint indexed id, address indexed newOwner, uint price);
    event OwnershipTransferred(uint indexed id, address indexed oldOwner, address indexed newOwner);

    modifier noReentrancy() {
        require(!locked, "No reentrancy allowed");
        locked = true;
        _;
        locked = false;
    }

    // List a new creative work for sale
    function publishWork(
        string memory _title, 
        string memory _summary,
        string memory _licenseAgreement, 
        uint _askingPrice
    ) public {
        require(_askingPrice > 0, "Price must be a positive value");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_summary).length > 0, "Summary cannot be empty");
        require(bytes(_licenseAgreement).length > 0, "License agreement cannot be empty");

        totalWorksCount++;
        allWorks[totalWorksCount] = Work(
            totalWorksCount,
            payable(msg.sender), // original creator
            payable(msg.sender), // initial owner
            _title,
            _summary,
            _licenseAgreement,
            _askingPrice,
            false // initially available
        );

        emit WorkListed(totalWorksCount, msg.sender, _title, _askingPrice);
    }

    // Purchase a creative work from the marketplace
    function acquireWork(uint _workId) public payable noReentrancy {
        Work storage selectedWork = allWorks[_workId];

        // Ensure the work exists and is available
        require(_workId > 0 && _workId <= totalWorksCount, "Work ID is invalid");
        require(!selectedWork.isUnavailable, "This work has already been sold");

        // Verify the payment amount and prevent self-purchase
        require(msg.value == selectedWork.askingPrice, "Payment amount is incorrect");
        require(msg.sender != selectedWork.originalCreator, "Creator cannot buy their own work");

        address payable oldOwner = selectedWork.currentOwner;

        // Update state before interacting with external addresses
        selectedWork.isUnavailable = true;
        selectedWork.currentOwner = payable(msg.sender);

        emit OwnershipTransferred(_workId, oldOwner, msg.sender);

        // Transfer funds using safe method
        (bool sent, ) = oldOwner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        emit WorkAcquired(_workId, msg.sender, msg.value);
    }

    // Get the details of a specific creative work
    function getWorkDetails(uint _workId) public view returns (
        uint id,
        address originalCreator,
        address currentOwner,
        string memory title,
        string memory summary,
        string memory licenseAgreement,
        uint askingPrice,
        bool isUnavailable
    ) {
        Work memory retrievedWork = allWorks[_workId];
        return (
            retrievedWork.workId,
            retrievedWork.originalCreator,
            retrievedWork.currentOwner,
            retrievedWork.title,
            retrievedWork.summary,
            retrievedWork.licenseAgreement,
            retrievedWork.askingPrice,
            retrievedWork.isUnavailable
        );
    }
}