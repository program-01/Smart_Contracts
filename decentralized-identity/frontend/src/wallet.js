import { JsonRpcProvider, Contract } from "ethers";
import contractABI from "./contract/IdentityVerifier.json";

// Paste your local deployed contract address here:
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replaced this with our deployed address

// Point the provider to your local Hardhat node
const provider = new JsonRpcProvider("http://127.0.0.1:8545");

export async function connectWallet() {
  // Use the first local Hardhat account as the signer
  const signer = await provider.getSigner(0);
  return signer;
}

export async function checkVerification() {
  const signer = await connectWallet();
  const userAddress = await signer.getAddress();
  const contract = new Contract(contractAddress, contractABI.abi, signer);
  const isVerified = await contract.verifyIdentity(userAddress);
  console.log("Wallet:", userAddress);
  console.log("Verified:", isVerified);
  return isVerified;
}