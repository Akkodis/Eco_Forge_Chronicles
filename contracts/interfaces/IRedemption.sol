// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IRedemption
 * @dev Interface for contracts that can handle redemption of ERC721Redeemable tokens.
 */
interface IRedemption {
    /**
     * @notice Called upon token redemption.
     * @param redeemer The address of the redeemer.
     * @param tokenId The ID of the redeemed token.
     */
    function onRedeem(address redeemer, uint256 tokenId) external;
}
