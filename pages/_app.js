import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <nav className = "border-b p-6">
      
      <div className = "flex mt-4"></div>


      
      <a className = "mr-4 text-4xl text-thelinks">(Portfolio) NFT Marketplace</a>
      

      <Link href = "/">
      <a className = "mr-4 text-thelinks">Home</a>
      </Link>

      <Link href = "/create-nft">
      <a className = "mr-6 text-thelinks">Create an NFT</a>
      </Link>

      <Link href = "/my-nfts">
      <a className = "mr-6 text-thelinks">Owned NFTs</a>
      </Link>
    
      </nav>

      <Component {...pageProps} />
    
    </div>
  
  )
}

export default MyApp
