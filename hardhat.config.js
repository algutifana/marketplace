require("@nomiclabs/hardhat-waffle");

const fs = require('fs')

const privateKey = fs.readFileSync('.secret').toString();
const projectId = '1a4c8e6d0da1413bb8e6d5b37becd5b7'

 
module.exports = {
  networks: {
  hardhat: {
    chainId: 1337
  },
  mumbai: {
    url:  `https://polygon-mumbai.infura.io/v3/${projectId}`,
    accounts: [privateKey]

  },
  mainnet: {
    url:  `https://polygon-mainnet.infura.io/v3/${projectId}`,
    accounts: [privateKey]

  },

  },
  solidity: "0.8.4",
};
