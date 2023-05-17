// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Exchange is ERC20 {  
    address public cryptoDevTokenAddress;
    constructor(address _cryptoDevTokenAddress) ERC20("CryptoDev LP Token", "CDLP") {
        require(_cryptoDevTokenAddress != address(0), "Token Address passed as a null address");
        cryptoDevTokenAddress = _cryptoDevTokenAddress;
    }

    // function to get total reserve of CryptoDev token 
    function getReserve() public view returns(uint) {
        return ERC20(cryptoDevTokenAddress).balanceOf(address(this));
    }
    
    function addLiquidity(uint _amount) payable public returns(uint){
        uint liquidity;
        uint ethBalance = address(this).balance;
        uint cryptoDevTokenReserve = getReserve();
        ERC20 cryptoDevToken = ERC20(cryptoDevTokenAddress);

        if(cryptoDevTokenReserve == 0){
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);
            liquidity = ethBalance;
            _mint(msg.sender, liquidity);
        }
        else{
            uint ethReserve = ethBalance - msg.value;
            uint cryptoDevTokenAmount = (cryptoDevTokenReserve * msg.value)/(ethReserve);
            require(_amount >= cryptoDevTokenAmount, "Amount of Tokens is less than required tokens");
            cryptoDevToken.transferFrom(msg.sender, address(this), _amount);
            // Mint Crypto Dev LP token
            liquidity = (totalSupply()*msg.value)/(ethReserve);
            _mint(msg.sender, liquidity);

        }
        return liquidity;
    }
    // Liquidity Provider should enter the amount of LP tokens he want to withdraw
    function removeLiquidity(uint _amount) public returns(uint, uint){
        require(_amount > 0, "Amount should be greater than Zero");
        uint ethReserve = address(this).balance;
        uint totalLPTokens = totalSupply();  
        uint ethAmount = (ethReserve * _amount)/(totalLPTokens);
        uint tokenAmount = (getReserve() * _amount)/(totalLPTokens);
        _burn(msg.sender, _amount);
        payable(msg.sender).transfer(ethAmount);
        ERC20(cryptoDevTokenAddress).transfer(msg.sender, tokenAmount);
        return(ethAmount, tokenAmount);
    }

    function getAmount(uint inputReserve, uint outputReserve) public returns(uint){

    }
    
}