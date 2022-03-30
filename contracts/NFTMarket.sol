//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';


contract NFTMarket is ReentrancyGuard {

    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address payable owner; 

    uint256 listPrice = 0.02 ether;

    
    constructor(){
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        address nftAddress;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;

    }

    mapping(uint256 => MarketItem) private idMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftAddress,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // get price of NFT
    function getlistPrice() public view returns (uint256){
        return listPrice;
    }

  function setlistPrice(uint _price) public returns(uint) {
         if(msg.sender == address(this) ){
             listPrice = _price;
         }
         return listPrice;
    }


    //NFT creator function
    function createMarketItem(address nftAddress, uint256 tokenId, uint256 price) public payable nonReentrant{
        
        require (price > 0, "price must be > 0");
        require(msg.value == listPrice, "price != list price");

        _itemIds.increment();

        uint256 itemId = _itemIds.current();

        idMarketItem[itemId] = MarketItem(itemId, nftAddress, tokenId, payable(msg.sender), payable(address(0)), price, false);


        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(itemId, nftAddress, tokenId, msg.sender, address(0), price, false);

    }

    //sale function
    function createSale(address nftAddress, uint256 itemId) public payable nonReentrant{

        uint price = idMarketItem[itemId].price;
        uint tokenId = idMarketItem[itemId].tokenId;

        require(msg.value == price, "Asking price must be fulfilled.");
        
        idMarketItem[itemId].seller.transfer(msg.value);


            IERC721(nftAddress).transferFrom(address(this), msg.sender, tokenId);

            idMarketItem[itemId].owner = payable(msg.sender);

            idMarketItem[itemId].sold = true;
            _itemsSold.increment();

            payable(owner).transfer(listPrice); //commission
    }


    //get NFTs that haven't been sold
    function getUnsoldItems() public view returns (MarketItem[] memory){
        uint itemCount = _itemIds.current(); 
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        uint index= 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount);

        for(uint i = 0; i < itemCount; i++){
            if(idMarketItem[i+1].owner == address(0)){
                uint currentId = idMarketItem[i+1].itemId;
                MarketItem storage currentItem = idMarketItem[currentId];
                items[index] = currentItem;
                index +=1;
            }
        }
        return items;
    }
    



    //list caller-owned NFTs
    function ownedNFTs() public view returns (MarketItem[] memory){

        uint itemCount = _itemIds.current();
        uint count = 0;
        uint index = 0;

        for(uint i = 0; i < itemCount; i++){
            if(idMarketItem[i+1].owner == msg.sender){
                count +=1;

            }
        }

            MarketItem[] memory items = new MarketItem[](count);

            for(uint i = 0; i < itemCount; i++){
                if (idMarketItem[i+1].owner == msg.sender){
                    uint currentId = idMarketItem[i+1].itemId;
                    MarketItem storage currentItem = idMarketItem[currentId];
                    items[index] = currentItem;
                    index +=1;
                }
            }
            return items;


        }


}
