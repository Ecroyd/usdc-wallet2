require("dotenv").config();
const { ethers } = require("ethers");

// ✅ Use correct Alchemy Sepolia URL
const alchemyUrl = `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
const provider = new ethers.JsonRpcProvider(alchemyUrl);

// ✅ Correct Sepolia USDC Contract Address
const USDC_ADDRESS = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

// ✅ USDC ABI (balanceOf function)
const USDC_ABI = ["function balanceOf(address owner) view returns (uint256)"];

// ✅ Wallet address to check balance (from .env file)
const walletAddress = process.env.WALLET_ADDRESS;

// Create Contract Instance
const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, provider);

async function getUSDCBalance() {
  try {
    const balance = await usdcContract.balanceOf(walletAddress);
    console.log(`✅ USDC Balance: ${ethers.formatUnits(balance, 6)} USDC`);
  } catch (error) {
    console.error("❌ Error fetching USDC balance:", error);
  }
}

getUSDCBalance();
