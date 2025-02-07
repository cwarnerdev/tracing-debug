// scripts/approveAndMint.ts

import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    // 1) Determine which network you’re on
    const networkName = network.name; // e.g. "localhost" or "sepolia" or "hardhat"
    console.log("Running approveAndMint on network:", networkName);

    // 2) Build the path to your deployments JSON file
    const deploymentFile = path.join(__dirname, "../deployments", `${networkName}.json`);

    // 3) Check if the file exists
    if (!fs.existsSync(deploymentFile)) {
        throw new Error(`No deployment file found at: ${deploymentFile}.\nPlease deploy first!`);
    }

    // 4) Read the JSON file
    const fileContents = fs.readFileSync(deploymentFile, "utf-8");
    const deploymentData = JSON.parse(fileContents);

    // 5) Extract addresses from the JSON
    // Adjust these keys if you named them differently in your deploy script
    const wIOTAAddress = deploymentData.wIOTA;
    const erc20Address = deploymentData.MockERC20;
    const routerAddress = deploymentData.LBRouter;

    if (!wIOTAAddress || !erc20Address || !routerAddress) {
        throw new Error(
            `Missing required addresses in ${networkName}.json. wIOTA: ${wIOTAAddress}, MockERC20: ${erc20Address}, LBRouter: ${routerAddress}`
        );
    }

    // 6) Use the first signer as your deployer/owner
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // 7) Attach to the MockERC20 contract
    const erc20 = await ethers.getContractAt("MockERC20", erc20Address, deployer);

    // 8) Mint tokens to yourself (assuming onlyOwner can call mint)
    const mintAmount = 2_000_000_000_000_000_000_000_000n; // 2 million MockERC20 (1e18 decimals)
    let tx = await erc20.mint(deployer.address, mintAmount);
    await tx.wait();
    console.log(`Minted ${mintAmount.toString()} MockERC20 tokens to ${deployer.address}`);

    // 9) Approve the router to spend an unlimited amount of this ERC20
    tx = await erc20.approve(routerAddress, ethers.MaxUint256);
    await tx.wait();
    console.log("Router approved to spend unlimited MockERC20 tokens.");

    // (Optional) If you want to wrap native tokens into wIOTA, uncomment below:
    //
    // const wIOTA = await ethers.getContractAt("wIOTA", wIOTAAddress, deployer);
    // console.log("Wrapping 1 native token into wIOTA...");
    // let depositTx = await wIOTA.deposit({ value: ethers.parseEther("1.0") });
    // await depositTx.wait();
    // console.log("Successfully wrapped 1 native token into wIOTA.");
    //
    // tx = await wIOTA.approve(routerAddress, ethers.MaxUint256);
    // await tx.wait();
    // console.log("Router approved to spend unlimited wIOTA tokens.");
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});
