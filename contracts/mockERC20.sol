// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MockERC20 is ERC20, ERC20Permit, Ownable {
    uint8 immutable _decimals;

    constructor(string memory name, string memory symbol, uint8 decimals_)
    ERC20(name, symbol)
    ERC20Permit(name)
    Ownable(msg.sender)
    {
        _decimals = decimals_;
    }
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    function decimals() public view override returns (uint8) {
        return _decimals;
    }
}