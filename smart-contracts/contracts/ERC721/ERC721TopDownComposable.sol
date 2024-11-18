// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../interfaces/IERC998ERC721TopDown.sol";

/**
 * @title ERC721TopDown
 * @dev Implementation of an ERC721 Top-Down Composable token as per EIP-998.
 *      This contract allows an ERC721 token to own other ERC721 tokens.
 *      It extends OpenZeppelin's latest ERC721 and implements the IERC998ERC721TopDown interface.
 */
contract ERC721TopDown is ERC721, IERC998ERC721TopDown {
    
    mapping(uint256 => mapping(address => uint256[])) private _childTokens;
    mapping(address => mapping(uint256 => uint256)) private _childTokenParent;
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) private _childTokenIndex;

    bytes4 private constant _INTERFACE_ID_ERC998 = 0xcd740db5;

    /**
     * @dev Constructor that sets the name and symbol of the ERC721 token.
     * @param name_ The name of the token collection.
     * @param symbol_ The symbol of the token collection.
     */
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    /**
     * @notice Get the root owner of tokenId.
     * @param tokenId The token to query for a root owner address.
     * @return rootOwner The root owner at the top of the tree of tokens and ERC-998 magic value.
     */
    function rootOwnerOf(uint256 tokenId) external view override returns (bytes32 rootOwner) {
        address rootOwnerAddress = ownerOf(tokenId);
        if (rootOwnerAddress.code.length > 0) {
            try IERC998ERC721TopDown(rootOwnerAddress).rootOwnerOf(tokenId) returns (bytes32 returnedRootOwner) {
                return returnedRootOwner;
            } catch {}
        }
        return (bytes32(bytes4(_INTERFACE_ID_ERC998)) << 224) | bytes32(uint256(uint160(rootOwnerAddress)));
    }

    /**
     * @notice Get the root owner of a child token.
     * @param childContract The contract address of the child token.
     * @param childTokenId The tokenId of the child.
     * @return rootOwner The root owner at the top of tree of tokens and ERC-998 magic value.
     */
    function rootOwnerOfChild(
        address childContract,
        uint256 childTokenId
    ) external view override returns (bytes32 rootOwner) {
        uint256 parentTokenId = _childTokenParent[childContract][childTokenId];
        require(parentTokenId != 0, "Child token does not have a parent");
        return this.rootOwnerOf(parentTokenId);
    }

    /**
     * @notice Get the parent tokenId of a child token.
     * @param childContract The contract address of the child token.
     * @param childTokenId The tokenId of the child.
     * @return parentTokenOwner The parent address of the parent token and ERC-998 magic value.
     * @return parentTokenId The parent tokenId of _tokenId.
     */
    function ownerOfChild(
        address childContract,
        uint256 childTokenId
    ) external view override returns (bytes32 parentTokenOwner, uint256 parentTokenId) {
        parentTokenId = _childTokenParent[childContract][childTokenId];
        require(parentTokenId != 0, "Child token does not have a parent");
        address parentTokenOwnerAddress = ownerOf(parentTokenId);
        return (
            (bytes32(bytes4(_INTERFACE_ID_ERC998)) << 224) | bytes32(uint256(uint160(parentTokenOwnerAddress))),
            parentTokenId
        );
    }

    /**
     * @notice A token receives a child token via safeTransferFrom.
     * @param operator The address that caused the transfer.
     * @param from The prior owner of the child token.
     * @param childTokenId The token that is being transferred to the parent.
     * @param data Up to the first 32 bytes contains an integer which is the receiving parent tokenId.
     * @return selector The magic value to confirm token reception.
     */
    function onERC721Received(
        address operator,
        address from,
        uint256 childTokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        require(data.length >= 32, "Data must contain the tokenId to transfer the child token to");
        uint256 parentTokenId = abi.decode(data, (uint256));
        _receiveChild(from, parentTokenId, msg.sender, childTokenId);
        emit ReceivedChild(from, parentTokenId, msg.sender, childTokenId);
        return this.onERC721Received.selector;
    }

    /**
     * @notice Transfer child token from top-down composable to address.
     * @param fromTokenId The owning token to transfer from.
     * @param to The address that receives the child token.
     * @param childContract The ERC721 contract of the child token.
     * @param childTokenId The tokenId of the token that is being transferred.
     */
    function transferChild(
        uint256 fromTokenId,
        address to,
        address childContract,
        uint256 childTokenId
    ) external override {
        require(_isApprovedOrOwner(_msgSender(), fromTokenId), "Caller is not owner nor approved");
        _removeChild(fromTokenId, childContract, childTokenId);
        IERC721(childContract).transferFrom(address(this), to, childTokenId);
        emit TransferChild(fromTokenId, to, childContract, childTokenId);
    }

    /**
     * @notice Transfer child token from top-down composable to address safely.
     * @param fromTokenId The owning token to transfer from.
     * @param to The address that receives the child token.
     * @param childContract The ERC721 contract of the child token.
     * @param childTokenId The tokenId of the token that is being transferred.
     */
    function safeTransferChild(
        uint256 fromTokenId,
        address to,
        address childContract,
        uint256 childTokenId
    ) external override {
        safeTransferChild(fromTokenId, to, childContract, childTokenId, "");
    }

    /**
     * @notice Transfer child token from top-down composable to address or other composable safely with data.
     * @param fromTokenId The owning token to transfer from.
     * @param to The address that receives the child token.
     * @param childContract The ERC721 contract of the child token.
     * @param childTokenId The tokenId of the token that is being transferred.
     * @param data Additional data with no specified format.
     */
    function safeTransferChild(
        uint256 fromTokenId,
        address to,
        address childContract,
        uint256 childTokenId,
        bytes memory data
    ) public override {
        require(_isApprovedOrOwner(_msgSender(), fromTokenId), "Caller is not owner nor approved");
        _removeChild(fromTokenId, childContract, childTokenId);
        IERC721(childContract).safeTransferFrom(address(this), to, childTokenId, data);
        emit TransferChild(fromTokenId, to, childContract, childTokenId);
    }

    /**
     * @notice Transfer child token to another parent ERC721 token.
     * @param fromTokenId The owning token to transfer from.
     * @param toContract The ERC721 contract of the receiving token.
     * @param toTokenId The receiving token.
     * @param childContract The ERC721 contract of the child token.
     * @param childTokenId The token that is being transferred.
     * @param data Additional data with no specified format.
     */
    function transferChildToParent(
        uint256 fromTokenId,
        address toContract,
        uint256 toTokenId,
        address childContract,
        uint256 childTokenId,
        bytes calldata data
    ) external override {
        require(_isApprovedOrOwner(_msgSender(), fromTokenId), "Caller is not owner nor approved");
        _removeChild(fromTokenId, childContract, childTokenId);
        bytes memory encodedData = abi.encode(toTokenId);
        IERC721(childContract).safeTransferFrom(address(this), toContract, childTokenId, encodedData);
        emit TransferChild(fromTokenId, toContract, childContract, childTokenId);
    }

    /**
     * @notice Get a child token from an ERC721 contract.
     * @param from The address that owns the child token.
     * @param tokenId The token that becomes the parent owner.
     * @param childContract The ERC721 contract of the child token.
     * @param childTokenId The tokenId of the child token.
     */
    function getChild(
        address from,
        uint256 tokenId,
        address childContract,
        uint256 childTokenId
    ) external override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Caller is not owner nor approved");
        IERC721(childContract).transferFrom(from, address(this), childTokenId);
        _receiveChild(from, tokenId, childContract, childTokenId);
        emit ReceivedChild(from, tokenId, childContract, childTokenId);
    }

    /**
     * @dev Internal function to handle the receipt of a child token.
     * @param from The address transferring the child token.
     * @param toTokenId The token ID that will own the child token.
     * @param childContract The contract address of the child token.
     * @param childTokenId The token ID of the child token.
     */
    function _receiveChild(
        address from,
        uint256 toTokenId,
        address childContract,
        uint256 childTokenId
    ) internal {
        require(_exists(toTokenId), "Parent token does not exist");
        require(IERC721(childContract).ownerOf(childTokenId) == address(this), "This contract does not own the child token");

        _childTokens[toTokenId][childContract].push(childTokenId);
        _childTokenParent[childContract][childTokenId] = toTokenId;
        _childTokenIndex[toTokenId][childContract][childTokenId] = _childTokens[toTokenId][childContract].length - 1;
    }

    /**
     * @dev Internal function to remove a child token from a parent token.
     * @param fromTokenId The token ID of the parent token.
     * @param childContract The contract address of the child token.
     * @param childTokenId The token ID of the child token.
     */
    function _removeChild(
        uint256 fromTokenId,
        address childContract,
        uint256 childTokenId
    ) internal {
        require(_childTokenParent[childContract][childTokenId] == fromTokenId, "Child token is not owned by the parent token");

        uint256 lastTokenIndex = _childTokens[fromTokenId][childContract].length - 1;
        uint256 tokenIndex = _childTokenIndex[fromTokenId][childContract][childTokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _childTokens[fromTokenId][childContract][lastTokenIndex];
            _childTokens[fromTokenId][childContract][tokenIndex] = lastTokenId;
            _childTokenIndex[fromTokenId][childContract][lastTokenId] = tokenIndex;
        }

        _childTokens[fromTokenId][childContract].pop();
        delete _childTokenIndex[fromTokenId][childContract][childTokenId];
        delete _childTokenParent[childContract][childTokenId];
    }

    /**
     * @dev Checks if a token exists by verifying its owner is not the zero address.
     * @param tokenId The token ID to check.
     * @return exists True if the token exists, false otherwise.
     */
    function _exists(uint256 tokenId) internal view returns (bool exists) {
        return _ownerOf(tokenId) != address(0);
    }

    /**
     * @dev Internal function to check if `spender` is allowed to manage `tokenId`.
     *      This replicates the logic of OpenZeppelin's `_isApprovedOrOwner` function.
     * @param spender The address attempting to manage the token.
     * @param tokenId The token ID to be managed.
     * @return True if `spender` is owner or approved, false otherwise.
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        address owner = _requireOwned(tokenId);
        return (spender == owner || isApprovedForAll(owner, spender) || getApproved(tokenId) == spender);
    }

    /**
     * @dev Override supportsInterface to include IERC998ERC721TopDown interface ID.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721) returns (bool) {
        return interfaceId == type(IERC998ERC721TopDown).interfaceId || super.supportsInterface(interfaceId);
    }
}
