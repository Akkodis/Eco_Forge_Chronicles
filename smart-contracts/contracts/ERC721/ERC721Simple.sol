// SPDX-License-Identifier: Apache-2.0
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ERC721Simple
 * @notice A basic ERC721 Non-Fungible Token contract with minting capabilities and auto-incrementing token IDs.
 * @dev Extends OpenZeppelin's ERC721Enumerable and Ownable contracts. Allows the owner to mint new tokens and set the base URI for metadata.
 */
contract ERC721Simple is ERC721Enumerable, Ownable {
    // Base URI for token metadata
    string private _baseTokenURI;

    // Event emitted when the base URI is updated
    event BaseURIUpdated(string newBaseURI);

    // Errors for input validations
    error EmptyName();
    error EmptySymbol();
    error InvalidBaseURI();
    error UnauthorizedMinting();

    // State variable to keep track of the current token ID
    uint256 private _currentTokenId;

    /**
     * @notice Constructor to initialize the contract with a name, symbol, and base URI.
     * @param name_ The name of the NFT collection.
     * @param symbol_ The symbol representing the NFT collection.
     * @param baseURI_ The base URI for token metadata.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(_msgSender()) {
        if (bytes(name_).length == 0) revert EmptyName();
        if (bytes(symbol_).length == 0) revert EmptySymbol();
        if (bytes(baseURI_).length == 0) revert InvalidBaseURI();

        _baseTokenURI = baseURI_;
        _currentTokenId = 0; // Initialize token ID counter
    }

    /**
     * @notice Sets a new base URI for all token metadata.
     * @param newBaseURI The new base URI to be set.
     * @dev Only callable by the contract owner.
     */
    function setBaseURI(string memory newBaseURI) external onlyOwner {
        if (bytes(newBaseURI).length == 0) revert InvalidBaseURI();
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    /**
     * @notice Retrieves the base URI set for the contract.
     * @return The current base URI.
     */
    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Mints a new NFT to a specified address with an auto-incremented tokenId.
     * @param to The address that will receive the minted NFT.
     * @dev Only callable by the contract owner.
     */
    function mint(address to) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");

        _currentTokenId += 1; // Increment token ID
        uint256 tokenId = _currentTokenId;

        _safeMint(to, tokenId);
    }

    /**
     * @notice Allows the owner to batch mint multiple NFTs to a single address.
     * @param to The address that will receive the minted NFTs.
     * @param numberOfTokens The number of tokens to mint.
     * @dev Only callable by the contract owner.
     */
    function batchMint(address to, uint256 numberOfTokens) external onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(numberOfTokens > 0, "Number of tokens must be greater than zero");

        for (uint256 i = 0; i < numberOfTokens; i++) {
            _currentTokenId += 1; // Increment token ID
            uint256 tokenId = _currentTokenId;

            _safeMint(to, tokenId);
        }
    }

    /**
     * @notice Overrides the default _baseURI function from ERC721.
     * @return The base URI set for the contract.
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Withdraws the contract's balance to the owner's address.
     * @dev Only callable by the contract owner. Useful if the contract receives Ether.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No Ether to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
