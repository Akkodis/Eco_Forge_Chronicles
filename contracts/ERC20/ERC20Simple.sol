// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Simple
 * @notice ERC20 token with owner-controlled minting up to a maximum supply.
 * @dev Inherits from ERC20, Ownable2Step, and ReentrancyGuard.
 */
contract ERC20Simple is ERC20, Ownable2Step, ReentrancyGuard {
    uint256 public immutable maxSupply;
    uint256 public totalMinted;

    event TokensMinted(address indexed account, uint256 amount);

    error InvalidAddress();
    error ExceedsMaxSupply();
    error EmptyParameter(uint256 parameterIndex);

    /**
     * @notice Constructor to initialize the ERC20 token.
     * @param tokenName The name of the ERC20 token.
     * @param tokenSymbol The symbol of the ERC20 token.
     * @param tokenMaxSupply The maximum total supply of the tokens.
     * @dev Initializes ERC20 with name and symbol, and sets the maximum supply.
     */
    constructor(
        string memory tokenName,
        string memory tokenSymbol,
        uint256 tokenMaxSupply
    ) ERC20(tokenName, tokenSymbol) Ownable(_msgSender()) {
        if (bytes(tokenName).length == 0) revert EmptyParameter(1);
        if (bytes(tokenSymbol).length == 0) revert EmptyParameter(2);
        if (tokenMaxSupply == 0) revert EmptyParameter(3);

        maxSupply = tokenMaxSupply;
    }

    /**
     * @notice Mints new tokens to a specified address.
     * @param recipient The address that will receive the minted tokens.
     * @param amount The amount of tokens to mint.
     * @dev This function mints tokens to the recipient. Ensures that `totalMinted` does not exceed `maxSupply`.
     *      Emits a `TokensMinted` event upon successful minting.
     */
    function mint(address recipient, uint256 amount) external onlyOwner nonReentrant {
        if (recipient == address(0)) revert InvalidAddress();
        if (totalMinted + amount > maxSupply) revert ExceedsMaxSupply();

        totalMinted += amount;
        _mint(recipient, amount);

        emit TokensMinted(recipient, amount);
    }
}
