// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title ERC998ERC721TopDown Interface
 * @dev Interface for ERC-998 ERC721 Top-Down Composable Non-Fungible Tokens.
 * See: https://eips.ethereum.org/EIPS/eip-998
 */
interface IERC998ERC721TopDown is IERC721Receiver {
    /// @dev Emitted when a child ERC721 token is received.
    event ReceivedChild(
        address indexed _from,
        uint256 indexed _toTokenId,
        address indexed _childContract,
        uint256 _childTokenId
    );

    /// @dev Emitted when a child ERC721 token is transferred out.
    event TransferChild(
        uint256 indexed _fromTokenId,
        address indexed _to,
        address indexed _childContract,
        uint256 _childTokenId
    );

    /**
     * @notice Get the root owner of tokenId.
     * @param _tokenId The token to query for a root owner address.
     * @return rootOwner The root owner at the top of the tree of tokens and ERC-998 magic value.
     */
    function rootOwnerOf(uint256 _tokenId) external view returns (bytes32 rootOwner);

    /**
     * @notice Get the root owner of a child token.
     * @param _childContract The contract address of the child token.
     * @param _childTokenId The tokenId of the child.
     * @return rootOwner The root owner at the top of tree of tokens and ERC-998 magic value.
     */
    function rootOwnerOfChild(
        address _childContract,
        uint256 _childTokenId
    ) external view returns (bytes32 rootOwner);

    /**
     * @notice Get the parent tokenId of a child token.
     * @param _childContract The contract address of the child token.
     * @param _childTokenId The tokenId of the child.
     * @return parentTokenOwner The parent address of the parent token and ERC-998 magic value.
     * @return parentTokenId The parent tokenId of _tokenId.
     */
    function ownerOfChild(
        address _childContract,
        uint256 _childTokenId
    ) external view returns (bytes32 parentTokenOwner, uint256 parentTokenId);

    /**
     * @notice Transfer child token from top-down composable to address.
     * @param _fromTokenId The owning token to transfer from.
     * @param _to The address that receives the child token.
     * @param _childContract The ERC721 contract of the child token.
     * @param _childTokenId The tokenId of the token that is being transferred.
     */
    function transferChild(
        uint256 _fromTokenId,
        address _to,
        address _childContract,
        uint256 _childTokenId
    ) external;

    /**
     * @notice Transfer child token from top-down composable to address safely.
     * @param _fromTokenId The owning token to transfer from.
     * @param _to The address that receives the child token.
     * @param _childContract The ERC721 contract of the child token.
     * @param _childTokenId The tokenId of the token that is being transferred.
     */
    function safeTransferChild(
        uint256 _fromTokenId,
        address _to,
        address _childContract,
        uint256 _childTokenId
    ) external;

    /**
     * @notice Transfer child token from top-down composable to address or other composable safely with data.
     * @param _fromTokenId The owning token to transfer from.
     * @param _to The address that receives the child token.
     * @param _childContract The ERC721 contract of the child token.
     * @param _childTokenId The tokenId of the token that is being transferred.
     * @param _data Additional data with no specified format.
     */
    function safeTransferChild(
        uint256 _fromTokenId,
        address _to,
        address _childContract,
        uint256 _childTokenId,
        bytes calldata _data
    ) external;

    /**
     * @notice Transfer child token to another parent ERC721 token.
     * @param _fromTokenId The owning token to transfer from.
     * @param _toContract The ERC721 contract of the receiving token.
     * @param _toTokenId The receiving token.
     * @param _childContract The ERC721 contract of the child token.
     * @param _childTokenId The token that is being transferred.
     * @param _data Additional data with no specified format.
     */
    function transferChildToParent(
        uint256 _fromTokenId,
        address _toContract,
        uint256 _toTokenId,
        address _childContract,
        uint256 _childTokenId,
        bytes calldata _data
    ) external;

    /**
     * @notice Get a child token from an ERC721 contract.
     * @param _from The address that owns the child token.
     * @param _tokenId The token that becomes the parent owner.
     * @param _childContract The ERC721 contract of the child token.
     * @param _childTokenId The tokenId of the child token.
     */
    function getChild(
        address _from,
        uint256 _tokenId,
        address _childContract,
        uint256 _childTokenId
    ) external;
}
