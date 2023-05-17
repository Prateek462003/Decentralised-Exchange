
const hre = require("hardhat");
const {CRYPTO_DEVS_NFT_CONTRACT_ADDRESS} = require("../constants/index");
const {ethers} = require("hardhat");

async function main() {
  const exchangeContract = await ethers.getContractFactory("Exchange");
  const deployedContract = await exchangeContract.deploy(CRYPTO_DEVS_NFT_CONTRACT_ADDRESS);
  await deployedContract.deployed();
  console.log("Contract Deployed At:", deployedContract.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
