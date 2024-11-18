// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IRandomNumberGenerator
 * @notice Interface for the Random Number Generator contract.
 */
interface IRandomNumberGenerator {
    /**
     * @notice Generates a pseudo-random number based on input.
     * @param seed A seed value to generate randomness.
     * @return A pseudo-random number.
     */
    function generateRandomNumber(uint256 seed) external view returns (uint256);

    /**
     * @notice Generates a pseudo-random number within a range.
     * @param seed A seed value to generate randomness.
     * @param max The upper bound of the range.
     * @return A pseudo-random number between 0 and max-1.
     */
    function generateRandomNumberInRange(uint256 seed, uint256 max) external view returns (uint256);
}
