//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "./LotteryManager.sol";

contract Lottery {
    address[] public players;
    address public manager;
    address public lotteryManager; // Reference to LotteryManager contract instance

    /* -------------------- Constructor to set the manager ------------------- */
    constructor(address _manager, address _lotteryManager) {
        manager = _manager;
        lotteryManager = _lotteryManager; // Set reference to LotteryManager contract instance
    }

    /* -------- Modifier to restrict access to manager-only functions -------- */
    modifier onlyManager() {
        require(
            msg.sender == manager,
            "Only the manager can call this function"
        );
        _;
    }

    /* -------- Modifier to restrict enter player whene it's close -------- */
    modifier onlyWhenLotteryOpen() {
        require(
            LotteryManager(lotteryManager).lotteryState(),
            "Lottery is not open for entries"
        );
        _;
    }

    /* ------------------------- get list of all players ------------------------ */
    function getPlayers() public view returns (address[] memory) {
        return players;
    }

    /* --------- allow players to enter the lottery by sending ether --------- */
    function enterPlayer() public payable onlyWhenLotteryOpen {
        require(msg.value > 0.2 ether, "Insufficient ether sent");
        players.push(msg.sender);
    }

    /* ----------------------  generate a random number ---------------------- */
    function random() private view returns (uint) {
        return
            uint(
                keccak256(
                    abi.encodePacked(block.prevrandao, block.timestamp, players)
                )
            );
    }

    /* ----------------  pick the winner and transfer balance ---------------- */
    function pickWinner() public onlyManager {
        require(players.length > 0, "No players in the lottery");
        uint index = random() % players.length;
        address winner = players[index];
        payable(winner).transfer(address(this).balance); // Transfer the balance to the winner
        delete players;
    }
}
