// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.24;

/**
 * @title IKYCVerification
 * @dev Interface for the KYCVerification contract that manages KYC levels for users.
 */
interface IKYCVerification {
    enum KYCLevel {
        None, // 0: No KYC
        Basic, // 1: Basic Identity Verification
        Intermediate, // 2: Basic Identity Verification + Proof of Address
        Advanced // 3: Basic Identity Verification + PEP, Sanctions and AML screening
    }

    /**
     * @notice Retrieves the KYC level of a specific user address.
     * @param user The address to check.
     * @return The KYC level of the user.
     */
    function getAddressKYCLevel(address user) external view returns (KYCLevel);
}
