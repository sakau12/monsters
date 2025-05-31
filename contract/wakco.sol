// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

contract LRMNNft is ERC721, Ownable {
    error LRMNNft__CantFlipTypeIfNotOwner();
    error LRMNNft__InsufficientMintFee();

    enum Type {
        SMOKE,
        SKATE
    }

    uint256 private s_tokenCounter;
    string private s_smokeSvgImageUri;
    string private s_skateSvgImageUri;
    uint256 private s_mintFee;
    mapping(uint256 => Type) private s_tokenIdToType;

    constructor(
        string memory smokeSvgImageUri,
        string memory skateSvgImageUri,
        uint256 mintFee
    ) ERC721("L RMN NFT", "LNFT") Ownable(msg.sender) {
        s_tokenCounter = 0;
        s_smokeSvgImageUri = smokeSvgImageUri;
        s_skateSvgImageUri = skateSvgImageUri;
        s_mintFee = mintFee;
    }

    function setMintFee(uint256 newMintFee) public onlyOwner {
        s_mintFee = newMintFee;
    }

    function mintNft() public payable {
        if (msg.value < s_mintFee) {
            revert LRMNNft__InsufficientMintFee();
        }

        uint256 random = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, s_tokenCounter))
        ) % 2;

        Type nftType = random == 0 ? Type.SMOKE : Type.SKATE;

        _safeMint(msg.sender, s_tokenCounter);
        s_tokenIdToType[s_tokenCounter] = nftType;
        s_tokenCounter++;
    }

    function flipType(uint256 tokenId) public {
        if (getApproved(tokenId) != msg.sender && ownerOf(tokenId) != msg.sender) {
            revert LRMNNft__CantFlipTypeIfNotOwner();
        }

        if (s_tokenIdToType[tokenId] == Type.SMOKE) {
            s_tokenIdToType[tokenId] = Type.SKATE;
        } else {
            s_tokenIdToType[tokenId] = Type.SMOKE;
        }
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;base64,";
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        string memory imageURI = s_tokenIdToType[tokenId] == Type.SMOKE
            ? s_smokeSvgImageUri
            : s_skateSvgImageUri;

        return string(
            abi.encodePacked(
                _baseURI(),
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name":"',
                            name(),
                            '", "description":"This is an NFT with no original value, and was created for development and learning within SOMNIA TESTNET.", ',
                            '"attributes": [{"trait_type": "style", "value": "',
                            s_tokenIdToType[tokenId] == Type.SMOKE ? "SMOKE" : "SKATE",
                            '"}], "image":"',
                            imageURI,
                            '"}'
                        )
                    )
                )
            )
        );
    }

    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function getMintFee() public view returns (uint256) {
        return s_mintFee;
    }
}
