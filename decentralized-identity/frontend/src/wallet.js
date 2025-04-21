import { JsonRpcProvider, Contract } from "ethers";
import { keccak256, toUtf8Bytes } from "ethers";
import contractABI from "./contract/IdentityVerifier.json";

const contractAddress = "0x68B1D87F95878fE05B998F19b66F4baba5De1aed"; 

const provider = new JsonRpcProvider("http://127.0.0.1:8545");

let signerIndex = 5; // Keeps track of the last used signer

export function resetSignerIndex() { // Resets from the beginning
  signerIndex = 0;
}

export function setSignerIndex(index) {
  signerIndex = index;
}

export async function getNextSigner() {
  const accounts = await provider.listAccounts();
  if (signerIndex >= accounts.length) {
    throw new Error("No more available signers.");
  }
  const signer = await provider.getSigner(signerIndex);
  signerIndex++;
  return signer;
}

export async function connectWallet() {
  const signer = await getNextSigner();
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

// Fetching db.json from the public directory
export const checkPresence = async (address) => {
  try {
    const res = await fetch("/db.json");  // Fetching from the public folder
    const data = await res.json();
    const user = data.requests.find(req => req.address === address);
    return user ? !!user.address : false; // Return true if address is found
  } catch (err) {
    console.error("Error fetching db.json:", err);
    return false; // Return false in case of an error
  }
};


export async function getWalletInfo(signer) {
    const address = await signer.getAddress();
    const balanceBigInt = await signer.provider.getBalance(address);
    const balance = (Number(balanceBigInt) / 1e18).toFixed(4);
    return { address, balance };
  }

  export async function issueIdentity(userAddress, metadataURI) {
    const adminSigner = await provider.getSigner(); 
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
    const signer = await connectWallet(); 
    const contract = new Contract(contractAddress, contractABI.abi, signer);
    return await contract.verifyIdentity(address);
  }

  export async function submitMetadata(metadataURI) {
    const signer = await connectWallet();
    const contract = new Contract(contractAddress, contractABI.abi, signer);
    const tx = await contract.submitMetadata(metadataURI);
    await tx.wait();
    return true;
  }


export async function submitMetadataHash(metadata) {
    const signer = await connectWallet();
    const contract = new Contract(contractAddress, contractABI.abi, signer);
  
    const metadataString = JSON.stringify(metadata);
    const hash = keccak256(toUtf8Bytes(metadataString)); 
  
    const tx = await contract.submitMetadataHash(hash);

    await tx.wait();
    return hash;
  }
  
  export async function getMetadataHash(address) {
    const signer = await connectWallet();
    const contract = new Contract(contractAddress, contractABI.abi, signer);
    console.log("Contract address:", contractAddress);
    console.log("Contract ABI:", contractABI.abi); 

    return await contract.getMetadataHash(address);
  }

