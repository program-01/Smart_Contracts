import { JsonRpcProvider, Contract } from "ethers";
import contractABI from "./contract/IdentityVerifier.json";

// Paste local deployed contract address here:
const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // Replaced this with our deployed address

// Point the provider to your local Hardhat node
const provider = new JsonRpcProvider("http://127.0.0.1:8545");

export async function connectWallet() {
  // Use the first local Hardhat account as the signer
  const signer = await provider.getSigner(4);
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

export async function getWalletInfo(signer) {
    const address = await signer.getAddress();
    const balanceBigInt = await signer.provider.getBalance(address);
    const balance = (Number(balanceBigInt) / 1e18).toFixed(4);
    return { address, balance };
  }

  export async function issueIdentity(userAddress, metadataURI) {
    const adminSigner = await provider.getSigner(0); // must be owner
    const contract = new Contract(contractAddress, contractABI.abi, adminSigner);
  
    console.log("Admin issuing identity to:", userAddress);
    console.log("With metadata URI:", metadataURI);
  
    const already = await contract.verifyIdentity(userAddress);
    if (already) {
      throw new Error("User is already verified.");
    }
  
    const tx = await contract.issueIdentity(userAddress, metadataURI);
    await tx.wait();
    return true;
  }

  export async function isUserVerified(address) {
    const signer = await connectWallet(); // or provider.getSigner(0)
    const contract = new Contract(contractAddress, contractABI.abi, signer);
    return await contract.verifyIdentity(address);
  }

