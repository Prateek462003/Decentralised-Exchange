import Head from 'next/head'

import styles from '@/styles/Home.module.css'
import { useEffect, useRef, useState } from 'react'
import Web3Modal, { getProviderDescription } from "web3modal";
// import { BigNumber, providers, utils } from 'ethers';
import {BigNumber, providers, utils} from "ethers";
import {addLiquidity, calculateCD} from "../utils/addLiquidity"
import {getUserBalance, getCDTokensBalance, getLPTokenBalance, getTokenReserve} from "../utils/getAmount";
import {removeLiquidity, getTokensAfterRemove} from "../utils/removeLiquidity"
import {swapTokens, getAmountOfTokensRecievedFromSwap} from "../utils/swap"


export default function Home() {
  
  const zero = BigNumber.from(0);
  const [liquidityTab, setLiquidityTab] = useState(false);
  const [ethBalance, setEthBalance] = useState(zero);
  const [lpBalance, setLPBalance] = useState(zero);
  const [reservedCD, setReservedCD] = useState(zero);
  const [ethBalanceContract, setEthBalanceContract] = useState(zero);  
  const [cdBalance, setCDBalance]=  useState(zero);
  const [addEther, setAddEther] = useState(zero);
  const [addCDTokens, setAddCDTokens] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [walletConnect, setWalletConnect] = useState(false);
  const web3ModalRef = useRef();
  const _addLiquidity = async() =>{
    
  }
  const getAmmounts = async()=>{
    try{  
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const _ethBalance = await getUserBalance(provider, address);
      const _cdBalance = await getCDTokensBalance(provider, address);
      const _lpBalance = await getLPTokenBalance(provider, address);
      const _reservedCD = await getTokenReserve(provider);
      const _ethBalanceContract = await getUserBalance(provider, null, true);
      setEthBalance(_ethBalance);
      setCDBalance(_cdBalance);
      setLPBalance(_lpBalance);
      setReservedCD(_reservedCD);
      setEthBalanceContract(_ethBalanceContract);
    }catch(err){
      console.error(err);
    }
  }
  const renderButtons=()=>{
    if(!walletConnect){
      return(
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      );
    }
    if(loading){
      return(
        <button className={styles.button}>
          Loading...
        </button>
      );
    }
    if(liquidityTab){
      return(
        <>
        <div className={styles.description}>
          You have:
          <br />
          {utils.formatEther(cdBalance)} Crypto Dev Tokens
          <br />
          {utils.formatEther(ethBalance)} ETH
          <br />
          {utils.formatEther(lpBalance)} Crypto Dev LP Tokens
        </div>
        <div>
          {utils.parseEther(reservedCD.toString()).eq(zero)?
          (
            <div>
              <input type="number" placeholder='Enter The Amount Of Ether' className={styles.input}
              onChange={(e)=>setAddEther(e.target.value || "0")} />
              <input type="number" placeholder='Enter The Amount of Crypto Dev Token ' className={styles.input} 
              onChange={(e)=>setAddCDTokens(BigNumber.from(utils.parseEther(e.target.value || "0")))}/>
              <button className={styles.button} onClick={_addLiquidity}>
                Add
              </button>
            </div>
          ):
          (

          )}
        </div>
        </>
      );
    }

  }
  const connectWallet = async()=>{
    try{
      await getProviderOrSigner();
      setWalletConnect(true);
    }catch(err){
      console.error(err);
    }
  } 
  const getProviderOrSigner = async(needSigner = false)=>{
    try{
      const provider = await web3ModalRef.current.connect();
      const web3Provider = await providers.Web3Provider(provider);
      const {chainId} = web3Provider.getNetwork();
      if(chainId!=11155111){
        throw new Error("Change the network to Sepolia");
        window.Error("Change the network to sepolia");
      }
      if(needSigner){
        const signer = await web3Provider.getSigner();
        return signer;
      }
      return web3Provider;

    }catch(err){
      console.error
    }
  }

  useEffect(()=>{
    if(!walletConnect){
      web3ModalRef.current = new Web3Modal({
        networks:"sepolia",
        providerOptions:{},
        disableInjectedProvider:false,
      });
      connectWallet();
    }
  },[walletConnect]);
  return (
    <>
      <Head>
        <title>Decentralized Exchange</title>
        <meta name="description" content="Decentralized Exchange" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
            <h1 className={styles.tittle}>
                Welcome To Crypto Devs Exchange!
            </h1>
            <div className={styles.description}>
              Exchange Ethereum &#60;=&#62; Crypto Dev Token
            </div>
            <div>
              <button className={styles.button} onClick={()=>{setLiquidityTab(true);}}>
                Liquidity
              </button>
              <button className={styles.button} onClick={()=>{setLiquidityTab(false);}}>
                Swap
              </button>
            </div>
            {renderButtons()}
        </div>
      </div>
    </>
  )
}
