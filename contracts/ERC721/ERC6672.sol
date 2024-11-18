// contracts/ERC6672.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "../interfaces/IERC6672.sol";

/**
 * @title ERC6672
 * @dev Implementation of the ERC6672 standard, extending ERC721 with Enumerable capabilities.
 */
abstract contract ERC6672 is ERC721Enumerable, IERC6672 {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // Interface identifier for ERC6672
    bytes4 public constant IERC6672_ID = type(IERC6672).interfaceId;

    // Mapping to track redemption status: operator => tokenId => redemptionId => redeemed
    mapping(address => mapping(uint256 => mapping(bytes32 => bool))) private _redemptionStatus;

    // Mapping to store memos associated with redemptions: operator => tokenId => redemptionId => memo
    mapping(address => mapping(uint256 => mapping(bytes32 => string))) private _memos;

    // Mapping to store all redemption IDs for a given operator and tokenId
    mapping(address => mapping(uint256 => EnumerableSet.Bytes32Set)) private _redemptions;

    /**
     * @dev Constructor that initializes the ERC721 token with a name and symbol.
     * @param name The name of the token.
     * @param symbol The symbol of the token.
     */
    constructor(string memory name, string memory symbol) ERC721(name, symbol) ERC721Enumerable() {}

    /**
     * @inheritdoc IERC6672
     */
    function redeem(
        bytes32 redemptionId,
        uint256 tokenId,
        string calldata memo
    ) external override {
        _redeem(msg.sender, redemptionId, tokenId, memo);
    }

    /**
     * @inheritdoc IERC6672
     */
    function cancel(
        bytes32 redemptionId,
        uint256 tokenId,
        string calldata memo
    ) external override {
        _cancel(msg.sender, redemptionId, tokenId, memo);
    }

    /**
     * @inheritdoc IERC6672
     */
    function isRedeemed(
        address operator,
        bytes32 redemptionId,
        uint256 tokenId
    ) external view override returns (bool) {
        return _isRedeemed(operator, redemptionId, tokenId);
    }

    /**
     * @inheritdoc IERC6672
     */
    function getRedemptionIds(address operator, uint256 tokenId)
        external
        view
        override
        returns (bytes32[] memory)
    {
        uint256 length = _redemptions[operator][tokenId].length();
        bytes32[] memory redemptionIds = new bytes32[](length);
        for (uint256 i = 0; i < length; i++) {
            redemptionIds[i] = _redemptions[operator][tokenId].at(i);
        }
        return redemptionIds;
    }

    /**
     * @dev Internal function to handle redemption logic.
     * @param operator The address performing the redemption.
     * @param redemptionId The unique identifier for the redemption.
     * @param tokenId The ID of the token to redeem.
     * @param memo A memo or note associated with the redemption.
     */
    function _redeem(
        address operator,
        bytes32 redemptionId,
        uint256 tokenId,
        string calldata memo
    ) internal virtual {
        require(
            !_isRedeemed(operator, redemptionId, tokenId),
            "ERC6672: Token already redeemed with this redemption ID."
        );
        _updateRedemption(operator, redemptionId, tokenId, memo, true);
        _redemptions[operator][tokenId].add(redemptionId);
        emit Redeem(operator, tokenId, ownerOf(tokenId), redemptionId, memo);
    }

    /**
     * @dev Internal function to handle cancellation logic.
     * @param operator The address performing the cancellation.
     * @param redemptionId The unique identifier for the redemption to cancel.
     * @param tokenId The ID of the token whose redemption is to be canceled.
     * @param memo A memo or note associated with the cancellation.
     */
    function _cancel(
        address operator,
        bytes32 redemptionId,
        uint256 tokenId,
        string calldata memo
    ) internal virtual {
        require(
            _isRedeemed(operator, redemptionId, tokenId),
            "ERC6672: Token redemption does not exist."
        );
        _updateRedemption(operator, redemptionId, tokenId, memo, false);
        _redemptions[operator][tokenId].remove(redemptionId);
        emit Cancel(operator, tokenId, redemptionId, memo);
    }

    /**
     * @dev Internal function to check if a token has been redeemed with a specific redemption ID by an operator.
     * @param operator The address of the operator.
     * @param redemptionId The unique identifier for the redemption.
     * @param tokenId The ID of the token to check.
     * @return True if redeemed, false otherwise.
     */
    function _isRedeemed(
        address operator,
        bytes32 redemptionId,
        uint256 tokenId
    ) internal view returns (bool) {
        require(_exists(tokenId), "ERC6672: Token does not exist.");
        return _redemptionStatus[operator][tokenId][redemptionId];
    }

    /**
     * @dev Internal function to check if a token exists by verifying its owner is not the zero address.
     * @param tokenId The token ID to check.
     * @return exists True if the token exists, false otherwise.
     */
    function _exists(uint256 tokenId) internal view returns (bool exists) {
        return ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Internal function to update the redemption status and memo.
     * @param operator The address of the operator.
     * @param redemptionId The unique identifier for the redemption.
     * @param tokenId The ID of the token.
     * @param memo The memo associated with the redemption.
     * @param redeemed The new redemption status.
     */
    function _updateRedemption(
        address operator,
        bytes32 redemptionId,
        uint256 tokenId,
        string calldata memo,
        bool redeemed
    ) internal {
        _redemptionStatus[operator][tokenId][redemptionId] = redeemed;
        _memos[operator][tokenId][redemptionId] = memo;
        if (redeemed) {
            emit Redeem(operator, tokenId, ownerOf(tokenId), redemptionId, memo);
        } else {
            emit Cancel(operator, tokenId, redemptionId, memo);
        }
    }

    /**
     * @notice Retrieves the memo associated with a specific redemption.
     * @param operator The address of the operator.
     * @param redemptionId The unique identifier for the redemption.
     * @param tokenId The ID of the token.
     * @return The memo string.
     */
    function getMemo(
        address operator,
        bytes32 redemptionId,
        uint256 tokenId
    ) external view returns (string memory) {
        return _memos[operator][tokenId][redemptionId];
    }

    /**
     * @dev Overrides supportsInterface to include ERC6672 and ERC721Enumerable interfaces.
     * @param interfaceId The interface identifier.
     * @return True if the contract implements the interface, false otherwise.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721Enumerable)
        returns (bool)
    {
        return
            interfaceId == type(IERC6672).interfaceId ||
            super.supportsInterface(interfaceId);
    }

}