const hre = require("hardhat");
const { ethers } = require("hardhat"); // Import ethers

async function main() {
    // Get the current timestamp in seconds
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);

    // Set the unlock time to 1 hour (3600 seconds) in the future
    const unlockTime = currentTimestampInSeconds + 3600;

    console.log("Deploying contract with unlock time:", unlockTime);

    // Get the contract factory
    const Lock = await hre.ethers.getContractFactory("Lock");
    console.log("Contract factory loaded");

    // Deploy the contract (without sending ETH)
    console.log("Deploying contract...");
    const lock = await Lock.deploy(unlockTime);
    console.log("Contract deployment completed");

    // Log the transaction hash
    console.log("Contract deployed, transaction hash:", lock.deployTransaction.hash);

    // Wait for the deployment transaction to be mined
    console.log("Waiting for deployment confirmation...");
    await lock.deployTransaction.wait();
    console.log("Contract deployment confirmed");

    console.log("Lock contract deployed to:", lock.address);
    console.log("Unlock time:", unlockTime);
}

main().catch((error) => {
    console.error("Error deploying contract:", error);
    process.exitCode = 1;
});