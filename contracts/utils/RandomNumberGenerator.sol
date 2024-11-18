// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.24;

import "@iota/iscmagic/ISC.sol";

/**
 * @title RandomNumberGenerator
 * @dev A random number generator that uses IOTA ISCSandbox's getEntropy function to provide verifiable on-chain randomness.
 */
contract RandomNumberGenerator {
    /**
     * @notice Generates an unbounded random number using ISCSandbox's on-chain entropy.
     * @dev Combines the sandbox-provided entropy with a user-provided nonce and sender address.
     * @param nonce A user-provided nonce to increase entropy.
     * @return A pseudo-random number generated using IOTA ISCSandbox entropy.
     */
    function generateRandomNumber(uint256 nonce) public view returns (uint256) {
        uint256 randomWord = uint256(keccak256(abi.encode(ISC.sandbox.getEntropy(), msg.sender, nonce)));
        return uint256(keccak256(abi.encode(randomWord)));
    }

    /**
     * @notice Generates a random number within a specified range using ISCSandbox's on-chain entropy.
     * @dev Uses the modulus operation to limit the random number to the desired range.
     * @param nonce A user-provided nonce to increase entropy.
     * @param lessThan The exclusive upper bound for the random number.
     * @return A pseudo-random number less than the provided upper limit.
     */
    function generateRandomNumberInRange(uint256 nonce, uint256 lessThan) public view returns (uint256) {
        uint256 randomWord = uint256(keccak256(abi.encode(ISC.sandbox.getEntropy(), msg.sender, nonce)));
        uint256 newRand = uint256(keccak256(abi.encode(randomWord)));
        return newRand % lessThan;
    }
}
