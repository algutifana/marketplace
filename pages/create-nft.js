import {useState} from 'react'
import {ethers} from 'ethers'
import {create as ipfsHttpClient} from 'ipfs-http-client'
import {useRouter} from 'next/router'
import Web3Modal from 'web3modal'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json';
import Market from '../artifacts/contracts/NFTMarket.sol/NFTMarket.json';
import Image from 'next/image'

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');

import{
    nftAddress,marketAddress

} from '../config';

import { EtherscanProvider } from '@ethersproject/providers';
import { TransactionDescription } from 'ethers/lib/utils';




export default function CreateItem(){
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({price: '', name: '', desc: ''})
    const router = useRouter();

    async function onChange(e) {
        const file = e.target.files[0]
        try{
            const added = await client.add(
                file,
                {
                    progress: (prog) => console.log(`received: ${prog}`)
                }
            )

            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setFileUrl(url);
        }catch(e) {
            console.log(`Error uploading file: `, e)
        }


    }

    //upload nft to ipfs
    async function createItem(){
        const {name, desc, price} = formInput;
        if(!name || !desc || !price || !fileUrl) {
            return
        }
        
        const data = JSON.stringify({
            name, desc, image: fileUrl
        });
        try{
            const added = await client.add(data)
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            createSale(url)
        } catch(error){
            console.log(`Error uploading file. `, error)
        }
    }

    async function createSale(url){
        const web3Modal = new Web3Modal();
        const connection = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);

        const signer = provider.getSigner();
        let contract = new ethers.Contract(nftAddress, NFT.abi, signer);
        let transaction = await contract.createToken(url);
        let tx = await transaction.wait()
        console.log('Transaction:',tx)
        console.log('Tx events: ',tx.events[0])

        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')

        contract = new ethers.Contract(marketAddress, Market.abi, signer);



        let listPrice = await contract.getlistPrice()

        listPrice = listPrice.toString();

        transaction = await contract.createMarketItem(
            nftAddress, tokenId, price, { value: listPrice }
        )

        await transaction.wait();
        router.push('/');
        
        }
        
        return (
            <div className = "flex justify-center">
                <div className = "w-1/2 flex flex-col pb-12">

                    <input
                        placeholder = "NFT Name"
                        className = "mt-8 border roudned p-4"
                        onChange={e => updateFormInput({...formInput, name: e.target.value})}
                    />
                    <textarea
                        placeholder = "NFT Desc"
                        className = "mt-2 border rounded p-4"
                        onChange={e => updateFormInput({...formInput, desc: e.target.value})}
                    />
                    <input
                        placeholder = "NFT Price (in ETH)"
                        className = "mt-8 border roudned p-4"
                        type = "number"
                        onChange={e => updateFormInput({...formInput, price: e.target.value})}
                    />

                    <input
                        type = "file"
                        name = "Asset" 
                        className = "my-4"
                        onChange = {onChange}
                    
                    />

                    {
                        fileUrl && (
                            <Image src = {fileUrl} alt = "Pic" className = "rounded mt-4" width = {500} height = {500}
                            />
                        )
                    }

                    <button onClick = {createItem} 
                    className = "font-bold mt-4 rounded p-4 shadow-lg btn"
                    >Create NFT!</button>
                </div>
            </div>
        )

}



