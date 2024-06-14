import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre, { viem } from "hardhat";
import { getAddress, parseEther, Address } from "viem";

describe("Lottery", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLotteryFixture() {
    // Contracts are deployed using the first signer/account by default
    const [manager, AccountOne, accountTwe] = await hre.viem.getWalletClients();

    const lotteryManager = await hre.viem.deployContract("LotteryManager");
    const lotteryAddress = await lotteryManager.read.lotteryAddress();

    const lottery = await hre.viem.getContractAt("Lottery", lotteryAddress);
    const publicClient = await hre.viem.getPublicClient();

    console.log("manager address", await lottery.read.manager());
    console.log("lottery address:", lotteryAddress);
    console.log("lottery manager address:", lotteryManager.address);

    return {
      lottery,
      manager,
      AccountOne,
      publicClient,
      accountTwe,
    };
  }

  describe("Deployment", async () => {
    it("Should set the right owner(manager)", async () => {
      const { lottery, manager } = await loadFixture(deployLotteryFixture);
      expect(await lottery.read.manager()).to.equal(
        getAddress(manager.account.address),
      );
    });
  });

  describe("enterPlayer", async () => {
    it("Should allow a player to enter the lottery with more than 0.2 ether", async () => {
      const { lottery } = await loadFixture(deployLotteryFixture);
      await lottery.write.enterPlayer({ value: parseEther("200") });
    });
    it("Should fail if the ether sent is Insufficient", async () => {
      const { lottery, AccountOne } = await loadFixture(deployLotteryFixture);
      const enterPlayer = lottery.write.enterPlayer({
        value: parseEther("0.001"),
        account: AccountOne.account,
      });
      await expect(enterPlayer).to.be.rejectedWith("Insufficient ether sent");
    });
    it("Should set right player", async () => {
      const { lottery, AccountOne } = await loadFixture(deployLotteryFixture);
      await lottery.write.enterPlayer({
        value: parseEther("200"),
        account: AccountOne.account.address,
      });
      const player = (await lottery.read.getPlayers()).at(0);
      expect(player?.toLocaleLowerCase()).to.be.equal(
        AccountOne.account.address,
      );
    });
  });

  describe("pickWinner", async () => {
    it("should fail if No players in the lottery", async () => {
      const { lottery } = await loadFixture(deployLotteryFixture);
      const pickWinner = lottery.write.pickWinner();
      await expect(pickWinner).to.be.rejectedWith("No players in the lottery");
    });
    it("should fail if other accounts try to call pickWinner function", async () => {
      const { lottery, AccountOne } = await loadFixture(deployLotteryFixture);
      const pickWinner = lottery.write.pickWinner({
        account: AccountOne.account.address,
      });
      await expect(pickWinner).to.be.rejectedWith(
        "Only the manager can call this function",
      );
    });
    it("should pick random winner", async () => {
      const { lottery, AccountOne, accountTwe, manager } =
        await loadFixture(deployLotteryFixture);
      await lottery.write.enterPlayer({
        value: parseEther("2000"),
        account: AccountOne.account,
      });
      await lottery.write.enterPlayer({
        value: parseEther("2000"),
        account: accountTwe.account,
      });
      expect(await lottery.write.pickWinner({ account: manager.account })).to.be
        .ok;
    });
    it("sends money to the winner and resets the players array", async () => {
      const { lottery, AccountOne, publicClient, manager } =
        await loadFixture(deployLotteryFixture);
      const beforeTransfer = await publicClient.getBalance({
        address: AccountOne.account.address,
      });
      await lottery.write.enterPlayer({
        value: parseEther("2000"),
        account: AccountOne.account,
      });
      await lottery.write.pickWinner({ account: manager.account });
      const afterTransfer = await publicClient.getBalance({
        address: AccountOne.account.address,
      });

      expect(Number(beforeTransfer)).to.be.greaterThan(Number(afterTransfer));
      expect(await lottery.read.getPlayers()).to.have.lengthOf(0);
    });
  });
  describe("getPlayers", async () => {
    it("players array length should be one ", async () => {
      const { lottery, AccountOne } = await loadFixture(deployLotteryFixture);
      await lottery.write.enterPlayer({
        value: parseEther("200"),
        account: AccountOne.account,
      });
      expect(await lottery.read.getPlayers()).to.have.lengthOf(1);
    });

    it("players array length should be zero ", async () => {
      const { lottery } = await loadFixture(deployLotteryFixture);
      expect(await lottery.read.getPlayers()).to.have.lengthOf(0);
    });
  });
});
