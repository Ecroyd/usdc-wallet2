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
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
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
      const provider = new ethers.JsonRpcProvider(
        `https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`
      );
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
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);

    if (isIOS) {
      if (!window.ethereum) {
        setMessage("Opening in MetaMask...");
        setTimeout(() => {
          window.location.href = "https://metamask.app.link/dapp/" + window.location.href;
        }, 2000);
        return;
      }
    }

    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
      return;
    }

    try {
      setMessage("Connecting wallet...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);

      if (!accounts.length) {
        setMessage("No accounts found. Please connect your wallet.");
        return;
      }

      setConnectedAddress(accounts[0]);
      fetchBalance(accounts[0]);
      setMessage("Wallet connected successfully.");
    } catch (error) {
      console.error("MetaMask connection failed", error);
      if (isIOS) {
        setMessage("If you're in the MetaMask browser, tap the wallet icon in the bottom menu to connect.");
      } else {
        setMessage("Failed to connect MetaMask. Please ensure pop-ups are allowed.");
      }
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
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="container text-center p-6 bg-white shadow-lg rounded-lg max-w-md">
        <h1 className="text-xl font-bold">USDC Wallet</h1>
        <p className="text-sm text-gray-600">Manage your USDC on Sepolia Testnet</p>

        <div className="my-4">
          <img
            src="https://static.vecteezy.com/system/resources/previews/043/347/347/non_2x/a-cute-dinosaur-cartoon-tyrannosaurus-rex-vector.jpg"
            alt="Alfie the T-Rex"
            className="rounded-lg mx-auto w-full max-w-xs"
          />
        </div>

        {!connectedAddress ? (
          <>
            <button className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full hover:bg-blue-600" onClick={connectMetaMask}>
              Connect MetaMask
            </button>
            {navigator.userAgent.includes("iPhone") && (
              <button
                className="bg-gray-500 text-white py-2 px-4 rounded-lg w-full mt-2 hover:bg-gray-600"
                onClick={() => window.location.href = "https://metamask.app.link/dapp/" + window.location.href}
              >
                Open in MetaMask
              </button>
            )}
          </>
        ) : (
          <>
            <p className="text-gray-700 my-2">Connected Address: <span className="font-mono">{connectedAddress}</span></p>
            <h2 className="text-lg font-semibold">Your USDC Balance</h2>
            <p className="text-green-600">{balance !== null ? `${balance} USDC` : "Loading..."}</p>

            <input className="border p-2 w-full mt-2" placeholder="Recipient Address" value={recipient} onChange={e => setRecipient(e.target.value)} />
            <input className="border p-2 w-full mt-2" placeholder="Amount (e.g., 10.0)" value={amount} onChange={e => setAmount(e.target.value)} />
            <button className="bg-green-500 text-white py-2 px-4 w-full rounded-lg mt-2 hover:bg-green-600" onClick={sendUSDC} disabled={loading}>
              {loading ? "Sending..." : "Send USDC"}
            </button>

            <button className="bg-red-500 text-white py-2 px-4 w-full rounded-lg mt-4 hover:bg-red-600" onClick={disconnectMetaMask}>
              Disconnect Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
