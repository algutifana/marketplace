import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"
import Image from 'next/image'

import {
  marketAddress, nftAddress
} from '../config'

import Market from '../NFTMarket.json'
import NFT from '../NFT.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    // const web3Modal = new Web3Modal({
    //   network: "mainnet",
    //   cacheProvider: true,
    // })
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
      
    const marketContract = new ethers.Contract(marketAddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftAddress, NFT.abi, provider)
    const data = await marketContract.ownedNFTs()
    
    const items = await Promise.all(data.map(async i => {
    const tokenUri = await tokenContract.tokenURI(i.tokenId)
    const meta = await axios.get(tokenUri)
    let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
    let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name
      }
      return item
    }))

    setNfts(items)
    setLoadingState('loaded') 
  }


  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs owned.</h1>)

  return (
    <div className="flex justify-left">
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <Image
                            src={nft.image}
                            alt="NFT"
                            className="rounded"
                            width={350}
                            height={500} 
                            // blurDataURL="data:..." automatically provided
                            // placeholder="blur" // Optional blur-up while loading
                          />
                <div className="p-4 bg-slate-400">
                <p style = {{textAlign: 'center'}} className="text-2xl font-bold text-black">{nft.name} </p>
                  <p style = {{textAlign: 'center'}}className="text-2xl text-black">Bought for {nft.price} ETH</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}