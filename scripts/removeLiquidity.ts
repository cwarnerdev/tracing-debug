// scripts/addLiquidity.ts

import { ethers, network } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
    // 1) Determine the network (e.g. "localhost", "sepolia", "hardhat", etc.)
    const networkName = network.name;
    console.log("Network:", networkName);

    // 2) Build path to the deployment file
    const deploymentDir = path.join(__dirname, "../deployments");
    const deploymentFile = path.join(deploymentDir, `${networkName}.json`);

    // 3) Load deployment data
    if (!fs.existsSync(deploymentFile)) {
        throw new Error(
            `No deployment file found at: ${deploymentFile}.\n` +
            `Please deploy first on '${networkName}'!`
        );
    }
    const data = JSON.parse(fs.readFileSync(deploymentFile, "utf-8"));

    // 4) Extract addresses from the file (adjust keys if needed)
    const routerAddress = data.LBRouter;
    const wIOTAAddress = data.wIOTA;
    const mockERC20Address = data.MockERC20;
    if (!routerAddress || !wIOTAAddress || !mockERC20Address) {
        throw new Error(
            `Missing LBRouter, wIOTA, or MockERC20 address in ${networkName}.json`
        );
    }

    // 5) Get our deployer signer
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);

    // 6) Attach to the LBRouter contract
    const router = await ethers.getContractAt("LBRouter", routerAddress, deployer);

    // 7) Build the liquidity parameters object
    //    NOTE: The struct fields must match your Solidity definition exactly
    const deadline = Math.floor(Date.now() / 1000) + 600; // 10 minutes from now


    let params = [
        wIOTAAddress,
        mockERC20Address,
        "20",
        "1000000000000000",
        "0",
        "0",
        "0",
        "8373869",
        "2",
        [
            "211",
            "212",
            "213",
            "214",
            "215",
            "216",
            "217",
            "218",
            "219",
            "220",
            "221",
            "222",
            "223",
            "224",
            "225",
            "226",
            "227",
            "228",
            "229",
            "230",
            "231",
            "232",
            "233",
            "234",
            "235",
            "236",
            "237",
            "238",
            "239",
            "240",
            "241",
            "242",
            "243",
            "244",
            "245",
            "246",
            "247",
            "248",
            "249",
            "250"
        ],
        [
            "40917156964249510",
            "40863389354430124",
            "40702510076995390",
            "40435784232028364",
            "40065301901654490",
            "39593950877424840",
            "39025379178877044",
            "38363948043726684",
            "37614676236949470",
            "36783176673208530",
            "35875586471470120",
            "34898491659683200",
            "33858847819221640",
            "32763898002292540",
            "31621089270348480",
            "30437989188102293",
            "29222203567147580",
            "27981296687220502",
            "26722715134177955",
            "25453716284702490",
            "24181302341872362",
            "22912160686652220",
            "21652611161848770",
            "20408560750990970",
            "19185465958749260",
            "17988303045571670",
            "16821546120614733",
            "15689152956887090",
            "14594558263515672",
            "13540674034454171",
            "12529896492566060",
            "11564119064114232",
            "10644750752057586",
            "9772739227481888",
            "8948597926805388",
            "8172436427500268",
            "7443993375984740",
            "6762671256772893",
            "6127572320367058",
            "5537535026993647"
        ],
        [
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0",
            "0"
        ],
        deployer.address,
        deployer.address,
        "1731442785"
    ]
    const liquidityParams = {
        tokenX: params[0],
        tokenY: params[1],
        binStep: params[2],
        amountX: params[3],
        amountY: params[4],
        amountXMin: params[5],
        amountYMin: params[6],
        activeIdDesired: params[7],
        idSlippage: params[8],
        deltaIds: params[9],          // int256[]
        distributionX: params[10],    // uint256[]
        distributionY: params[11],    // uint256[]
        to: params[12],
        refundTo: params[13],
        deadline: deadline
    };
// 8) Call addLiquidityNATIVE, sending 1.0 native tokens (e.g. 1 Ether on Ethereum)
    console.log("Calling addLiquidityNATIVE...");
    const tx = await router.removeLiquidityNATIVE(
        mockERC20Address,
        20,
        0,
        1,
        [8374080],
        [],
        deployer.address,
        deadline
        );
    await tx.wait();

    console.log("Successfully removed liquidity with native token.");
}

main().catch((error) => {
    console.error("Error:", error);
    process.exitCode = 1;
});