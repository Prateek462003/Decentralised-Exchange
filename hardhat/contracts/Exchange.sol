// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {  
    address public cryptoDevTokenAddress;

    constructor(address _cryptoDevToken) ERC20("CryptoDev LP Token", "CDLP"){
        require(_cryptoDevToken != address(0), "Address Passed is a null address");
        cryptoDevTokenAddress = _cryptoDevToken;
    }

    function getReserve() public view returns(uint){
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }
    // ADDS LIQUIDITY TO THE CONTRACT AND RETURNS THE AMOUNT OF LP TOKENS MINTED FOR THE LIQUIDITY PROVIDERS
    function addLiquidity(uint _amount) payable public returns(uint){
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint cryptoDevTokenReserve = getReserve();
        ERC20 cryptoDevToken = ERC20(cryptoDevTokenAddress);
        
        if(cryptoDevTokenReserve == 0){
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);         
        }else {
            uint ethReserve = ethBalance - msg.value;
            uint requiredTokenAmount = (msg.value*getReserve())/ethReserve;
            require(_amount >= requiredTokenAmount, "Amount of Tokens is less than minimum amount of tokens required");
            cryptoDevToken.transferFrom(msg.sender, address(this), requiredTokenAmount);
            liquidity = (totalSupply()*msg.value)/ethReserve;
            _mint(msg.sender, liquidity);
        }
        return liquidity;
    }

    
}