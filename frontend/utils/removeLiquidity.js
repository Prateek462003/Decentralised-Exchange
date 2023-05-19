import { Contract } from "ethers";
import { EXCHANGE_CONTRACT_ABI, EXCHANGE_CONTRACT_ADDRESS } from "@/constants";

export const removeLiquidity = async(signer, amountLpTokens)=>{
    const exchangeContract = new Contract(
        EXCHANGE_CONTRACT_ADDRESS,
        EXCHANGE_CONTRACT_ADDRESS,
        signer
    );
    const tx = await exchangeContract.removeLiquidity(amountLpTokens);
    await tx.wait();

}

export const getTokensAfterRemove = async(provider, lpTokens, ethBalance, cdTokenReserve) =>{
    try{
        const exchangeContract = new Contract(
            EXCHANGE_CONTRACT_ADDRESS,
            EXCHANGE_CONTRACT_ADDRESS,
            provider
        );
    
        const totalSupply = await exchangeContract.totalSupply();
        const returnEth = ethBalance.mul(lpTokens).div(totalSupply);
        const returnCDToken = cdTokenReserve.mul(lpTokens).div(totalSupply);
        return{
            returnEth,
            returnCDToken
        };
    }catch(err){
        console.error(err);
    }

}
