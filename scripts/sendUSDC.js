require("dotenv").config(); // Load environment variables
const { ethers } = require("ethers");

// Alchemy provider
const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

// Wallet signer
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
console.log("Sender address:", wallet.address);

// USDC contract address (Sepolia)
const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";

// USDC ABI (includes transfer and balanceOf functions)
const usdcAbi = [
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  }
];

// Create USDC contract instance
const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, wallet);

// Set receiver address and amount to send (0.001 USDC = 1000 microUSDC)
const receiver = "0x6418A1F00970D87eA6b16c6042c12c5C8cDC32a2"; // Change this to your test address!
const amount = ethers.parseUnits("0.001", 6); // USDC has 6 decimals

async function sendUSDC() {
  try {
    console.log(`Sending ${ethers.formatUnits(amount, 6)} USDC to ${receiver}...`);

    // Check sender's USDC balance before sending
    const senderBalance = await usdcContract.balanceOf(wallet.address);
    console.log("Sender USDC balance before:", ethers.formatUnits(senderBalance, 6));

    // Check receiver's USDC balance before sending
    const receiverBalance = await usdcContract.balanceOf(receiver);
    console.log("Receiver USDC balance before:", ethers.formatUnits(receiverBalance, 6));

    // Send USDC
    const tx = await usdcContract.transfer(receiver, amount);
    console.log("Transaction sent! Hash:", tx.hash);

    // Wait for transaction confirmation
    await tx.wait();
    console.log("Transaction confirmed!");

    // Check sender's USDC balance after sending
    const senderBalanceAfter = await usdcContract.balanceOf(wallet.address);
    console.log("Sender USDC balance after:", ethers.formatUnits(senderBalanceAfter, 6));

    // Check receiver's USDC balance after sending
    const receiverBalanceAfter = await usdcContract.balanceOf(receiver);
    console.log("Receiver USDC balance after:", ethers.formatUnits(receiverBalanceAfter, 6));

  } catch (error) {
    console.error("Error sending USDC:", error);
  }
}

// Execute function
sendUSDC();