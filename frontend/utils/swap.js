import { Contract } from "ethers";
import { EXCHANGE_CONTRACT_ADDRESS,EXCHANGE_CONTRACT_ABI,TOKEN_CONTRACT_ADDRESS,TOKEN_CONTRACT_ABI} from "@/constants";

export const getAmountOfTokensRecievedFromSwap = async(
    swapAmount,
    provider,
    ethSelected,
    ethReserve,
    cdTokenReserve)=>{
        try{
            const exchangeContract = new Contract(
                EXCHANGE_CONTRACT_ADDRESS,
                EXCHANGE_CONTRACT_ABI,
                provider
            );
            let amountTokens;
            if(ethSelected){
                amountTokens = await exchangeContract.getAmmount(
                   swapAmount,
                   cdTokenReserve,
                   ethReserve 
                );
            }
            else{
                amountTokens = await exchangeContract.getAmount(
                    swapAmount,
                    ethReserve,
                    cdTokenReserve
                );
            }
    
            return amountTokens;
        }catch(err){
            console.error(err);
        }
}



export const swapTokens = async(
    signer,
    swapAmount,
    tokensToBeRecieved,
    ethSelected)=>{
        try{
            const exchangeContract = new Contract(
                EXCHANGE_CONTRACT_ADDRESS,
                EXCHANGE_CONTRACT_ABI,
                signer
            );
            const tokenContract = new Contract(
                TOKEN_CONTRACT_ADDRESS,
                TOKEN_CONTRACT_ABI,
                signer
            );
            
            let tx;
            if(ethSelected){
                tx = await exchangeContract.swapEthToToken(
                    tokensToBeRecieved,
                    {
                        value:swapAmount
                    }
                );
                await tx.wait();
            }
            else{
                tx = await tokenContract.approve(
                    EXCHANGE_CONTRACT_ADDRESS,
                    swapAmount
                );
                await tx.wait();

                tx = await exchangeContract.swapTokenToEth(
                    swapAmount,
                    tokensToBeRecieved
                );
                await tx.wait();
            }   
        }catch(err){
            console.error(err);
        }
}