// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "erc-payable-token/contracts/token/ERC1363/IERC1363Receiver.sol";
import "./interfaces/IAssetReservoir.sol";

/**
 * @title AssetReservoir
 * @notice Manages pools of ERC20 tokens and allows authorized coordinators to dispense rewards.
 *         Supports ERC-1363 to receive tokens and assign them to pools.
 * @dev Implements a Coordinator Capability System to manage permissions and enhance security.
 */
contract AssetReservoir is Ownable2Step, IAssetReservoir, IERC1363Receiver, ReentrancyGuard {
    enum Capability {
        CanCreatePool,
        CanAddTokensToPool,
        CanDispenseRewards,
        CanRemoveTokensFromPool,
        CanDeactivatePool,
        CanTransferTokensBetweenPools
    }

    struct Pool {
        mapping(address tokenAddress => bool isInPool) tokens;
        mapping(address tokenAddress => uint256 tokenBalance) balances;
        address[] tokenList;
        bool isActive;
    }

    mapping(uint256 poolId => Pool poolInfo) public pools;
    uint256[] public poolIds;
    uint256 public nextPoolId;

    mapping(address coordinator => mapping(Capability capability => bool hasCapability)) public capabilitiesByCoordinator;

    event PoolCreated(uint256 indexed poolId, address creator);
    event TokensAddedToPool(uint256 indexed poolId, address[] tokens, uint256[] amounts);
    event CoordinatorCapabilityUpdated(address indexed coordinator, Capability capability, bool hasCapability);
    event TokensDeposited(uint256 indexed poolId, address indexed tokenAddress, uint256 amount, address depositor);
    event RewardsDispensed(uint256 indexed poolId, address indexed recipient, address indexed tokenAddress, uint256 amount, address dispenser);
    event TokenRemovedFromPool(uint256 indexed poolId, address indexed token, address to);
    event PoolDeactivated(uint256 indexed poolId);
    event TokensTransferredBetweenPools(uint256 indexed fromPoolId, uint256 indexed toPoolId, address indexed token, uint256 amount);

    error Unauthorized();
    error InvalidParameters();
    error TokenTransferFailed();
    error PoolAlreadyExists(uint256 poolId);
    error PoolDoesNotExist(uint256 poolId);
    error PoolInactive(uint256 poolId);
    error TokenAlreadyExistsInPool(address token);
    error TokenNotInPool(address token);
    error InsufficientPoolBalance(address token, uint256 requested, uint256 available);

    /**
     * @notice Modifier to restrict access to coordinators with specific capabilities.
     * @param capability The capability required to execute the function.
     */
    modifier onlyCoordinatorWithCapability(Capability capability) {
        if (!capabilitiesByCoordinator[msg.sender][capability]) revert Unauthorized();
        _;
    }

    /**
     * @notice Constructor to initialize the contract.
     * @dev Sets the deploying account as the initial owner.
     */
    constructor() Ownable(_msgSender()) {
        nextPoolId = 1;
    }

    /**
     * @notice Allows the owner to assign or revoke a capability to a coordinator.
     * @param coordinator The address of the coordinator.
     * @param capability The capability to assign or revoke.
     * @param hasCapability True to grant, false to revoke.
     */
    function updateCoordinatorCapability(address coordinator, Capability capability, bool hasCapability) external onlyOwner {
        if (coordinator == address(0)) revert InvalidParameters();
        capabilitiesByCoordinator[coordinator][capability] = hasCapability;
        emit CoordinatorCapabilityUpdated(coordinator, capability, hasCapability);
    }

    /**
     * @notice Creates a new pool with an automatically generated poolId.
     * @dev Only callable by coordinators with the CanCreatePool capability.
     */
    function createPool() external onlyCoordinatorWithCapability(Capability.CanCreatePool) {
        uint256 poolId = nextPoolId;
        nextPoolId++;

        Pool storage pool = pools[poolId];
        pool.isActive = true;
        poolIds.push(poolId);
        emit PoolCreated(poolId, msg.sender);
    }

    /**
     * @notice Adds tokens to an existing pool and transfers the specified amounts.
     * @param poolId The ID of the pool to add tokens to.
     * @param tokens The list of ERC20 token addresses to add.
     * @param amounts The list of amounts for each token to add to the pool.
     * @dev Only callable by coordinators with the CanAddTokensToPool capability.
     */
    function addTokensToPool(uint256 poolId, address[] calldata tokens, uint256[] calldata amounts) external onlyCoordinatorWithCapability(Capability.CanAddTokensToPool) nonReentrant {
        if (tokens.length == 0 || tokens.length != amounts.length) revert InvalidParameters();
        Pool storage pool = pools[poolId];
        if (!pool.isActive) revert PoolDoesNotExist(poolId);

        for (uint256 i; i < tokens.length; ++i) {
            address token = tokens[i];
            uint256 amount = amounts[i];
            if (amount == 0 || token == address(0)) revert InvalidParameters();

            if (!pool.tokens[token]) {
                pool.tokens[token] = true;
                pool.tokenList.push(token);
            }

            IERC20 erc20Token = IERC20(token);

            bool success = erc20Token.transferFrom(msg.sender, address(this), amount);
            if (!success) revert TokenTransferFailed();

            pool.balances[token] += amount;
        }

        emit TokensAddedToPool(poolId, tokens, amounts);
    }

    /**
     * @notice Returns the list of ERC20 token addresses in the specified pool.
     * @param poolId The ID of the pool.
     * @return tokens The list of token addresses in the pool.
     */
    function getTokensInPool(uint256 poolId) external view override returns (address[] memory tokens) {
        Pool storage pool = pools[poolId];
        if (!pool.isActive) revert PoolDoesNotExist(poolId);

        return pool.tokenList;
    }

    /**
     * @notice Returns the balance of a specific token in a pool.
     * @param poolId The ID of the pool.
     * @param token The address of the token.
     * @return balance The balance of the token in the pool.
     */
    function getTokenBalance(uint256 poolId, address token) external view returns (uint256 balance) {
        Pool storage pool = pools[poolId];
        if (!pool.isActive) revert PoolDoesNotExist(poolId);
        if (!pool.tokens[token]) revert TokenNotInPool(token);

        return pool.balances[token];
    }

    /**
     * @notice Returns all existing pool IDs.
     * @return ids The list of pool IDs.
     */
    function getAllPoolIds() external view returns (uint256[] memory ids) {
        return poolIds;
    }

    /**
     * @notice Returns detailed information about a pool.
     * @param poolId The ID of the pool.
     * @return isActive Status of the pool.
     * @return tokens List of tokens in the pool.
     */
    function getPoolInfo(uint256 poolId) external view returns (bool isActive, address[] memory tokens) {
        Pool storage pool = pools[poolId];
        if (!pool.isActive) revert PoolDoesNotExist(poolId);

        isActive = pool.isActive;
        tokens = pool.tokenList;

        return (isActive, tokens);
    }

    /**
     * @notice Dispenses a specified amount of tokens from a pool to a recipient.
     * @param poolId The ID of the pool to dispense from.
     * @param recipient The address to receive the tokens.
     * @param tokenAddress The address of the ERC20 token to dispense.
     * @param amount The amount of tokens to dispense.
     * @dev Only callable by coordinators with the CanDispenseRewards capability.
     */
    function dispenseReward(uint256 poolId, address recipient, address tokenAddress, uint256 amount) external override nonReentrant onlyCoordinatorWithCapability(Capability.CanDispenseRewards) {
        Pool storage pool = pools[poolId];
        if (!pool.isActive) revert PoolDoesNotExist(poolId);
        if (!pool.tokens[tokenAddress]) revert TokenNotInPool(tokenAddress);
        uint256 poolBalance = pool.balances[tokenAddress];
        if (poolBalance < amount) revert InsufficientPoolBalance(tokenAddress, amount, poolBalance);

        pool.balances[tokenAddress] -= amount;
        IERC20 token = IERC20(tokenAddress);
        bool success = token.transfer(recipient, amount);
        if (!success) revert TokenTransferFailed();

        emit RewardsDispensed(poolId, recipient, tokenAddress, amount, msg.sender);
    }

    /**
     * @notice Removes a token from a pool and transfers remaining balance to a specified address.
     * @param poolId The ID of the pool.
     * @param token The address of the token to remove.
     * @param to The address to receive the remaining tokens.
     * @dev Only callable by coordinators with the CanRemoveTokensFromPool capability.
     */
    function removeTokenFromPool(uint256 poolId, address token, address to) external onlyCoordinatorWithCapability(Capability.CanRemoveTokensFromPool) {
        if (to == address(0)) revert InvalidParameters();

        Pool storage pool = pools[poolId];
        if (!pool.isActive) revert PoolDoesNotExist(poolId);
        if (!pool.tokens[token]) revert TokenNotInPool(token);

        delete pool.tokens[token];

        uint256 tokenCount = pool.tokenList.length;
        for (uint256 i = 0; i < tokenCount; i++) {
            if (pool.tokenList[i] == token) {
                pool.tokenList[i] = pool.tokenList[tokenCount - 1];
                pool.tokenList.pop();
                break;
            }
        }

        uint256 remainingBalance = pool.balances[token];
        if (remainingBalance > 0) {
            pool.balances[token] = 0;
            IERC20(token).transfer(to, remainingBalance);
        }

        emit TokenRemovedFromPool(poolId, token, to);
    }

    /**
     * @notice Transfers a specified amount of tokens from one pool to another.
     * @param fromPoolId The ID of the source pool.
     * @param toPoolId The ID of the destination pool.
     * @param token The address of the ERC20 token to transfer.
     * @param amount The amount of tokens to transfer.
     * @dev Only callable by coordinators with the CanTransferTokensBetweenPools capability.
     */
    function transferTokensBetweenPools(uint256 fromPoolId, uint256 toPoolId, address token, uint256 amount) external onlyCoordinatorWithCapability(Capability.CanTransferTokensBetweenPools) {
        if (fromPoolId == toPoolId) revert InvalidParameters();
        if (token == address(0)) revert InvalidParameters();
        if (amount == 0) revert InvalidParameters();

        Pool storage fromPool = pools[fromPoolId];
        Pool storage toPool = pools[toPoolId];

        if (!fromPool.isActive) revert PoolDoesNotExist(fromPoolId);
        if (!toPool.isActive) revert PoolDoesNotExist(toPoolId);
        if (!fromPool.tokens[token]) revert TokenNotInPool(token);

        uint256 fromBalance = fromPool.balances[token];
        if (fromBalance < amount) revert InsufficientPoolBalance(token, amount, fromBalance);

        fromPool.balances[token] -= amount;
        toPool.balances[token] += amount;

        if (!toPool.tokens[token]) {
            toPool.tokens[token] = true;
            toPool.tokenList.push(token);

            address[] memory addedTokens = new address[](1);
            addedTokens[0] = token;

            uint256[] memory zeroAmounts = new uint256[](1);
            zeroAmounts[0] = 0;

            emit TokensAddedToPool(toPoolId, addedTokens, zeroAmounts);
        }

        emit TokensTransferredBetweenPools(fromPoolId, toPoolId, token, amount);
    }

    /**
     * @notice Deactivates a pool.
     * @param poolId The ID of the pool to deactivate.
     * @dev Only callable by coordinators with the CanDeactivatePool capability.
     */
    function deactivatePool(uint256 poolId) external onlyCoordinatorWithCapability(Capability.CanDeactivatePool) {
        Pool storage pool = pools[poolId];
        if (!pool.isActive) revert PoolDoesNotExist(poolId);
        pool.isActive = false;

        emit PoolDeactivated(poolId);
    }

    /**
     * @notice ERC-1363 callback function called after a transferAndCall or transferFromAndCall.
     * @param operator The address which initiated the transfer (i.e., msg.sender).
     * @param from The address which is transferring the tokens.
     * @param amount The amount of tokens being transferred.
     * @param data Additional data with no specified format. Should contain the poolId.
     * @return bytes4 Returns `IERC1363Receiver.onTransferReceived.selector` upon successful execution.
     *
     * @dev This function handles incoming ERC-1363 token transfers. It ensures that:
     *      - The amount transferred is greater than zero.
     *      - The operator has the necessary capabilities to add tokens to an existing pool or create a new one.
     *      - The provided data contains a valid poolId.
     *      - If the pool does not exist but the operator can create pools, it initializes the pool.
     *      - The token is added to the pool if it's not already present and the operator has the capability to add tokens.
     *      - The pool's token balance is updated accordingly.
     *      - Appropriate events are emitted for transparency.
     */
    function onTransferReceived(address operator, address from, uint256 amount, bytes calldata data) external override returns (bytes4) {
        if (amount == 0) {
            revert InvalidParameters();
        }

        bool canAddTokens = capabilitiesByCoordinator[operator][Capability.CanAddTokensToPool];
        bool canCreatePool = capabilitiesByCoordinator[operator][Capability.CanCreatePool];

        if (!canAddTokens && !canCreatePool) {
            revert Unauthorized();
        }

        if (data.length < 32) {
            revert InvalidParameters();
        }

        uint256 poolId = abi.decode(data, (uint256));

        Pool storage pool = pools[poolId];

        if (!pool.isActive) {
            if (!canCreatePool) {
                revert Unauthorized();
            }
            pool.isActive = true;
            poolIds.push(poolId);
            emit PoolCreated(poolId, operator);
        }

        address tokenAddress = msg.sender;

        pool.balances[tokenAddress] += amount;

        if (!pool.tokens[tokenAddress]) {
            if (!canAddTokens) {
                revert Unauthorized();
            }
            pool.tokens[tokenAddress] = true;
            pool.tokenList.push(tokenAddress);
        }

        emit TokensDeposited(poolId, tokenAddress, amount, from);

        return IERC1363Receiver.onTransferReceived.selector;
    }

    /**
     * @notice Allows the contract owner to withdraw tokens from the contract.
     * @param tokenAddress The address of the ERC20 token to withdraw.
     * @param amount The amount of tokens to withdraw.
     * @dev Only callable by the contract owner.
     */
    function withdrawTokens(address tokenAddress, uint256 amount) external onlyOwner {
        IERC20 token = IERC20(tokenAddress);
        bool success = token.transfer(msg.sender, amount);
        if (!success) revert TokenTransferFailed();
    }

}
