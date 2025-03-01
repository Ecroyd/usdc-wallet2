import { useState, useEffect } from "react";
import { ethers } from "ethers";

// Sepolia USDC Contract Details
const usdcAddress = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"; // Sepolia USDC
const usdcAbi = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "success", "type": "bool" }],
    "type": "function"
  }
];

export default function USDCWallet() {
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [message, setMessage] = useState("");
  const visibleName = process.env.NEXT_PUBLIC_VISIBLE_NAME;

  useEffect(() => {
    if (connectedAddress) {
      fetchBalance(connectedAddress);
    }
  }, [connectedAddress]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = async (accounts) => {
    if (accounts.length > 0) {
      setConnectedAddress(accounts[0]);
      fetchBalance(accounts[0]);
    } else {
      setConnectedAddress(null);
      setBalance(null);
    }
  };

  async function fetchBalance(address) {
    try {
      setMessage("Fetching balance...");
      const provider = new ethers.JsonRpcProvider(`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`);
      const contract = new ethers.Contract(usdcAddress, usdcAbi, provider);
      const balance = await contract.balanceOf(address);
      setBalance(ethers.formatUnits(balance, 6));
      setMessage("");
    } catch (error) {
      console.error("Error fetching balance:", error);
      setMessage("Failed to fetch balance. Please check your internet connection and try again.");
    }
  }

  async function connectMetaMask() {
    try {
      setMessage("Connecting wallet...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length === 0) {
        setMessage("No accounts found. Please connect your wallet.");
        return;
      }
      setConnectedAddress(accounts[0]);
      fetchBalance(accounts[0]);
      setMessage("Wallet connected successfully.");
    } catch (error) {
      console.error("Failed to connect MetaMask", error);
      setMessage("Failed to connect MetaMask. Please try again.");
    }
  }

  function disconnectMetaMask() {
    setConnectedAddress(null);
    setBalance(null);
    setMessage("Wallet disconnected.");
  }

  function isValidAddress(address) {
    return ethers.isAddress(address);
  }

  async function sendUSDC() {
    if (!recipient || !amount) {
      setMessage("Enter recipient and amount.");
      return;
    }
    if (!isValidAddress(recipient)) {
      setMessage("Invalid recipient address.");
      return;
    }
    setLoading(true);
    setMessage("Sending USDC...");
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(usdcAddress, usdcAbi, signer);
      const tx = await contract.transfer(recipient, ethers.parseUnits(amount, 6));
      await tx.wait();
      setMessage("Transaction Successful!");
      fetchBalance(connectedAddress);
    } catch (error) {
      console.error("Transaction failed", error);
      setMessage("Transaction failed. Please check your balance and try again.");
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-4 max-w-md text-center">
        <div className="text-center mb-4">
          <img
            src="https://static.vecteezy.com/system/resources/previews/043/347/347/non_2x/a-cute-dinosaur-cartoon-tyrannosaurus-rex-vector.jpg"
            alt="Alfie the T-Rex"
            className="w-55 h-50 mx-auto rounded-full"
            style={{ width: '550px', height: '500px' }}
          />
          <h2 className="text-xl font-bold mt-2">{visibleName}</h2>
          <p className="text-sm text-gray-600">Your friendly cash guardian!</p>
        </div>

        <h1 className="text-xl font-bold mb-4">USDC Wallet (Sepolia Testnet)</h1>
        {message && <p className="text-red-500 mb-2">{message}</p>}

        {!connectedAddress ? (
          <button className="bg-blue-500 text-white p-2 w-full hover:bg-blue-600 mb-4" onClick={connectMetaMask}>
            Connect MetaMask
          </button>
        ) : (
          <>
            <p className="mb-4 text-gray-700">Connected Address: <span className="font-mono">{connectedAddress}</span></p>
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Your USDC Balance</h2>
              {balance !== null ? (
                <p className="text-green-600">{balance} USDC</p>
              ) : (
                <p className="text-gray-500">Loading balance...</p>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-2">Send USDC</h2>
              <input className="border p-2 w-full mb-2" placeholder="Enter Recipient Address" value={recipient} onChange={e => setRecipient(e.target.value)} />
              <input className="border p-2 w-full mb-2" placeholder="Enter Amount (e.g., 10.0)" value={amount} onChange={e => setAmount(e.target.value)} />
              <button className="bg-green-500 text-white p-2 w-full hover:bg-green-600" onClick={sendUSDC} disabled={loading}>
                {loading ? "Sending..." : "Send USDC"}
              </button>
            </div>
            <button className="bg-red-500 text-white p-2 w-full hover:bg-red-600 mt-4" onClick={disconnectMetaMask}>
              Disconnect Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
