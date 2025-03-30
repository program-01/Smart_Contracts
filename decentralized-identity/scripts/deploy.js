const { ethers } = require("hardhat");

async function main() {
  const IdentityVerifier = await ethers.getContractFactory("IdentityVerifier");
  const contract = await IdentityVerifier.deploy();
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
