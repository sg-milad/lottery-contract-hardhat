//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Lottery.sol"; // Import the Lottery contract

contract LotteryManager {
    address public lotteryAddress; // Address of the deployed Lottery contract
    address public manager;

    constructor() {
        manager = msg.sender;
        lotteryAddress = address(new Lottery(manager)); // Create a new instance of the Lottery contract
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            "Only the manager can call this function"
        );
        _;
    }

    function openLottery() public onlyManager {
        Lottery(lotteryAddress).openLottery();
    }

    function closeLottery() public onlyManager {
        Lottery(lotteryAddress).closeLottery();
        Lottery(lotteryAddress).pickWinner();
    }
}
