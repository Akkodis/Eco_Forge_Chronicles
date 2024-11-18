// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "erc-payable-token/contracts/token/ERC1363/ERC1363.sol";
import "erc-payable-token/contracts/token/ERC1363/ERC1363Utils.sol";

/**
 * @title ERC20EcoBound
 * @notice ERC20 token with eco-bound features, coordinator management, ERC-1363 functionality, and metadata URI.
 * @dev Inherits from ERC1363, Ownable2Step, and ReentrancyGuard. The tokenURI is included directly within this contract.
 */
contract ERC20EcoBound is ERC1363, Ownable2Step, ReentrancyGuard {
    enum Capability {
        CanReleaseEcoBoundToken,
        CanTransferEcoBoundToken
    }

    bool public isEcoBound;
    bool public isReleasable;

    mapping(address => mapping(Capability => bool)) public capabilitiesByCoordinator;

    uint256 public immutable maxSupply;
    uint256 public totalMinted;
    string public tokenURI;

    event EcoBoundReleased();
    event CoordinatorCapabilityUpdated(address indexed coordinator, Capability capability, bool hasCapability);
    event TokensMintedAndCalled(address indexed account, uint256 amount, bytes data);

    error UnauthorizedOperation();
    error InvalidAddress();
    error AlreadyReleased();
    error NotReleasable();
    error InconsistentReleasableState();
    error ExceedsMaxSupply();
    error EmptyParameter(uint256 parameterIndex);

    /**
     * @notice Constructor to initialize the ERC20EcoBound token.
     * @param tokenName The name of the ERC20 token.
     * @param tokenSymbol The symbol of the ERC20 token.
     * @param metadataURI The metadata URI for the token.
     * @param initialEcoBound Indicates whether the tokens are initially eco-bound.
     * @param initialReleasable Indicates whether the eco-bound status can be released.
     * @param tokenMaxSupply The maximum total supply of the tokens.
     * @dev Initializes ERC20 with name and symbol, sets the metadataURI, and configures eco-bound settings.
     */
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        string memory metadataURI,
        bool initialEcoBound,
        bool initialReleasable,
        uint256 tokenMaxSupply
    ) ERC20(tokenName, tokenSymbol) Ownable(_msgSender()) {
        if (bytes(tokenName).length == 0) revert EmptyParameter(1);
        if (bytes(tokenSymbol).length == 0) revert EmptyParameter(2);
        if (bytes(metadataURI).length == 0) revert EmptyParameter(3);
        if (initialReleasable && !initialEcoBound) revert InconsistentReleasableState();
        if (tokenMaxSupply == 0) revert EmptyParameter(6);

        tokenURI = metadataURI;
        isEcoBound = initialEcoBound;
        isReleasable = initialReleasable;
        maxSupply = tokenMaxSupply;
    }

    /**
     * @notice Safely mints new tokens to a specified address, with an optional data parameter for contracts.
     * @param recipient The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     * @param data Optional data to send along with the mint operation if minting to a contract.
     * @dev This function mints tokens and, if the recipient is a contract, invokes the ERC-1363 receiver callback.
     *      Ensures `totalMinted` is always updated, maintaining consistency across all mint operations.
     *      Emits a `TokensMintedAndCalled` event upon successful mint and call.
     */
    function mint(address recipient, uint256 amount, bytes memory data) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert InvalidAddress();
        if (totalMinted + amount > maxSupply) revert ExceedsMaxSupply();

        totalMinted += amount;
        _mint(recipient, amount);

        if (recipient.code.length != 0) {
            ERC1363Utils.checkOnERC1363TransferReceived(msg.sender, address(0), recipient, amount, data);
        }

        emit TokensMintedAndCalled(recipient, amount, data);
    }

    /**
     * @notice Allows a coordinator with the CanReleaseEcoBoundToken capability to release eco-bound restrictions.
     * @dev Permanently releases eco-bound restrictions if releasable. Emits EcoBoundReleased event.
     *      Reverts if not releasable, already released, or if sender lacks capability.
     */
    function releaseEcoBound() external nonReentrant {
        if (!isReleasable) revert NotReleasable();
        if (!capabilitiesByCoordinator[msg.sender][Capability.CanReleaseEcoBoundToken]) revert UnauthorizedOperation();
        if (!isEcoBound) revert AlreadyReleased();
        isEcoBound = false;
        emit EcoBoundReleased();
    }

    /**
     * @notice Allows the owner to assign or revoke a capability to a coordinator.
     * @param coordinator The address of the coordinator.
     * @param capability The capability to assign or revoke.
     * @param hasCapability True to grant, false to revoke.
     * @dev Only callable by the contract owner. Emits CoordinatorCapabilityUpdated event.
     */
    function updateCoordinatorCapability(address coordinator, Capability capability, bool hasCapability) external onlyOwner {
        if (coordinator == address(0)) revert InvalidAddress();
        capabilitiesByCoordinator[coordinator][capability] = hasCapability;
        emit CoordinatorCapabilityUpdated(coordinator, capability, hasCapability);
    }

    /**
     * @dev Internal function to handle token updates and enforce eco-bound restrictions.
     *      Overrides the ERC20 _update function to include eco-bound logic.
     * @param from The address sending the tokens.
     * @param to The address receiving the tokens.
     * @param value The amount of tokens being transferred.
     * @dev If tokens are eco-bound, only coordinators with the CanTransferEcoBoundToken capability can transfer tokens.
     *      Reverts with UnauthorizedOperation error if the sender lacks the capability.
     */
    function _update(address from, address to, uint256 value) internal virtual override {
        if (isEcoBound && from != address(0)) {
            if (!capabilitiesByCoordinator[_msgSender()][Capability.CanTransferEcoBoundToken]) revert UnauthorizedOperation();
        }
        super._update(from, to, value);
    }
}
