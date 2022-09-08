import './App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import 'sf-font';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';
import { truncateAddress } from './utils';
import contractInstance from './contractInstance';

export default function App() {
  const [web3, setWeb3] = useState();
  const [account, setAccount] = useState();
  const [contract, setContract] = useState();
  // const [chainId, setChainId] = useState();
  // const [network, setNetwork] = useState();
  const [stakeInfo, setStakeInfo] = useState();
  const [staker, setStaker] = useState();
  const [stakedTokens, setStakedTokens] = useState([]);

  const getProviderOptions = () => {
    const providerOptions = {
      binancechainwallet: {
        package: true
        },
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "d94953e32ec24c75ab3aa0c12b58f156"
        }
      },
      walletlink: {
        package: WalletLink,
        options: {
          appName: "Morali",
          infuraId: "d94953e32ec24c75ab3aa0c12b58f156",
          rpc: "",
          chainId: 5,
          appLogoUrl: null,
          darkMode: true
        }
      },
    }
    return providerOptions;
  };

  const web3Modal = new Web3Modal({
    network: "goerli",
    theme: "dark",
    cacheProvider: true,
    providerOptions: getProviderOptions()
  });

  const subscribeProvider = async (provider) => {
    if (!provider.on) {
      return;
    }
    provider.on("close", () => disconnect());
    provider.on("accountsChanged", async (accounts) => {
      // console.log(accounts[0])
      setAccount(accounts[0])
    });
    provider.on("chainChanged", async (chainId) => {
      // const networkId = await web3.eth.net.getId();
      // setNetwork(networkId)
    });
    provider.on("networkChanged", async (networkId) => {
      // const chainId = await web3.eth.chainId();
      // setChainId(chainId);
    });
  };

  const initWeb3 = (provider) => {
    const web3 = new Web3(provider);

    web3.eth.extend({
      methods: [
        {
          name: "chainId",
          call: "eth_chainId",
          outputFormatter: web3.utils.hexToNumber
        }
      ]
    });

    return web3;
  }

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      await subscribeProvider(provider);
      await provider.enable();
      const web3 = initWeb3(provider);
      setWeb3(web3);

      // const curChainId = await provider.request({ method: 'eth_chainId' });

      const accounts = await web3.eth.getAccounts();
      // const chainId = await web3.eth.getChainId();
      // const network = await web3.eth.net.getId();
      if (accounts) setAccount(accounts[0]);

      const contract = await contractInstance;
      setContract(contract);
      const stakeInfo = await contract.userStakeInfo();
      const staker = await contract.stakers();
      const stakedTokens = await contract.getStakedTokens();
      setStakeInfo(stakeInfo)
      setStaker(staker)
      setStakedTokens(stakedTokens)
      // console.log(stakeInfo, staker, stakedTokens)
    } catch (error) {
      console.log(error)
    }
  };

  const disconnect = async () => {
    if (web3 && web3.currentProvider && web3.currentProvider.close) {
      await web3.currentProvider.close();
    }
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  const refreshState = () => {
    setAccount();
    // setChainId();
    // setNetwork("");
    setStakeInfo();
    setStaker();
    setStakedTokens([]);
  };

  async function verify() {
    const stakeInfo = await contract.userStakeInfo();
    const staker = await contract.stakers();
    const stakedTokens = await contract.getStakedTokens();
    setStakeInfo(stakeInfo)
    setStaker(staker)
    setStakedTokens(stakedTokens)
  }

  async function rewardinfo() {
    const stakeInfo = await contract.userStakeInfo();
    setStakeInfo(stakeInfo)
  }

  async function claimit() {
    await contract.claimRewards();
  }

  async function unstakeall() {
    const stakedTokens = await contract.getStakedTokens();
    await contract.withdrawArray(stakedTokens);
  }

  async function enable() {
    await contract.setApprovalForAll();
  }

  const refreshPage = () => {
    window.location.reload();
  }

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  return (
    <div className="App nftapp">
      <nav className="navbar navbarfont navbarglow navbar-expand-md navbar-dark bg-dark mb-4">
        <div className="container-fluid" style={{ fontFamily: "SF Pro Display" }}>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        <div className='px-5'>
          {!account ? (
            <button id="connectbtn" className="connectbutton" onClick={connectWallet}>Connect Wallet</button>
          ) : (
            <button id="disconnectbtn" className="disconnectbutton" onClick={disconnect}>Account: {truncateAddress(account)}</button>
          )}
        </div>
      </nav>
      
      <div className='container container-style'>
          <div className='nftstaker border-0'>
          <img src="art.png" className="trollwtflogo"  />

            <div  style={{ fontFamily: "SF Pro Display" }} >
              <h2 style={{ borderRadius: '14px', fontWeight: "300", fontSize: "25px" }}>trollsWTFR NFT Staking Vault </h2>
              <h6 style={{ fontWeight: "300" }}>First time staking?</h6>
              
              <Button className="btn" onClick={enable} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >Authorize Your Wallet</Button>
                <div className="row px-3">

                <div className="col">

                  <form className="stakingrewards" style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #ffffff" }}>
                    <h5 style={{ color: "#FFFFFF", fontWeight: '300' }}>Your Vault Activity</h5>
                    <h6 style={{ color: "#FFFFFF" }}>Verify Staked Amount</h6>
                    <Button onClick={verify} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >Verify</Button>
                    <div className='table mt-3 mb-5 table-dark'>
                      <div style={{ fontSize: "19px" }}>Total Staked NFTs:
                        <span style={{ backgroundColor: "#ffffff00", fontSize: "21px", color: "#39FF14", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='yournfts'>{stakedTokens?.map(i=> `${i} `)}</span>
                      </div>
                      <Link to="/nft" className='btn btn-primary' style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >Stake</Link>
                      <div style={{ fontSize: "19px" }}>Your Staked NFTs:
                        <span style={{ backgroundColor: "#ffffff00", fontSize: "21px", color: "#39FF14", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='stakednfts'>{staker?staker['amountStaked']:''}</span>
                      </div>
                      <div style={{ fontSize: "19px" }}>Unstake All Staked NFTs
                        <Button onClick={unstakeall} className='mb-3' style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }}>Unstake All</Button>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="col">
                  <form className='stakingrewards' style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #ffffff", fontFamily: "SF Pro Display" }}>
                    <h5 style={{ color: "#FFFFFF", fontWeight: '300' }}> Staking Rewards</h5>
                    <Button onClick={rewardinfo} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >Earned Trolls.wtf Rewards</Button>
                    <div id='earned' style={{ color: "#39FF14", marginTop: "5px", fontSize: '25px', fontWeight: '500', textShadow: "1px 1px 2px #000000" }}><p style={{ fontSize: "20px" }}>{stakeInfo ? stakeInfo._availableRewards : 'Earned Tokens'}</p></div>
                    <div className='col-12 mt-2'>
                      <Button onClick={claimit} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} className="mb-2">Claim</Button>
                      <div style={{ color: 'white' }}>Claim Rewards</div>
                    </div>
                  </form>
                </div>
              </div>
              {/* <div className="row px-4 pt-2">
                <div className="header">
                  <div style={{ fontSize: '25px', borderRadius: '14px', color: "#ffffff", fontWeight: "300" }}>trollsWTFR NFT Staking Pool Active Rewards</div>
                  <table className='table px-3 table-bordered table-dark'>
                    <thead className='thead-light'>
                      <tr>
                        <th scope="col">Collection</th>
                        <th scope="col">Rewards Per Day</th>
                        <th scope="col">Exchangeable Items</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Trolls.wtf Bronze Collection</td>
                        <td className="amount" data-test-id="rewards-summary-ads">
                          <span className="amount">0.50</span>&nbsp;<span className="currency">Trolls.wtfR</span>
                        </td>
                        <td className="exchange">
                          <span className="amount">2</span>&nbsp;<span className="currency">NFTs/M</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Trolls.wtf Silver Collection</td>
                        <td className="amount" data-test-id="rewards-summary-ac">
                          <span className="amount">2.50</span>&nbsp;<span className="currency">Trolls.wtfR</span>
                        </td>
                        <td className="exchange"><span className="amount">10</span>&nbsp;<span className="currency">NFTs/M</span>
                        </td>
                      </tr>
                      <tr className='stakegoldeffect'>
                        <td>Trolls.wtf Gold Collection</td>
                        <td className="amount" data-test-id="rewards-summary-one-time"><span className="amount">1</span>&nbsp;<span className="currency">Trolls.wtfR+</span>
                        </td>
                        <td className="exchange">
                          <span className="amount">25 NFTs/M or </span>
                          <span className="currency">100 Trolls.wtfR/M</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="header">
                    <div className="header">
                      <div style={{ fontSize: '25px', borderRadius: '14px', fontWeight: '300' }}>trollsWTFR Token Stake Farms</div>
                      <table className='table table-bordered table-dark' style={{ borderRadius: '14px' }} >
                        <thead className='thead-light'>
                          <tr>
                            <th scope="col">Farm Pools</th>
                            <th scope="col">Harvest Daily Earnings</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Stake trollsWTFR to Earn trollsWTFR</td>
                            <td className="amount" data-test-id="rewards-summary-ads">
                              <span className="amount">0.01</span>&nbsp;<span className="currency">Per trollsWTFR</span>
                            </td>
                          </tr>
                          <tr>
                            <td>Stake trollsWTFR to Earn trollsWTFR+</td>
                            <td className="amount" data-test-id="rewards-summary-ac">
                              <span className="amount">0.005</span>&nbsp;<span className="currency">Per trollsWTFR</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

      </div>
      <div className='row nftportal mt-3'>
        <div className='col mt-4 ml-3'>
          <img src="polygon.png" width={'60%'} alt='polygon logo'></img>
        </div>
        <div className='col'>
          <h1 className='Trolls.wtftitlestyle mt-3'>Your NFT Portal</h1>
          <Button onClick={refreshPage} style={{ backgroundColor: "#000000", boxShadow: "1px 1px 5px #000000" }}>Refresh NFT Portal</Button>
        </div>
        <div className='col mt-3 mr-5'>
          <img src="ethereum.png" width={'60%'} alt='ethereum logo'></img>
        </div>
      </div>
    </div>
  )
}
