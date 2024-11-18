// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title IIncentiveMechanism
 * @dev Interface for incentive mechanisms that can trigger incentives for users.
 */
interface IIncentiveMechanism {
    /**
     * @notice Triggers an incentive for a user based on some value.
     * @param user The address of the user to incentivize.
     * @param value A value related to the incentive logic.
     */
    function triggerIncentive(address user, uint256 value) external;
}
