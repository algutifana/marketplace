//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/utils/Counters.sol';

contract NFT is ERC721URIStorage{
    
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIds;

    // marketplace address
    address contractAddress;


    constructor(address marketplaceAddress) ERC721('UnderRTD Tokens', 'URT') {

        contractAddress = marketplaceAddress;
    }


    function createToken(string memory tokenURI) public returns(uint256){

        
        _tokenIds.increment(); 

        uint256 newItemId = _tokenIds.current();

        _mint(msg.sender, newItemId); //mint function from openzeppelin, mints nft
        
        _setTokenURI(newItemId, tokenURI); 

        setApprovalForAll(contractAddress, true); //grab permission from user

        return newItemId;

    }


}


