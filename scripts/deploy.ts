import hre from "hardhat";

async function main() {
  const LotteryManager = await hre.viem.deployContract("LotteryManager");
  console.log("manager", await LotteryManager.read.manager());

  console.log(`lottery manager contract address: ${LotteryManager.address}`);
  console.log(`manager address: ${await LotteryManager.read.manager()}`);
  console.log(
    `lottery contract address: ${await LotteryManager.read.lotteryAddress()}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
