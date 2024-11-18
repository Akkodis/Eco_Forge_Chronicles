// contracts/ERC721Redeemable.sol
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC6672.sol";
import "../interfaces/IRedemption.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title ERC721Redeemable
 * @notice ERC721 token with redeemable functionality integrated with ERC6672 standard.
 * @dev Extends ERC6672 and Ownable. Allows tokens to be redeemed via the `redeem` function.
 */
contract ERC721Redeemable is ERC6672, Ownable {
    using Strings for uint256;

    address public redemptionContract;
    string private _baseTokenURI;

    event RedemptionContractUpdated(address indexed newRedemptionContract);

    error EmptyParameter(uint256 parameterIndex);
    error InvalidAddress();
    error UnauthorizedOperation();

    uint256 private _currentTokenId;

    /**
     * @notice Constructor to initialize the contract with a name, symbol, redemption contract address, and base URI.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param redemptionContract_ The address of the redemption contract.
     * @param baseURI_ The base URI for token metadata.
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address redemptionContract_,
        string memory baseURI_
    ) ERC6672(name_, symbol_) Ownable(_msgSender()) {
        if (bytes(name_).length == 0) revert EmptyParameter(1);
        if (bytes(symbol_).length == 0) revert EmptyParameter(2);
        if (redemptionContract_ == address(0)) revert InvalidAddress();
        if (bytes(baseURI_).length == 0) revert EmptyParameter(3);

        redemptionContract = redemptionContract_;
        _baseTokenURI = baseURI_;
        _currentTokenId = 0;
    }

    /**
     * @notice Overrides the internal `_baseURI` function to return the set base URI.
     * @return The base URI string.
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    /**
     * @notice Overrides the `tokenURI` function to concatenate the base URI with the tokenId.
     * @param tokenId The ID of the token.
     * @return The full URI of the token metadata.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);

        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI, tokenId.toString())) : "";
    }

    /**
     * @notice Overrides the internal `_redeem` function to include additional logic for redemption.
     * @param operator The address performing the redemption.
     * @param redemptionId The unique identifier for the redemption.
     * @param tokenId The ID of the token to redeem.
     * @param memo A memo or note associated with the redemption.
     */
    function _redeem(
        address operator,
        bytes32 redemptionId,
        uint256 tokenId,
        string calldata memo
    ) internal override {
        // Ensure the operator is authorized to perform redemption
        address owner = ownerOf(tokenId);
        require(
            operator == owner ||
                isApprovedForAll(owner, operator) ||
                getApproved(tokenId) == operator,
            "ERC721Redeemable: Unauthorized operation."
        );

        // Transfer the token to the Redemption Contract
        _safeTransfer(owner, redemptionContract, tokenId, "");

        // Invoke the `onRedeem` function on the Redemption Contract
        IRedemption(redemptionContract).onRedeem(operator, tokenId);

        // Update redemption status and emit event
        super._redeem(operator, redemptionId, tokenId, memo);
    }

    /**
     * @notice Overrides the internal `_cancel` function to include additional logic for cancellation.
     * @param operator The address performing the cancellation.
     * @param redemptionId The unique identifier for the redemption to cancel.
     * @param tokenId The ID of the token whose redemption is to be canceled.
     * @param memo A memo or note associated with the cancellation.
     */
    function _cancel(
        address operator,
        bytes32 redemptionId,
        uint256 tokenId,
        string calldata memo
    ) internal override {
        // Ensure the operator is authorized to perform cancellation
        address owner = ownerOf(tokenId);
        require(
            operator == owner ||
                isApprovedForAll(owner, operator) ||
                getApproved(tokenId) == operator,
            "ERC721Redeemable: Unauthorized operation."
        );

        // Update redemption status and emit event
        super._cancel(operator, redemptionId, tokenId, memo);

        // Additional logic if needed (e.g., transferring the token back, etc.)
    }

    /**
     * @notice Sets the redemption contract address.
     * @param redemptionContract_ The new redemption contract address.
     * @dev Only callable by the contract owner.
     */
    function setRedemptionContract(address redemptionContract_)
        external
        onlyOwner
    {
        if (redemptionContract_ == address(0)) revert InvalidAddress();
        redemptionContract = redemptionContract_;
        emit RedemptionContractUpdated(redemptionContract_);
    }

    /**
     * @notice Mints a new token to a specified address with an auto-incremented tokenId.
     * @param to The address to receive the minted token.
     * @dev Only callable by the contract owner.
     */
    function mint(address to) external onlyOwner {
        require(to != address(0), "ERC721Redeemable: Cannot mint to zero address");

        _currentTokenId += 1;
        uint256 tokenId = _currentTokenId;

        _safeMint(to, tokenId);
    }

    /**
     * @notice Allows the owner to batch mint multiple tokens to a single address.
     * @param to The address to receive the minted tokens.
     * @param numberOfTokens The number of tokens to mint.
     * @dev Only callable by the contract owner.
     */
    function batchMint(address to, uint256 numberOfTokens) external onlyOwner {
        require(to != address(0), "ERC721Redeemable: Cannot mint to zero address");
        require(numberOfTokens > 0, "ERC721Redeemable: Number of tokens must be greater than zero");

        for (uint256 i = 0; i < numberOfTokens; i++) {
            _currentTokenId += 1; // Increment token ID
            uint256 tokenId = _currentTokenId;

            _safeMint(to, tokenId);
        }
    }

    /**
     * @notice Withdraws the contract's balance to the owner's address.
     * @dev Only callable by the contract owner. Useful if the contract receives Ether.
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "ERC721Redeemable: No Ether to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ERC721Redeemable: Withdrawal failed");
    }

    /**
     * @inheritdoc IERC165
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC6672)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
