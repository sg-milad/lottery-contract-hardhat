import hre, { network } from "hardhat";

async function main() {
    const LotteryManager = await hre.viem.deployContract("LotteryManager");
    console.log("manager", await LotteryManager.read.manager());

    if (network.name === "hardhat" || network.name === "localhost") {
        console.log("Local network detected! Deploying mocks...");

        const mock = await hre.viem.deployContract("VRFCoordinatorV2Mock", ["100000000000000000", "1000000000"]);

        console.log("Mocks Deployed!");

        console.log("----------------------------------");
        console.log("mock contract address:", mock.address);
    }
    console.log(`lottery manager contract address: ${LotteryManager.address}`);
    console.log(`manager address: ${await LotteryManager.read.manager()}`);
    console.log(`lottery contract address: ${await LotteryManager.read.lotteryAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
