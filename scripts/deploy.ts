// scripts/deploy.ts

import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

interface FactoryPreset {
    binStep: number;
    baseFactor: number;
    filterPeriod: number;
    decayPeriod: number;
    reductionFactor: number;
    variableFeeControl: number;
    protocolShare: number;
    maxVolatilityAccumulated: number;
    sampleLifetime: number;
    isOpen: boolean;
}

const BipsConfig = {
    getPresetList(): number[] {
        return [1, 2, 5, 10, 15, 20, 25];
    },
    getPreset(bp: number): FactoryPreset {
        switch (bp) {
            case 1:
                return {
                    binStep: 1,
                    baseFactor: 20000,
                    filterPeriod: 10,
                    decayPeriod: 120,
                    reductionFactor: 5000,
                    variableFeeControl: 2000000,
                    protocolShare: 0,
                    maxVolatilityAccumulated: 100000,
                    sampleLifetime: 120,
                    isOpen: false,
                };
            case 2:
                return {
                    binStep: 2,
                    baseFactor: 15000,
                    filterPeriod: 10,
                    decayPeriod: 120,
                    reductionFactor: 5000,
                    variableFeeControl: 500000,
                    protocolShare: 0,
                    maxVolatilityAccumulated: 250000,
                    sampleLifetime: 120,
                    isOpen: false,
                };
            case 5:
                return {
                    binStep: 5,
                    baseFactor: 8000,
                    filterPeriod: 30,
                    decayPeriod: 600,
                    reductionFactor: 5000,
                    variableFeeControl: 120000,
                    protocolShare: 0,
                    maxVolatilityAccumulated: 300000,
                    sampleLifetime: 120,
                    isOpen: false,
                };
            case 10:
                return {
                    binStep: 10,
                    baseFactor: 10000,
                    filterPeriod: 30,
                    decayPeriod: 600,
                    reductionFactor: 5000,
                    variableFeeControl: 40000,
                    protocolShare: 0,
                    maxVolatilityAccumulated: 350000,
                    sampleLifetime: 120,
                    isOpen: false,
                };
            case 15:
                return {
                    binStep: 15,
                    baseFactor: 10000,
                    filterPeriod: 30,
                    decayPeriod: 600,
                    reductionFactor: 5000,
                    variableFeeControl: 30000,
                    protocolShare: 0,
                    maxVolatilityAccumulated: 350000,
                    sampleLifetime: 120,
                    isOpen: false,
                };
            case 20:
                return {
                    binStep: 20,
                    baseFactor: 10000,
                    filterPeriod: 30,
                    decayPeriod: 600,
                    reductionFactor: 5000,
                    variableFeeControl: 20000,
                    protocolShare: 0,
                    maxVolatilityAccumulated: 350000,
                    sampleLifetime: 120,
                    isOpen: false,
                };
            case 25:
                return {
                    binStep: 25,
                    baseFactor: 10000,
                    filterPeriod: 30,
                    decayPeriod: 600,
                    reductionFactor: 5000,
                    variableFeeControl: 15000,
                    protocolShare: 0,
                    maxVolatilityAccumulated: 350000,
                    sampleLifetime: 120,
                    isOpen: false,
                };
            default:
                throw new Error(`No preset for bin step: ${bp}`);
        }
    },
};

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // Check if current network is "hardhat". If so, skip persisting data
    const isLocalHardhat = network.name === "hardhat";

    // Prepare the location for your deployment file
    const networkName = network.name; // e.g., "hardhat", "localhost", "sepolia"
    const deploymentDir = path.join(__dirname, "../deployments");
    const deploymentFile = path.join(deploymentDir, `${networkName}.json`);

    // We'll track old + new addresses in this record
    let existingData: Record<string, string> = {};
    if (!isLocalHardhat) {
        // If not using the ephemeral Hardhat network, ensure the folder exists
        if (!fs.existsSync(deploymentDir)) {
            fs.mkdirSync(deploymentDir);
        }
        // Load existing data if present
        if (fs.existsSync(deploymentFile)) {
            existingData = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));
        }
    }

    // We'll populate all new or reused addresses in "results"
    const results: Record<string, string> = { ...existingData };

    // You can set up variables as needed:
    const feeRecipient = deployer.address;
    const initialOwner = deployer.address;
    const flashLoanFee = 5_000_000_000_000n;

    // 1) wIOTA
    let wIOTAAddress = results.wIOTA; // we read from file if present
    if (!wIOTAAddress) {
        console.log("No wIOTA token in file (or using hardhat). Deploying new wIOTA...");
        const wIOTAFactory = await ethers.getContractFactory("wIOTA");
        const wIOTAContract = await wIOTAFactory.deploy();
        await wIOTAContract.waitForDeployment();

        wIOTAAddress = await wIOTAContract.getAddress();
        console.log("Deployed wIOTA at:", wIOTAAddress);
        results.wIOTA = wIOTAAddress;
    } else {
        console.log("Using existing wIOTA token address:", wIOTAAddress);
    }

    // 2) MockERC20
    let mockERC20Address = results.MockERC20;
    if (!mockERC20Address) {
        console.log("No MockERC20 in file (or using hardhat). Deploying new MockERC20...");
        const MockERC20Factory = await ethers.getContractFactory("MockERC20");
        const MockERC20Contract = await MockERC20Factory.deploy("MockERC20", "mERC20", 18);
        await MockERC20Contract.waitForDeployment();

        mockERC20Address = await MockERC20Contract.getAddress();
        console.log("Deployed MockERC20 at:", mockERC20Address);
        results.MockERC20 = mockERC20Address;
    } else {
        console.log("Using existing MockERC20 token address:", mockERC20Address);
    }

    // 3) LBFactory
    const LBFactoryFactory = await ethers.getContractFactory("LBFactory");
    const LBFactory = await LBFactoryFactory.deploy(
        feeRecipient,
        initialOwner,
        flashLoanFee
    );
    await LBFactory.waitForDeployment();

    const lbFactoryAddress = await LBFactory.getAddress();
    console.log("LBFactory deployed to:", lbFactoryAddress);
    results.LBFactory = lbFactoryAddress;

    // 4) LBPair
    const LBPairFactory = await ethers.getContractFactory("LBPair");
    const LBPair = await LBPairFactory.deploy(lbFactoryAddress);
    await LBPair.waitForDeployment();

    const lbPairAddress = await LBPair.getAddress();
    console.log("LBPair deployed to:", lbPairAddress);
    results.LBPair = lbPairAddress;

    // 5) LBRouter
    const LBRouterFactory = await ethers.getContractFactory("LBRouter");
    const LBRouter = await LBRouterFactory.deploy(
        lbFactoryAddress,
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        wIOTAAddress
    );
    await LBRouter.waitForDeployment();

    const lbRouterAddress = await LBRouter.getAddress();
    console.log("LBRouter deployed to:", lbRouterAddress);
    results.LBRouter = lbRouterAddress;

    // 6) LBQuoter
    const LBQuoterFactory = await ethers.getContractFactory("LBQuoter");
    const LBQuoter = await LBQuoterFactory.deploy(
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        lbFactoryAddress,
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        lbRouterAddress
    );
    await LBQuoter.waitForDeployment();

    const lbQuoterAddress = await LBQuoter.getAddress();
    console.log("LBQuoter deployed to:", lbQuoterAddress);
    results.LBQuoter = lbQuoterAddress;

    // 7) Set LBPair Implementation
    let tx = await LBFactory.setLBPairImplementation(lbPairAddress);
    await tx.wait();
    console.log("LBPair implementation set on LBFactory");

    // 8) Set all Bips presets
  //  const presetList = BipsConfig.getPresetList();
   // for (const bp of presetList) {
        const preset = BipsConfig.getPreset(20);
        tx = await LBFactory.setPreset(
            preset.binStep,
            preset.baseFactor,
            preset.filterPeriod,
            preset.decayPeriod,
            preset.reductionFactor,
            preset.variableFeeControl,
            preset.protocolShare,
            preset.maxVolatilityAccumulated,
            preset.isOpen
        );
        await tx.wait();
        console.log(`Preset set for binStep: ${20}`);
   // }

    // 9) Whitelist the ERC20
    let whitelistTxn = await LBFactory.addQuoteAsset(mockERC20Address);
    await whitelistTxn.wait();
    console.log("MockERC20 whitelisted on LBFactory");

    // 10) Create LBPair
    let pairCreateTxn = await LBFactory.createLBPair(
        wIOTAAddress,
        mockERC20Address,
        8373869,
        20
    );
    await pairCreateTxn.wait();
    console.log("LBPair created on LBFactory");

    // If this is not an ephemeral Hardhat network, write or update the deployment file
    if (!isLocalHardhat) {
        fs.writeFileSync(deploymentFile, JSON.stringify(results, null, 2), "utf-8");
        console.log(`Deployment info saved to ${deploymentFile}`);
    } else {
        console.log("Skipping saving deployment info because we're on the Hardhat network.");
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
