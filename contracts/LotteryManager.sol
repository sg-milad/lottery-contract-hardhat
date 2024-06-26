//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./Lottery.sol"; // Import the Lottery contract

contract LotteryManager {
    address public lotteryAddress; // Address of the deployed Lottery contract
    address public manager;
    bool public lotteryState;

    constructor() {
        manager = msg.sender;
        lotteryState = true; // Set to true by default
        createLottery();
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            "Only the manager can call this function"
        );
        _;
    }

    /* -------------- Create a new instance of the Lottery contract ------------- */
    function createLottery() public onlyManager {
        lotteryAddress = address(new Lottery(manager, address(this)));
    }

    /* --------------------- open the lottery if it close -------------------- */
    function openLottery() public onlyManager {
        require(!lotteryState, "Lottery is already open");
        lotteryState = true;
    }

    /* ---------------------- close the contract if it open --------------------- */
    function closeLottery() public onlyManager {
        require(lotteryState, "Lottery is already closed");
        lotteryState = false;
    }
}
