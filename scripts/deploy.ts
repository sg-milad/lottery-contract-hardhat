import hre from "hardhat";

async function main() {
  const Lottery = await hre.viem.deployContract("Lottery", undefined)
  console.log("gas", Lottery.estimateGas);
  console.log("manager", await Lottery.read.manager());

  console.log(`lottery deployed to ${Lottery.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
