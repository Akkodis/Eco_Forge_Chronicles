// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.24;

/**
 * @title IAssetReservoir
 * @dev Interface for the AssetReservoir contract that manages different pools of ERC20 tokens.
 */
interface IAssetReservoir {
    /**
     * @notice Returns the list of ERC20 token addresses in the specified pool.
     * @param poolId The ID of the pool.
     * @return tokens The list of token addresses in the pool.
     */
    function getTokensInPool(uint256 poolId) external view returns (address[] memory tokens);

    /**
     * @notice Transfers the specified amount of tokens from the pool to the recipient address.
     * @param poolId The ID of the pool.
     * @param recipient The address to receive the tokens.
     * @param tokenAddress The address of the ERC20 token.
     * @param amount The amount of tokens to transfer.
     */
    function dispenseReward(uint256 poolId, address recipient, address tokenAddress, uint256 amount) external;
}
