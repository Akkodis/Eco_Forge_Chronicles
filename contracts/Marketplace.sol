// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./interfaces/IIncentiveMechanism.sol";
import "./interfaces/IKYCVerification.sol";

/**
 * @title Marketplace
 * @dev A modular and extensible marketplace for ERC20 and ERC721 tokens supporting direct sales.
 *      Features a plug-and-play mechanism to replace components such as the incentive mechanism.
 *      Payments are restricted to a whitelist of approved ERC20 tokens.
 *      Integrates with KYCVerification contract to enforce KYC requirements per payment token during listing.
 *      KYC and Incentive Mechanism functionalities are optional; if their contracts are set, features are enabled.
 */
contract Marketplace is Ownable2Step, ReentrancyGuard, Pausable {
    using EnumerableSet for EnumerableSet.AddressSet;

    enum TokenType {
        ERC20,
        ERC721
    }

    struct Listing {
        address seller;
        address assetAddress;
        uint256 tokenId;
        uint256 quantity;
        uint256 unitPrice;
        address paymentToken;
        TokenType tokenType;
        bool active;
    }

    struct BuyOrder {
        uint256 listingId;
        uint256 quantity;
    }

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;
    EnumerableSet.AddressSet private _allowedPaymentTokensSet;
    mapping(address => bool) public paymentTokenTriggersIncentive;
    mapping(address => bool) public allowedAssets;
    mapping(address => mapping(address => uint256)) public earnings;

    IIncentiveMechanism public incentiveMechanism;
    IKYCVerification public kycVerification;

    mapping(address => IKYCVerification.KYCLevel) public requiredKYCLevelByPaymentToken;

    event PaymentTokenStatusUpdated(address indexed token, bool allowed);
    event AssetStatusUpdated(address indexed asset, bool allowed);
    event ItemListed(uint256 indexed listingId, address indexed seller);
    event ItemsListed(uint256[] listingIds, address indexed seller);
    event ItemSold(uint256 indexed listingId, address indexed buyer, uint256 quantity, uint256 totalPrice);
    event ListingCancelled(uint256 indexed listingId, address indexed seller);
    event ListingsCancelled(uint256[] listingIds, address indexed seller);
    event EarningsClaimed(address indexed seller, address indexed paymentToken, uint256 amount);
    event IncentiveMechanismUpdated(address indexed newMechanism);
    event KYCVerificationUpdated(address indexed newKYCVerification);

    error Unauthorized();
    error InvalidParameters();
    error ListingNotActive();
    error TransferFailed();
    error AssetNotAllowed();
    error InsufficientKYCLevel();
    error NoListingsProvided();
    error NoBuyOrdersProvided();
    error NoListingIdsProvided();
    error TokenNotAllowed();
    error ZeroAddressNotAllowed();
    error InvalidAssetAddress();
    error InvalidPaymentToken();
    error InvalidTokenType();
    error InvalidQuantity();
    error ZeroUnitPrice();
    error SellerCannotBuyOwnItem();
    error TransferToMarketplaceFailed();
    error TransferToBuyerFailed();
    error TransferToSellerFailed();

    constructor() Ownable(_msgSender()) {
    }

    /**
     * @notice Sets the status of an ERC20 token as allowed or disallowed for payments,
     * and whether it should trigger the incentive mechanism.
     * @param token Address of the ERC20 token to enable or disable
     * @param allowed Boolean indicating whether to enable (true) or disable (false) the token
     * @param triggersIncentive Boolean indicating whether the token should trigger the incentive mechanism
     */
    function setPaymentTokenAllowed(address token, bool allowed, bool triggersIncentive) external onlyOwner {
        if (token == address(0)) revert InvalidParameters();

        if (allowed) {
            bool added = _allowedPaymentTokensSet.add(token);
            if (added) {
                paymentTokenTriggersIncentive[token] = triggersIncentive;
                emit PaymentTokenStatusUpdated(token, true);
            }
        } else {
            bool removed = _allowedPaymentTokensSet.remove(token);
            if (removed) {
                delete paymentTokenTriggersIncentive[token];
                emit PaymentTokenStatusUpdated(token, false);
            }
        }
    }

    /**
     * @notice Returns the list of all allowed payment tokens and whether they trigger the incentive mechanism
     * @return tokens Array of addresses of allowed payment tokens
     * @return triggersIncentive Array of booleans indicating whether each token triggers the incentive mechanism
     */
    function getAllowedPaymentTokens() external view returns (address[] memory tokens, bool[] memory triggersIncentive) {
        uint256 length = _allowedPaymentTokensSet.length();
        tokens = new address[](length);
        triggersIncentive = new bool[](length);
        for (uint256 i = 0; i < length; i++) {
            tokens[i] = _allowedPaymentTokensSet.at(i);
            triggersIncentive[i] = paymentTokenTriggersIncentive[tokens[i]];
        }
        return (tokens, triggersIncentive);
    }

    /**
     * @notice Sets the status of an asset contract as allowed or disallowed
     * @param asset Address of the asset contract (ERC20 or ERC721)
     * @param allowed Boolean indicating whether to allow (true) or disallow (false) the asset
     */
    function setAssetAllowed(address asset, bool allowed) external onlyOwner {
        if (asset == address(0)) revert ZeroAddressNotAllowed();
        allowedAssets[asset] = allowed;
        emit AssetStatusUpdated(asset, allowed);
    }

    /**
     * @notice Sets the KYCVerification contract address
     * @param _kycVerification Address of the KYCVerification contract
     */
    function setKYCVerification(address _kycVerification) external onlyOwner {
        kycVerification = IKYCVerification(_kycVerification);
        emit KYCVerificationUpdated(_kycVerification);
    }

    /**
     * @notice Sets the required KYC level for a specific payment token.
     * @param paymentToken The address of the payment token.
     * @param level The required KYC level.
     */
    function setRequiredKYCLevelForPaymentToken(address paymentToken, IKYCVerification.KYCLevel level) external onlyOwner {
        if (paymentToken == address(0)) revert ZeroAddressNotAllowed();
        requiredKYCLevelByPaymentToken[paymentToken] = level;
    }

    /**
     * @notice Lists multiple tokens for direct sale
     * @param listingsData Array of Listing structs containing listing details
     */
    function listItems(Listing[] calldata listingsData) external nonReentrant whenNotPaused {
        uint256 length = listingsData.length;
        if (length == 0) revert NoListingsProvided();
        uint256[] memory listingIds = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            listingIds[i] = _createListing(listingsData[i]);
            if (address(kycVerification) != address(0)) {
                _checkKYCLevel(msg.sender, listingsData[i].paymentToken);
            }
        }

        emit ItemsListed(listingIds, msg.sender);
    }

    /**
     * @notice Purchases multiple listed items
     * @param buyOrders Array of BuyOrder structs containing listing IDs and quantities
     */
    function buyItems(BuyOrder[] calldata buyOrders) external nonReentrant whenNotPaused {
        uint256 length = buyOrders.length;
        if (length == 0) revert NoBuyOrdersProvided();
        for (uint256 i = 0; i < length; i++) {
            _executeBuyOrder(buyOrders[i]);
        }
    }

    /**
     * @notice Allows sellers to claim their earnings for specific ERC20 payment tokens
     * @param paymentTokens Array of ERC20 token addresses to claim earnings from
     */
    function claimEarnings(address[] calldata paymentTokens) external nonReentrant whenNotPaused {
        uint256 totalTokens = paymentTokens.length;
        if (totalTokens == 0) revert InvalidParameters();

        for (uint256 i = 0; i < totalTokens; i++) {
            address token = paymentTokens[i];
            uint256 amount = earnings[msg.sender][token];

            if (amount > 0) {
                earnings[msg.sender][token] = 0;

                bool success = IERC20(token).transfer(msg.sender, amount);
                if (!success) revert TransferToSellerFailed();

                emit EarningsClaimed(msg.sender, token, amount);
            }
        }
    }

    /**
     * @notice Cancels multiple active listings
     * @param listingIds Array of listing IDs to cancel
     */
    function cancelListings(uint256[] calldata listingIds) external nonReentrant whenNotPaused {
        uint256 length = listingIds.length;
        if (length == 0) revert NoListingIdsProvided();
        for (uint256 i = 0; i < length; i++) {
            _cancelListing(listingIds[i]);
        }
        emit ListingsCancelled(listingIds, msg.sender);
    }

    /**
     * @notice Sets the Incentive Mechanism contract address
     * @param _incentiveMechanism Address of the new Incentive Mechanism contract
     */
    function setIncentiveMechanism(address _incentiveMechanism) external onlyOwner {
        incentiveMechanism = IIncentiveMechanism(_incentiveMechanism);
        emit IncentiveMechanismUpdated(_incentiveMechanism);
    }

    /**
     * @notice Pauses the marketplace, halting all operations except for whitelisted functions.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpauses the marketplace, resuming normal operations.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Internal function to create a new listing
     * @param listingData Listing data provided by the seller
     * @return listingId The ID of the newly created listing
     */
    function _createListing(Listing calldata listingData) internal returns (uint256 listingId) {
        if (listingData.assetAddress == address(0)) revert InvalidAssetAddress();
        if (listingData.unitPrice == 0) revert ZeroUnitPrice();
        if (!_allowedPaymentTokensSet.contains(listingData.paymentToken)) revert InvalidPaymentToken();
        if (!allowedAssets[listingData.assetAddress]) revert AssetNotAllowed();

        Listing storage listing = listings[nextListingId];
        listing.seller = msg.sender;
        listing.assetAddress = listingData.assetAddress;
        listing.tokenId = listingData.tokenId;
        listing.quantity = listingData.quantity;
        listing.unitPrice = listingData.unitPrice;
        listing.paymentToken = listingData.paymentToken;
        listing.tokenType = listingData.tokenType;
        listing.active = true;

        _transferToMarketplace(listing);

        emit ItemListed(nextListingId, msg.sender);
        listingId = nextListingId;
        nextListingId++;
    }

    /**
     * @notice Internal function to execute a buy order
     * @param order Buy order details
     */
    function _executeBuyOrder(BuyOrder calldata order) internal {
        Listing storage listing = listings[order.listingId];

        if (!listing.active) revert ListingNotActive();
        if (listing.seller == msg.sender) revert SellerCannotBuyOwnItem();
        if (!allowedAssets[listing.assetAddress]) revert AssetNotAllowed();

        uint256 totalPrice;

        if (listing.tokenType == TokenType.ERC20) {
            totalPrice = _processERC20Purchase(listing, order.quantity);
        } else if (listing.tokenType == TokenType.ERC721) {
            totalPrice = _processERC721Purchase(listing, order.quantity);
        } else {
            revert InvalidTokenType();
        }

        bool success = IERC20(listing.paymentToken).transferFrom(msg.sender, address(this), totalPrice);
        if (!success) revert TransferFailed();

        earnings[listing.seller][listing.paymentToken] += totalPrice;

        emit ItemSold(order.listingId, msg.sender, (listing.tokenType == TokenType.ERC20) ? order.quantity : 1, totalPrice);

        if (address(incentiveMechanism) != address(0) && paymentTokenTriggersIncentive[listing.paymentToken]) {
            incentiveMechanism.triggerIncentive(msg.sender, totalPrice);
        }
    }

    /**
     * @notice Internal function to cancel a listing
     * @param listingId ID of the listing to cancel
     */
    function _cancelListing(uint256 listingId) internal {
        Listing storage listing = listings[listingId];

        if (!listing.active) revert ListingNotActive();
        if (msg.sender != listing.seller) revert Unauthorized();

        listing.active = false;

        _transferBackToSeller(listing, listing.seller);

        emit ListingCancelled(listingId, listing.seller);
    }

    /**
     * @notice Internal function to handle transferring tokens to the marketplace
     * @param listing The listing details
     */
    function _transferToMarketplace(Listing storage listing) internal {
        if (listing.tokenType == TokenType.ERC20) {
            if (listing.quantity == 0) revert InvalidQuantity();
            bool success = IERC20(listing.assetAddress).transferFrom(msg.sender, address(this), listing.quantity);
            if (!success) revert TransferToMarketplaceFailed();
        } else if (listing.tokenType == TokenType.ERC721) {
            IERC721(listing.assetAddress).transferFrom(msg.sender, address(this), listing.tokenId);
        } else {
            revert InvalidTokenType();
        }
    }

    /**
     * @notice Internal function to process ERC20 purchases
     * @param listing The listing details
     * @param quantity Quantity to buy
     * @return totalPrice The total price of the purchase
     */
    function _processERC20Purchase(Listing storage listing, uint256 quantity) internal returns (uint256 totalPrice) {
        if (quantity == 0 || quantity > listing.quantity) revert InvalidQuantity();
        totalPrice = listing.unitPrice * quantity;
        listing.quantity -= quantity;

        if (listing.quantity == 0) {
            listing.active = false;
        }

        bool success = IERC20(listing.assetAddress).transfer(msg.sender, quantity);
        if (!success) revert TransferToBuyerFailed();
    }

    /**
     * @notice Internal function to process ERC721 purchases
     * @param listing The listing details
     * @param quantity Quantity to buy (should be 1)
     * @return totalPrice The total price of the purchase
     */
    function _processERC721Purchase(Listing storage listing, uint256 quantity) internal returns (uint256 totalPrice) {
        if (quantity != 1) revert InvalidQuantity();
        totalPrice = listing.unitPrice;
        listing.active = false;

        IERC721(listing.assetAddress).transferFrom(address(this), msg.sender, listing.tokenId);
    }

    /**
     * @notice Internal function to handle transferring tokens back to the seller upon cancellation
     * @param listing The listing details
     * @param seller Address of the seller
     */
    function _transferBackToSeller(Listing storage listing, address seller) internal {
        if (listing.tokenType == TokenType.ERC20) {
            bool success = IERC20(listing.assetAddress).transfer(seller, listing.quantity);
            if (!success) revert TransferToSellerFailed();
        } else if (listing.tokenType == TokenType.ERC721) {
            IERC721(listing.assetAddress).transferFrom(address(this), seller, listing.tokenId);
        } else {
            revert InvalidTokenType();
        }
    }

    /**
     * @notice Internal function to check the seller's KYC level against the required level for the payment token
     * @param user Address of the seller to check
     * @param paymentToken Address of the payment token
     */
    function _checkKYCLevel(address user, address paymentToken) internal view {
        if (address(kycVerification) != address(0)) {
            IKYCVerification.KYCLevel userLevel = kycVerification.getAddressKYCLevel(user);
            IKYCVerification.KYCLevel requiredLevel = requiredKYCLevelByPaymentToken[paymentToken];

            if (uint8(requiredLevel) > uint8(userLevel)) {
                revert InsufficientKYCLevel();
            }
        }
    }
}
