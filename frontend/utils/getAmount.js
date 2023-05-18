import { Contract } from "ethers";
import {EXCHANGE_CONTRACT_ABI, 
    EXCHANGE_CONTRACT_ADDRESS, 
    TOKEN_CONTRACT_ABI, 
    TOKEN_CONTRACT_ADDRESS} from "../constants/index"

export const getUserBalance = async(provider, address, contract=false)=>{
    try{
        if(contract){
            const balance = await provider.getBalance(EXCHANGE_CONTRACT_ADDRESS);
            return balance;
        }else{
            const balance = await provider.getBalance(address);
        }
    }catch(err){
        console.error(err);
        return 0;
    }

}

export const getCDTokensBalance = async(provider, address) =>{
    try{
        const tokenContract = new Contract(
            TOKEN_CONTRACT_ADDRESS,
            TOKEN_CONTRACT_ABI,
            provider
        );
        const CDTokenBalance = await tokenContract.balanceOf(address);
        return CDTokenBalance;
    }catch(err){
        console.error(err);
    }
} 


export const getLPTokenBalance = async(provider, address) =>{
    try{
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );

        const balanceOfLPTokens = await exchangeContract.balanceOf(address);
        return balanceOfLPTokens;
    }catch(err){
        console.error(err);
    }
}

export const getTokenReserve = async(provider)=>{
    try{
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ABI,
            provider
        );
        const tokenReserve = await exchangeContract.getReserve();
        return tokenReserve;
    }catch(err){
        console.error(err);
    }
}