// contracts/SimpleIncentiveMechanism.sol
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IIncentiveMechanism.sol";
import "./interfaces/IRandomNumberGenerator.sol";
import "./interfaces/IAssetReservoir.sol";
import "./interfaces/IRedemption.sol";

/**
 * @title SimpleIncentiveMechanism
 * @notice A flexible incentive mechanism that rewards users with multiple charges, which they can redeem for rewards from different pools.
 *         Additionally, users can redeem NFTs to receive charges.
 *         Only authorized Coordinators can trigger the incentive mechanism.
 */
contract SimpleIncentiveMechanism is Ownable2Step, ReentrancyGuard, IIncentiveMechanism, IRedemption {
    IRandomNumberGenerator public randomNumberGenerator;
    IAssetReservoir public assetReservoir;

    struct Charge {
        bool available;
        uint256 timestamp;
    }

    // Mapping of users to their list of charges
    mapping(address => Charge[]) public charges;

    // Mapping to track which contracts (Coordinators) are authorized to trigger incentives
    mapping(address => bool) public authorizedCoordinators;

    // Probability of receiving a charge (in percentage, scaled by 100)
    uint256 public chargeProbability = 20; // 20% chance to get a charge

    event ChargeReceived(address indexed user, uint256 chargeIndex);
    event RewardRedeemed(address indexed user, uint256 poolId, address token, uint256 amount);
    event NFTChargeReceived(address indexed user, uint256 tokenId); // Event for NFT redemption
    event CoordinatorUpdated(address indexed coordinator, bool authorized); // Event for updating coordinators

    /**
     * @notice Constructor to initialize the contract with required dependencies.
     * @param _randomNumberGenerator The address of the random number generator contract.
     * @param _assetReservoir The address of the asset reservoir contract.
     */
    constructor(address _randomNumberGenerator, address _assetReservoir) Ownable(_msgSender()) {
        require(_randomNumberGenerator != address(0), "SimpleIncentiveMechanism: Invalid RNG address");
        require(_assetReservoir != address(0), "SimpleIncentiveMechanism: Invalid asset reservoir address");

        randomNumberGenerator = IRandomNumberGenerator(_randomNumberGenerator);
        assetReservoir = IAssetReservoir(_assetReservoir);
    }

    /**
     * @notice Only allows authorized coordinators to trigger incentives.
     */
    modifier onlyAuthorizedCoordinator() {
        require(authorizedCoordinators[msg.sender], "SimpleIncentiveMechanism: Not an authorized coordinator");
        _;
    }

    /**
     * @notice Triggers an incentive mechanism, potentially rewarding a user with a charge.
     * @param user The address of the user triggering the incentive.
     * @param value The value related to the event (could be transaction amount, interaction value, etc.).
     * @dev Only callable by authorized coordinators.
     */
    function triggerIncentive(address user, uint256 value) external override nonReentrant onlyAuthorizedCoordinator {
        uint256 random = randomNumberGenerator.generateRandomNumber(value) % 100;

        if (random < chargeProbability) {
            charges[user].push(Charge({ available: true, timestamp: block.timestamp }));
            uint256 chargeIndex = charges[user].length - 1;
            emit ChargeReceived(user, chargeIndex);
        }
    }

    /**
     * @notice Redeems an NFT to receive a charge.
     * @dev This function is called by the `ERC721Redeemable` contract when a token is redeemed.
     * @param redeemer The address of the redeemer.
     * @param tokenId The ID of the redeemed token.
     * @dev Only authorized contracts can trigger NFT-based charges.
     */
    function onRedeem(address redeemer, uint256 tokenId) external override nonReentrant onlyAuthorizedCoordinator {
        charges[redeemer].push(Charge({ available: true, timestamp: block.timestamp }));
        emit NFTChargeReceived(redeemer, tokenId);
    }

    /**
     * @notice Allows users to redeem a charge for rewards from a specified pool.
     * @param poolId The ID of the pool from which the user wants to redeem rewards.
     */
    function redeemCharge(uint256 poolId) external nonReentrant {
        Charge[] storage userCharges = charges[msg.sender];
        require(userCharges.length > 0, "SimpleIncentiveMechanism: No charges available");

        bool foundCharge = false;
        uint256 chargeIndex;

        for (uint256 i = 0; i < userCharges.length; i++) {
            if (userCharges[i].available) {
                foundCharge = true;
                chargeIndex = i;
                break;
            }
        }

        require(foundCharge, "SimpleIncentiveMechanism: No available charges to redeem");

        address[] memory tokens = assetReservoir.getTokensInPool(poolId);
        require(tokens.length > 0, "SimpleIncentiveMechanism: No tokens in the pool");

        uint256 randomIndex = randomNumberGenerator.generateRandomNumberInRange(uint256(uint160(msg.sender)), tokens.length);
        address selectedToken = tokens[randomIndex];

        uint256 rewardAmount = randomNumberGenerator.generateRandomNumberInRange(uint256(uint160(msg.sender)) + randomIndex, 1000);
        require(rewardAmount > 0, "SimpleIncentiveMechanism: Invalid reward amount");

        assetReservoir.dispenseReward(poolId, msg.sender, selectedToken, rewardAmount);

        // Mark the charge as used
        userCharges[chargeIndex].available = false;

        emit RewardRedeemed(msg.sender, poolId, selectedToken, rewardAmount);
    }

    /**
     * @notice Updates the random number generator contract.
     * @param _newRandomNumberGenerator The new random number generator contract.
     */
    function updateRandomNumberGenerator(address _newRandomNumberGenerator) external onlyOwner {
        require(_newRandomNumberGenerator != address(0), "SimpleIncentiveMechanism: Invalid RNG address");
        randomNumberGenerator = IRandomNumberGenerator(_newRandomNumberGenerator);
    }

    /**
     * @notice Updates the asset reservoir contract.
     * @param _newAssetReservoir The new asset reservoir contract.
     */
    function updateAssetReservoir(address _newAssetReservoir) external onlyOwner {
        require(_newAssetReservoir != address(0), "SimpleIncentiveMechanism: Invalid asset reservoir address");
        assetReservoir = IAssetReservoir(_newAssetReservoir);
    }

    /**
     * @notice Allows the owner to update the probability of receiving a charge.
     * @param _newProbability The new probability (0-100).
     */
    function updateChargeProbability(uint256 _newProbability) external onlyOwner {
        require(_newProbability <= 100, "SimpleIncentiveMechanism: Invalid probability value");
        chargeProbability = _newProbability;
    }

    /**
     * @notice Allows the owner to authorize or deauthorize a coordinator.
     * @param coordinator The address of the coordinator.
     * @param authorized Boolean indicating whether the coordinator is authorized.
     */
    function updateCoordinator(address coordinator, bool authorized) external onlyOwner {
        require(coordinator != address(0), "SimpleIncentiveMechanism: Invalid coordinator address");
        authorizedCoordinators[coordinator] = authorized;
        emit CoordinatorUpdated(coordinator, authorized);
    }

    /**
     * @notice Get the number of available charges for a user.
     * @param user The address of the user.
     * @return availableCharges The number of charges available for redemption.
     */
    function getAvailableCharges(address user) external view returns (uint256 availableCharges) {
        Charge[] storage userCharges = charges[user];
        for (uint256 i = 0; i < userCharges.length; i++) {
            if (userCharges[i].available) {
                availableCharges++;
            }
        }
    }
}
