import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {ethers} from 'ethers';
import {useEffect, useState} from "react";
import axios from 'axios';
import Web3Modal from 'web3modal';
import {nftAddress, marketAddress} from '../config';
import NFT from '../NFT.json';
import Market from '../NFTMarket.json';

export default function Home() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');

  useEffect(()=>{
    loadNFTs();

  },
  []
  );
  async function loadNFTs(){
    const provider = new ethers.providers.JsonRpcProvider('https://matic-mumbai.chainstacklabs.com');
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider);
    const marketContract = new ethers.Contract(marketAddress, Market.abi, provider);

    const data = await marketContract.getUnsoldItems();

    const items = await Promise.all(data.map(async i => {
    const tokenUri = await tokenContract.tokenURI(i.tokenId);
    const meta = await axios.get(tokenUri);
    let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
    let item = {
      price,
      tokenId: i.tokenId.toNumber(),
      seller: i.seller,
      owner: i.owner,
      image: meta.data.image,
      name: meta.data.name,
      desc: meta.data.desc
    }
    return item;
    }));

    setNfts(items);

    setLoadingState('loaded');
    
  }

  async function purchaseNFT(nft){
    //connect wallet
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);

    //sign with wallet
    const signer = provider.getSigner();
    const contract = new ethers.Contract(marketAddress, Market.abi, signer);

    //set price of sale
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether');

    //nft transaction driver code
    const transaction = await contract.createSale(nftAddress, nft.tokenId, {
      value: price
    });
    await transaction.wait();

    loadNFTs()

  }

  if(loadingState === 'loaded' && !nfts.length) return (
    <h1 className = "px-20 py-10 text-3xl">No NFTs found</h1>
  )

  return (
    <div className = "flex justify-left">
      <div className = "px-4" style = {{maxWidth: '1600px'}}>
        <div className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 ">
          {
            nfts.map((nft, i) =>(
              <div key = {i} className = "zoom border shadow rounded-xl overflow-hidden">
                <Image src = {nft.image} alt = "NFT Image" width = {300} height = {300}/>
                <div className = "p-4">
                  <p style = {{height: '50px', textAlign: 'center'}}className = "text-2xl text-thelinks">
                    {nft.name}
                  </p>
                  <div style = {{height: '20px', overflow: 'hidden'}}>
                    <p style = {{textAlign: 'center'}} className = "text-thelinks">{nft.desc}</p>
                  </div>
                </div>
                <div className = "p-4 bg-slate-400">
                  <p style = {{textAlign: 'center'}} className = "text-2xl mb-4 text-black">
                    {nft.price} ETH
                  </p>
                  <button className = "btn w-full  font-bold py-2 px-12 rounded"
                  onClick={() => purchaseNFT(nft)}>Purchase NFT</button>
              </div>
              </div>
            ))
          }

        </div>
    </div>
    </div>
    

    
  )
}
