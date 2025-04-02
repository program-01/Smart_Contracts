const { ethers } = require("hardhat");

async function main() {
  const IdentityVerifier = await ethers.getContractFactory("IdentityVerifier");
  const contract = await IdentityVerifier.deploy(); // Already deployed in v6
  console.log("✅ Contract deployed to:", contract.target); // Use `target` instead of `address` in ethers v6
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});