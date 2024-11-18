// contracts/interfaces/IERC6672.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IERC6672
 * @dev Interface for the ERC6672 standard: Multi-redeemable NFTs.
 */
interface IERC6672 {
    /**
     * @dev Emitted when a token is redeemed.
     */
    event Redeem(
        address indexed operator,
        uint256 indexed tokenId,
        address indexed redeemer,
        bytes32 redemptionId,
        string memo
    );

    /**
     * @dev Emitted when a redemption is canceled.
     */
    event Cancel(
        address indexed operator,
        uint256 indexed tokenId,
        bytes32 redemptionId,
        string memo
    );

    /**
     * @notice Redeems a token with a specific redemption ID and memo.
     * @param redemptionId The unique identifier for the redemption.
     * @param tokenId The ID of the token to redeem.
     * @param memo A memo or note associated with the redemption.
     */
    function redeem(
        bytes32 redemptionId,
        uint256 tokenId,
        string calldata memo
    ) external;

    /**
     * @notice Cancels a previously redeemed token.
     * @param redemptionId The unique identifier for the redemption to cancel.
     * @param tokenId The ID of the token whose redemption is to be canceled.
     * @param memo A memo or note associated with the cancellation.
     */
    function cancel(
        bytes32 redemptionId,
        uint256 tokenId,
        string calldata memo
    ) external;

    /**
     * @notice Checks if a token has been redeemed with a specific redemption ID by an operator.
     * @param operator The address of the operator.
     * @param redemptionId The unique identifier for the redemption.
     * @param tokenId The ID of the token to check.
     * @return True if redeemed, false otherwise.
     */
    function isRedeemed(
        address operator,
        bytes32 redemptionId,
        uint256 tokenId
    ) external view returns (bool);

    /**
     * @notice Retrieves all redemption IDs associated with a token by an operator.
     * @param operator The address of the operator.
     * @param tokenId The ID of the token.
     * @return An array of redemption IDs.
     */
    function getRedemptionIds(address operator, uint256 tokenId)
        external
        view
        returns (bytes32[] memory);
}
