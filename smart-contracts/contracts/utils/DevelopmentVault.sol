// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "erc-payable-token/contracts/token/ERC1363/IERC1363Receiver.sol";

/**
 * @title DevelopmentVault
 * @notice Allows users to send ERC20 and ERC721 tokens directly to the contract and enables anyone to claim random tokens.
 * @dev The contract holds ERC20 and ERC721 tokens and allows any user to claim a surprise loot.
 *      For ERC20 tokens, it distributes tokens proportionally based on the user's requested amount and available tokens.
 *      For ERC721 tokens, it transfers a specified number of NFTs proportionally from available collections.
 */
contract DevelopmentVault is ReentrancyGuard, IERC721Receiver, IERC1363Receiver {
    using SafeERC20 for IERC20;

    event ERC20Received(address indexed token, address indexed from, uint256 amount);
    event ERC20Claimed(address indexed token, address indexed claimant, uint256 amount);
    event ERC721Received(address indexed token, address indexed from, uint256 tokenId);
    event ERC721Claimed(address indexed token, address indexed claimant, uint256 tokenId);

    mapping(address => uint256) public erc20Balances;
    address[] public erc20TokenAddresses;

    mapping(address => uint256[]) public erc721Tokens;
    address[] public erc721TokenAddresses;

    /**
     * @notice Allows any user to claim a specified amount of ERC20 tokens.
     * @param erc20Amount The total amount of ERC20 tokens the user wants to claim.
     * @dev The function distributes ERC20 tokens proportionally based on their available balances.
     *      It avoids gas-intensive loops by handling distributions in a single pass.
     */
    function claimERC20SurpriseLoot(uint256 erc20Amount) external nonReentrant {
        require(erc20Amount > 0, "DevelopmentVault: ERC20 amount must be greater than zero");
        uint256 erc20TokenCount = erc20TokenAddresses.length;
        require(erc20TokenCount > 0, "DevelopmentVault: No ERC20 tokens available for claim");

        uint256 totalAvailableTokens = 0;

        for (uint256 i = 0; i < erc20TokenCount; i++) {
            address tokenAddress = erc20TokenAddresses[i];
            uint256 contractBalance = IERC20(tokenAddress).balanceOf(address(this));
            totalAvailableTokens += contractBalance;
        }

        require(totalAvailableTokens > 0, "DevelopmentVault: No ERC20 tokens available for distribution");

        for (uint256 i = 0; i < erc20TokenCount; i++) {
            address tokenAddress = erc20TokenAddresses[i];
            uint256 contractBalance = IERC20(tokenAddress).balanceOf(address(this));

            uint256 amountToTransfer = (erc20Amount * contractBalance) / totalAvailableTokens;

            if (amountToTransfer > contractBalance) {
                amountToTransfer = contractBalance;
            }

            if (amountToTransfer > 0) {
                IERC20(tokenAddress).safeTransfer(msg.sender, amountToTransfer);
                emit ERC20Claimed(tokenAddress, msg.sender, amountToTransfer);

                erc20Balances[tokenAddress] = IERC20(tokenAddress).balanceOf(address(this));
            }

            if (erc20Balances[tokenAddress] == 0) {
                _removeERC20Token(i);
                i--;
                erc20TokenCount--;
            }
        }
    }

    /**
     * @notice Allows any user to claim a specified number of ERC721 tokens.
     * @param erc721Amount The total number of ERC721 tokens the user wants to claim.
     * @dev The function transfers ERC721 tokens proportionally from available collections.
     *      It avoids gas-intensive loops by handling distributions in a single pass.
     */
    function claimERC721SurpriseLoot(uint256 erc721Amount) external nonReentrant {
        require(erc721Amount > 0, "DevelopmentVault: ERC721 amount must be greater than zero");
        uint256 erc721TokenContractCount = erc721TokenAddresses.length;
        require(erc721TokenContractCount > 0, "DevelopmentVault: No ERC721 tokens available for claim");

        uint256 totalAvailableNFTs = 0;

        for (uint256 i = 0; i < erc721TokenContractCount; i++) {
            address nftAddress = erc721TokenAddresses[i];
            uint256[] storage tokenIds = erc721Tokens[nftAddress];
            totalAvailableNFTs += tokenIds.length;
        }

        require(totalAvailableNFTs > 0, "DevelopmentVault: No ERC721 tokens available for distribution");

        uint256 nftToTransfer = erc721Amount;
        if (nftToTransfer > totalAvailableNFTs) {
            nftToTransfer = totalAvailableNFTs;
        }

        for (uint256 i = 0; i < erc721TokenContractCount; i++) {
            address nftAddress = erc721TokenAddresses[i];
            uint256[] storage tokenIds = erc721Tokens[nftAddress];
            uint256 tokensAvailable = tokenIds.length;

            uint256 tokensToClaim = (nftToTransfer * tokensAvailable) / totalAvailableNFTs;

            if (tokensToClaim == 0 && tokensAvailable > 0 && nftToTransfer > 0) {
                tokensToClaim = 1;
            }

            for (uint256 j = 0; j < tokensToClaim && nftToTransfer > 0; j++) {
                uint256 tokenId = tokenIds[tokenIds.length - 1];
                tokenIds.pop();

                IERC721(nftAddress).safeTransferFrom(address(this), msg.sender, tokenId);
                emit ERC721Claimed(nftAddress, msg.sender, tokenId);

                nftToTransfer--;
                totalAvailableNFTs--;
            }

            if (tokenIds.length == 0) {
                _removeERC721Token(i);
                i--;
                erc721TokenContractCount--;
            }

            if (nftToTransfer == 0) {
                break;
            }
        }
    }

    /**
     * @dev Allows users to deposit ERC20 tokens that do not implement ERC1363.
     * @param token The address of the ERC20 token to deposit.
     * @param amount The amount of tokens to deposit.
     * @dev This function transfers ERC20 tokens from the sender to the contract and updates the balance mappings.
     */
    function depositERC20(address token, uint256 amount) external nonReentrant {
        require(token != address(0), "DevelopmentVault: Invalid token address");
        require(amount > 0, "DevelopmentVault: Amount must be greater than zero");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        if (erc20Balances[token] == 0) {
            erc20TokenAddresses.push(token);
        }
        erc20Balances[token] += amount;

        emit ERC20Received(token, msg.sender, amount);
    }

    /**
     * @dev Allows users to register ERC20 tokens that were sent directly to the contract without using depositERC20.
     * @param token The address of the ERC20 token to register.
     * @dev This function checks the current balance of the token in the contract and registers it if the balance is greater than zero.
     *      It ensures that the token is not already registered to prevent duplicates.
     */
    function registerERC20(address token) external nonReentrant {
        require(token != address(0), "DevelopmentVault: Invalid token address");

        uint256 currentBalance = IERC20(token).balanceOf(address(this));
        require(currentBalance > 0, "DevelopmentVault: No balance to register");

        if (erc20Balances[token] == 0) {
            erc20TokenAddresses.push(token);
        }

        erc20Balances[token] = currentBalance;

        emit ERC20Received(token, msg.sender, currentBalance);
    }

    /**
     * @dev Implementation of the IERC721Receiver interface.
     * @notice Allows the contract to receive ERC721 tokens via safeTransferFrom.
     * @param operator The address which initiated the transfer (i.e., msg.sender).
     * @param from The address which previously owned the token.
     * @param tokenId The NFT identifier which is being transferred.
     * @param data Additional data with no specified format.
     * @return bytes4 Returns `IERC721Receiver.onERC721Received.selector` upon successful execution.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        if (erc721Tokens[msg.sender].length == 0) {
            erc721TokenAddresses.push(msg.sender);
        }
        erc721Tokens[msg.sender].push(tokenId);

        emit ERC721Received(msg.sender, from, tokenId);

        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * @dev Implementation of the IERC1363Receiver interface.
     * @notice Allows the contract to receive ERC1363 tokens via transferAndCall.
     * @param operator The address which initiated the transfer (i.e., msg.sender).
     * @param from The address which previously owned the token.
     * @param amount The amount of tokens being transferred.
     * @param data Additional data with no specified format.
     * @return bytes4 Returns `IERC1363Receiver.onTransferReceived.selector` upon successful execution.
     */
    function onTransferReceived(
        address operator,
        address from,
        uint256 amount,
        bytes calldata data
    ) external override returns (bytes4) {
        address token = msg.sender;

        if (erc20Balances[token] == 0) {
            erc20TokenAddresses.push(token);
        }
        erc20Balances[token] += amount;

        emit ERC20Received(token, from, amount);

        return IERC1363Receiver.onTransferReceived.selector;
    }

    /**
     * @dev Generates a pseudo-random number. **Not secure** and should not be used in production.
     * @param max The upper limit for the random number (exclusive).
     * @return A pseudo-random number between 0 and max-1.
     */
    function _getRandomNumber(uint256 max) internal view returns (uint256) {
        require(max > 0, "DevelopmentVault: Max must be greater than zero");
        return uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender))) % max;
    }

    /**
     * @dev Removes an ERC20 token from the list when its balance is zero.
     * @param index The index of the token in the erc20TokenAddresses array.
     */
    function _removeERC20Token(uint256 index) internal {
        address tokenToRemove = erc20TokenAddresses[index];
        erc20TokenAddresses[index] = erc20TokenAddresses[erc20TokenAddresses.length - 1];
        erc20TokenAddresses.pop();
        delete erc20Balances[tokenToRemove];
    }

    /**
     * @dev Removes an ERC721 token from the list when it holds no more token IDs.
     * @param index The index of the token in the erc721TokenAddresses array.
     */
    function _removeERC721Token(uint256 index) internal {
        address tokenToRemove = erc721TokenAddresses[index];
        erc721TokenAddresses[index] = erc721TokenAddresses[erc721TokenAddresses.length - 1];
        erc721TokenAddresses.pop();
        delete erc721Tokens[tokenToRemove];
    }
}
