import Head from 'next/head'

import styles from '@/styles/Home.module.css'
import { useEffect, useRef, useState } from 'react'
import Web3Modal, { getProviderDescription } from "web3modal";
// import { BigNumber, providers, utils } from 'ethers';
import { BigNumber, providers, utils } from "ethers";
import { addLiquidity, calculateCD } from "../utils/addLiquidity"
import { getUserBalance, getCDTokensBalance, getLPTokenBalance, getTokenReserve } from "../utils/getAmount";
import { removeLiquidity, getTokensAfterRemove } from "../utils/removeLiquidity"
import { swapTokens, getAmountOfTokensRecievedFromSwap } from "../utils/swap"


export default function Home() {

  const zero = BigNumber.from(0);
  const [tokensToBeReceivedAfterSwap, setTokensToBeReceivedAfterSwap] = useState(zero);
  const [ethSelected, setEthSelected] = useState(true);
  const [swapAmount, setSwapAmount] = useState(zero);
  const [removeEth, setRemoveEth] = useState(zero);
  const [removeCD, setRemoveCD] = useState(zero);
  const [removeLPTOkens, setRemoveLPTokens] = useState(zero);
  const [liquidityTab, setLiquidityTab] = useState(false);
  const [ethBalance, setEthBalance] = useState(zero);
  const [lpBalance, setLPBalance] = useState(zero);
  const [reservedCD, setReservedCD] = useState(zero);
  const [ethBalanceContract, setEthBalanceContract] = useState(zero);
  const [cdBalance, setCDBalance] = useState(zero);
  const [addEther, setAddEther] = useState(zero);
  const [addCDTokens, setAddCDTokens] = useState(zero);
  const [loading, setLoading] = useState(false);
  const [walletConnect, setWalletConnect] = useState(false);
  const web3ModalRef = useRef();
  const _swap = async (_amount) => {
    try {
      const signer = getProviderOrSigner(true);
      const _swapAmountInWei = utils.parseEther(swapAmount);
      setLoading(true);
      await swapTokens(signer, _swapAmountInWei, tokensToBeReceivedAfterSwap, ethSelected);
      setLoading(false);
      await getAmmounts();
      setSwapAmount(zero);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setSwapAmount(zero);
    }
  }
  const _getAmountOfTokensReceivedAfterSwap = async (_amount) => {
    try {
      const provider = await getSignerOrProvider();
      const _swapAmount = utils.parseEther(_amount)
      const ethBalance = await getUserBalance(provider, null, true);
      const amount = await getAmountOfTokensRecievedFromSwap(_swapAmount, provider, ethSelected, ethBalance, reservedCD);
      setTokensToBeReceivedAfterSwap(amount);
    } catch (err) {
      console.error(err);
    }
  }
  const _getTokensAfterRemove = async (_amount) => {
    try {
      const provider = await getProviderOrSigner();
      const removeTokens = utils.parseEther(_amount);
      const _ethBalance = await getUserBalance(provider, null, true);
      const _cryptoDevTokenReserve = await getTokenReserve(provider);
      const { _removeEther, _removeCD } = await getTokensAfterRemove(provider,
        lpBalance,
        _ethBalance,
        _cryptoDevTokenReserve
      );
      setRemoveEth(_removeEther);
      setRemoveCD(_removeCD);
    } catch (err) {
      console.error(err);
    }
  }
  const _removeLiquidty = async (_amount) => {
    try {
      const signer = await getProviderOrSigner(true);
      const removeLPTokens = utils.parseEther(removeLPTOkens);
      setLoading(true);
      await removeLiquidity(signer, removeLPTOkens);
      setLoading(false);
      await getAmmounts();
      setRemoveCD(zero);
      setRemoveEth(zero);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEth(zero);
    }
  }
  const _addLiquidity = async () => {
    try {
      const addEtherAmount = utils.parseEther(addEther.toString());
      if (!addCDTokens.eq(zero) && !addEtherAmount.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await addLiquidity(signer, addCDTokens, addEtherAmount);
        setLoading(false);
        setAddCDTokens(zero);
        await getAmmounts();
      } else {
        setAddCDTokens(zero);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setAddCDTokens(zero);
    }
  }

  const getAmmounts = async () => {
    try {
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
    } catch (err) {
      console.error(err);
    }
  }
  const renderButtons = () => {
    if (!walletConnect) {
      return (
        <button className={styles.button} onClick={connectWallet}>
          Connect Wallet
        </button>
      );
    }
    if (loading) {
      return (
        <button className={styles.button}>
          Loading...
        </button>
      );
    }
    if (liquidityTab) {
      return (
        <div>
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
            {utils.parseEther(reservedCD.toString()).eq(zero) ?
              (
                <div>
                  <input type="number" placeholder='Enter The Amount Of Ether' className={styles.input}
                    onChange={(e) => setAddEther(e.target.value || "0")} />
                  <input type="number" placeholder='Enter The Amount of Crypto Dev Token ' className={styles.input}
                    onChange={(e) => setAddCDTokens(BigNumber.from(utils.parseEther(e.target.value || "0")))} />
                  <button className={styles.button} onClick={_addLiquidity}>
                    Add
                  </button>
                </div>
              ) :
              (
                <div>
                  <input
                    type="number"
                    placeholder='Enter The Eth Amount'
                    onChange={async (e) => {
                      setAddEther(e.target.value || "0");
                      const _addCDTokens = await calculateCD(e.target.value || "0", ethBalanceContract, reservedCD);
                      setAddCDTokens(_addCDTokens);
                    }}
                    className={styles.input}
                  />
                  <div className={styles.inputDiv}>
                    {`You will need ${utils.formatEther(addCDTokens)} CRYPTO DEV TOKENS`}
                  </div>
                  <button className={styles.button1} onClick={_addLiquidity}>
                    Add
                  </button>
                </div>
              )}
            <div className={styles.description}>
              <input type="number"
                placeholder="Enter the number of LP Tokens"
                onChange={() => {
                  async (e) => {
                    setRemoveLPTokens(e.target.value || "");
                    await _getTokensAfterRemove(e.target.value || "0");
                  }
                }}
                className={styles.input}
              />
              <div className={styles.inputDiv}>
                {`You will get ${utils.formatEther(removeEth)} amount of Eth and ${utils.formatEther(removeCD)} amount of Crypto Dev Token`}
              </div>
              <button className={styles.button1} onClick={_removeLiquidty}>
                Remove
              </button>
            </div>
          </div>
        </div>
      );
    } 
    else {
      <div>
        <input type="number"
          placeholder='Amount'
          onChange={(e) => {
            setSwapAmount(e.target.value || "0");
            _getAmountOfTokensReceivedAfterSwap(e.target.value || "0");
          }}
          className={styles.input}
          value={swapAmount}
        />
        <select className={styles.select} name="dropdown" id="dropdown"
          onChange={async () => {
            setEthSelected(!ethSelected);
            await getAmountOfTokensRecievedFromSwap(0);
            setSwapAmount("");
          }}
        >
          <option value="eth">Ethereum</option>
          <option value="cdToken">CryptoDev Token</option>
        </select>
        <br />
        <div className={styles.inputDiv}>
          {ethSelected ? `You will get ${utils.formatEther(tokensToBeReceivedAfterSwap)}Eth` :
            `You will get ${utils.formatEther(tokensToBeReceivedAfterSwap)}CryptoDev Token`}
        </div>
        <button className={styles.button1} onClick={_swap}>
          Swap
        </button>
      </div>
    }

  }
  const connectWallet = async () => {
    try {
      await getProviderOrSigner();
      setWalletConnect(true);
    } catch (err) {
      console.error(err);
    }
  }
  const getProviderOrSigner = async (needSigner = false) => {
    try {
      const provider = await web3ModalRef.current.connect();
      const web3Provider = await providers.Web3Provider(provider);
      const { chainId } = web3Provider.getNetwork();
      if (chainId != 11155111) {
        throw new Error("Change the network to Sepolia");
        window.Error("Change the network to sepolia");
      }
      if (needSigner) {
        const signer = await web3Provider.getSigner();
        return signer;
      }
      return web3Provider;

    } catch (err) {
      console.error
    }
  }

  useEffect(() => {
    if (!walletConnect) {
      web3ModalRef.current = new Web3Modal({
        networks: "sepolia",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      connectWallet();
    }
  }, [walletConnect]);
  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto Devs Exchange!</h1>
          <div className={styles.description}>
            Exchange Ethereum &#60;&#62; Crypto Dev Tokens
          </div>
          <div>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(true);
              }}
            >
              Liquidity
            </button>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(false);
              }}
            >
              Swap
            </button>
          </div>
          {renderButtons()}
        </div>
        <div>
          <img className={styles.image} src="./crypto-devs.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}
