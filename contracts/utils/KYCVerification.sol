// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title KYCVerification
 * @dev Manages KYC levels for users and integrates with ERC721 KYC NFTs.
 *      Allows projects to set KYC requirements and verify users' KYC levels.
 *      Modified for GDPR compliance by removing events that emit personal data.
 */
contract KYCVerification is Ownable2Step {
    using EnumerableSet for EnumerableSet.AddressSet;

    enum KYCLevel {
        None, // 0: No KYC
        Basic, // 1: Basic Identity Verification
        Intermediate, // 2: Basic Identity Verification + Proof of Address
        Advanced // 3: Basic Identity Verification + PEP, Sanctions and AML screening
    }

    enum Capability {
        CanSetKYCLevel,
        CanAddKYCNFTContract,
        CanRemoveKYCNFTContract,
        CanReadKYCLevel
    }

    mapping(address => mapping(Capability => bool)) public capabilitiesByCoordinator;

    mapping(address => KYCLevel) private addressKYCLevel;

    EnumerableSet.AddressSet private kycNFTContracts;

    event KYCNFTContractAdded(address indexed nftContract);
    event KYCNFTContractRemoved(address indexed nftContract);
    event CoordinatorCapabilityUpdated(address indexed coordinator, Capability capability, bool hasCapability);

    error UnauthorizedOperation();
    error InvalidAddress();
    error InvalidNFTContractAddress();
    error InvalidUserAddress();

    /**
     * @notice Constructor that initializes the Ownable contract.
     */
    constructor() Ownable(_msgSender()) {}

    modifier onlyCoordinatorWithCapability(Capability capability) {
        if (!capabilitiesByCoordinator[msg.sender][capability]) {
            revert UnauthorizedOperation();
        }
        _;
    }

    /**
     * @notice Allows the owner to assign or revoke a capability to a coordinator.
     * @param coordinator The address of the coordinator.
     * @param capability The capability to assign or revoke.
     * @param hasCapability True to grant, false to revoke.
     * @dev Only callable by the contract owner. Emits CoordinatorCapabilityUpdated event.
     */
    function updateCoordinatorCapability(address coordinator, Capability capability, bool hasCapability) external onlyOwner {
        if (coordinator == address(0)) {
            revert InvalidAddress();
        }
        capabilitiesByCoordinator[coordinator][capability] = hasCapability;
        emit CoordinatorCapabilityUpdated(coordinator, capability, hasCapability);
    }

    /**
     * @notice Adds a KYC NFT contract to the list of recognized KYC NFT contracts.
     * @param nftContract The address of the KYC ERC721 contract.
     */
    function addKYCNFTContract(address nftContract) external onlyCoordinatorWithCapability(Capability.CanAddKYCNFTContract) {
        if (nftContract == address(0)) {
            revert InvalidNFTContractAddress();
        }
        bool added = kycNFTContracts.add(nftContract);
        if (added) {
            emit KYCNFTContractAdded(nftContract);
        }
    }

    /**
     * @notice Removes a KYC NFT contract from the list of recognized KYC NFT contracts.
     * @param nftContract The address of the KYC ERC721 contract.
     */
    function removeKYCNFTContract(address nftContract) external onlyCoordinatorWithCapability(Capability.CanRemoveKYCNFTContract) {
        if (nftContract == address(0)) {
            revert InvalidNFTContractAddress();
        }
        bool removed = kycNFTContracts.remove(nftContract);
        if (removed) {
            emit KYCNFTContractRemoved(nftContract);
        }
    }

    /**
     * @notice Retrieves the list of registered KYC NFT contracts.
     * @return An array of KYC NFT contract addresses.
     */
    function getKYCNFTContracts() external view returns (address[] memory) {
        uint256 length = kycNFTContracts.length();
        address[] memory contracts = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            contracts[i] = kycNFTContracts.at(i);
        }
        return contracts;
    }

    /**
     * @notice Sets the KYC level for a specific user address.
     * @param user The address of the user.
     * @param level The KYC level to assign.
     */
    function setAddressKYCLevel(address user, KYCLevel level) external onlyCoordinatorWithCapability(Capability.CanSetKYCLevel) {
        if (user == address(0)) {
            revert InvalidUserAddress();
        }
        addressKYCLevel[user] = level;
    }

    /**
     * @notice Retrieves the KYC level of a specific user address.
     * @param user The address to check.
     * @return The KYC level of the user.
     */
    function getAddressKYCLevel(address user) public view onlyCoordinatorWithCapability(Capability.CanReadKYCLevel) returns (KYCLevel) {
        KYCLevel level = addressKYCLevel[user];
        if (level != KYCLevel.None) {
            return level;
        }

        for (uint256 i = 0; i < kycNFTContracts.length(); i++) {
            IERC721 kycNFT = IERC721(kycNFTContracts.at(i));
            if (kycNFT.balanceOf(user) > 0) {
                return KYCLevel.Basic;
            }
        }
        return KYCLevel.None;
    }
}
