import './App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import 'sf-font';
import { nftpng } from './config';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';
import { truncateAddress } from './utils';
import contractInstance from './contractInstance';

export default function NFT() {
  const [stakableNFTs, getNfts] = useState([])
  const [nftstk, getStk] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [account, setAccount] = useState()
  const [contract, setContract] = useState()

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
  const connectWallet = async () => {
    try {
      var provider = await web3Modal.connect();
      const web3 = new Web3(provider);
       await subscribeProvider(provider);
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      setAccount(account);
      const contract = await contractInstance;
      setContract(contract);

      const stakableNFTs = await contract.walletOfOwner();
      const stakednfts = await contract.getStakedTokens();
      getNfts(stakableNFTs);
      getStk(stakednfts);
      setLoadingState('loaded');
    } catch (error) {
      console.log(error);
    }
  }

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  }

  const refreshState = () => {
    setAccount();
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [])

  if (loadingState === 'loaded' && !stakableNFTs.length)
    return (
      <h1 className="text-3xl">Wallet Not Connected</h1>
    )

  return (
    <div className='nftportal mb-4'>
      <nav className="navbar navbarfont navbarglow navbar-expand-md navbar-dark bg-dark mb-4">
        <Link to='/' className='mx-5 w-100' style={{color: '#ffffff', textDecoration: 'none'}}><h2 style={{margin: 0}}>STAKING DAPP</h2></Link>
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
      <div className="container col-lg-11">
        <div className="row items px-3 pt-3">
          {
            stakableNFTs.map((nft, i) => {
              async function stakeit() {
                await contract.stake([nft]);
              }
              return (
                <div className="card nft-card mt-3 mb-3"
                  key={i}>
                  <div className="image-over">
                    <img className="card-img-top"
                      src={
                        nftpng + nft + '.png'
                      }
                      alt="" />
                  </div>
                  <div className="card-caption col-12 p-0">
                    <div className="card-body">
                      <h5 className="mb-0">Net2Dev Collection NFT #{
                        nft
                      }</h5>
                      <h5 className="mb-0 mt-2">Status<p style={
                        {
                          color: "#39FF14",
                          fontWeight: "bold",
                          textShadow: "1px 1px 2px #000000"
                        }
                      }>Ready to Stake</p>
                      </h5>
                      <div className="card-bottom d-flex justify-content-between">
                        <input key={i}
                          type="hidden"
                          id='stakeid'
                          value={
                            nft
                          } />
                        <Button style={
                          {
                            marginLeft: '2px',
                            backgroundColor: "#ffffff10"
                          }
                        }
                          onClick={stakeit}>Stake it</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          }
          {
            nftstk.map((nft, i) => {
              async function unstakeit() {
                await contract.withdrawArray([nft]);
              }
              return (
                  <div className="card stakedcard mt-3 mb-3"
                    key={i}>
                    <div className="card-caption col-12 p-0">
                      <div className="card-body">
                        <h5 className="mb-0">Trolls WTF NFT #{
                          nft
                        }</h5>
                        <h5 className="mb-0 mt-2">Status<p style={
                          {
                            color: "#15F4EE",
                            fontWeight: "bold",
                            textShadow: "1px 1px 2px #000000"
                          }
                        }>Currently Staked</p>
                        </h5>
                        <div className="card-bottom d-flex justify-content-between">
                          <input key={i}
                            type="hidden"
                            id='stakeid'
                            value={
                              nft
                            } />
                          <Button style={
                            {
                              marginLeft: '2px',
                              backgroundColor: "#ffffff10",
                              color: '#020202'
                            }
                          }
                            onClick={unstakeit}>Unstake it</Button>
                        </div>
                      </div>
                    </div>
                  </div>
              )
            })
          } </div>
      </div>
    </div>
  )
}

