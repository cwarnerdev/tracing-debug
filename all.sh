#/bin/sh
npx hardhat run scripts/deploy.ts --network local_wasp
npx hardhat run scripts/mint.ts --network local_wasp
npx hardhat run scripts/addLiquidity.ts --network local_wasp
