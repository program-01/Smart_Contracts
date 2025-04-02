require("dotenv").config(); // ✅ This should be at the top
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20" }, // For IdentityVerifier + OpenZeppelin
      { version: "0.8.28" }, // For Lock.sol
    ]
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.ALCHEMY_API_KEY,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
