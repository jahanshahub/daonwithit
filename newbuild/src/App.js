import './App.css';
import { Button, ButtonGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React, { Component } from 'react';
import 'sf-font';
import axios from 'axios';
import ABI from './ABI.json';
import VAULTABI from './VAULTABI.json';
import TOKENABI from './TOKENABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, etherscanapi, moralisapi } from './config';
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import WalletLink from "walletlink";
import Web3 from 'web3';
import { createAlchemyWeb3 } from '@alch/alchemy-web3';
import {truncateAddress} from './utils';

// var account = null;
var contract = null;
var vaultcontract = null;
var web3 = null;

const Web3Alc = createAlchemyWeb3("https://eth-goerli.g.alchemy.com/v2/vY76_mMjGO0EPfRIs2q_S4zsVOn1w-vF");

const moralisapikey = "LrwlfLHul6lNJqnxa0kmOo7S2E7tStIIfAQqKP8ygLkZ2k45Xq1Pa8GYTTLxM05m";
const etherscanapikey = "M8PI35YSNUTAGWASP1EJB165BS6FSJ5GIU";

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
};

const web3Modal = new Web3Modal({
	network: "goerli",
	theme: "dark",
	cacheProvider: true,
	providerOptions
});

class App extends Component {
	constructor() {
		super();
		this.state = {
      account: '',
			balance: [],
			rawearn: [],
		};
	}

	handleModal(){
		this.setState({show:!this.state.show})
	}

	handleNFT(nftamount) {
		this.setState({outvalue:nftamount.target.value});
  }

	async componentDidMount() {
		await axios.get((etherscanapi + `?module=stats&action=tokensupply&contractaddress=${NFTCONTRACT}&apikey=${etherscanapikey}`))
		.then(outputa => {
            this.setState({
                balance:outputa.data
            })
            // console.log(outputa.data)
        })
		let config = {'X-API-Key': moralisapikey, 'accept': 'application/json'};
		await axios.get((moralisapi + `/nft/${NFTCONTRACT}/owners?chain=goerli&format=decimal`), {headers: config})
		.then(outputb => {
			const { result } = outputb.data
            this.setState({
                nftdata:result
            })
            console.log(outputb.data)
        })
	}

  refreshState = () => {
    this.setState({account: ''});
  };

  connectWallet = async () => {
    var provider = await web3Modal.connect();
    web3 = new Web3(provider);
    await provider.send('eth_requestAccounts');
    var accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    this.setState({account});
    // document.getElementById('wallet-address').textContent = account;
    contract = new web3.eth.Contract(ABI, NFTCONTRACT);
    vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
    var getstakednfts = await vaultcontract.methods.userStakeInfo(account).call();
    document.getElementById('yournfts').textContent = getstakednfts._tokensStaked;
    document.getElementById('earned').textContent = getstakednfts._availableRewards;
    var getbalance = await vaultcontract.methods.stakers(account).call();
    document.getElementById('stakedbalance').textContent = getbalance.amountStaked;
    // const arraynft = Array.from(getstakednfts.map(Number));
		// const tokenid = arraynft.filter(Number);
		// var rwdArray = [];
    // tokenid.forEach(async (id) => {
    //   var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
    //   var array = Array.from(rawearn.map(Number));
    //   console.log(array);
    //   array.forEach(async (item) => {
    //     var earned = String(item).split(",")[0];
    //     var earnedrwd = Web3.utils.fromWei(earned);
    //     var rewardx = Number(earnedrwd).toFixed(2);
    //     var numrwd = Number(rewardx);
    //     console.log(numrwd);
    //     rwdArray.push(numrwd);
    //   });
    // });
    // function delay() {
    //   return new Promise(resolve => setTimeout(resolve, 300));
    // }
    // async function delayedLog(item) {
    //   await delay();
    //   var sum = item.reduce((a, b) => a + b, 0);
    //   var formatsum = Number(sum).toFixed(2);
    //   document.getElementById('earned').textContent = formatsum;
    // }
    // async function processArray(rwdArray) {
    //   for (const item of rwdArray) {
    //     await delayedLog(item);
    //   }
    // }
    // return processArray([rwdArray]);
  }

  disconnect = async () => {
    await web3Modal.clearCachedProvider();
    this.refreshState();
  }

render() {
	const {balance, outvalue, account} = this.state;

  const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

  const expectedBlockTime = 10000;

  async function verify() {
    var getstakednfts = await vaultcontract.methods.userStakeInfo(account).call();
    document.getElementById('yournfts').textContent = getstakednfts._tokensStaked;
    var getbalance = await vaultcontract.methods.stakers(account).call();
    document.getElementById('stakedbalance').textContent = getbalance.amountStaked;
  }

  async function enable() {
    contract.methods.setApprovalForAll(NFTCONTRACT, true).send({ from: account });
  }

  async function rewardinfo() {
    var rawnfts = await vaultcontract.methods.userStakeInfo(account).call();
    document.getElementById('earned').textContent = rawnfts._tokensStaked;

    // const arraynft = Array.from(rawnfts.map(Number));
    // const tokenid = arraynft.filter(Number);
    // var rwdArray = [];
    // tokenid.forEach(async (id) => {
    //   var rawearn = await vaultcontract.methods.earningInfo(account, [id]).call();
    //   var array = Array.from(rawearn.map(Number));
    //   array.forEach(async (item) => {
    //     var earned = String(item).split(",")[0];
    //     var earnedrwd = Web3.utils.fromWei(earned);
    //     var rewardx = Number(earnedrwd).toFixed(2);
    //     var numrwd = Number(rewardx);
    //     rwdArray.push(numrwd)
    //   });
    // });
    // function delay() {
    //   return new Promise(resolve => setTimeout(resolve, 300));
    // }
    // async function delayedLog(item) {
    //   await delay();
    //   var sum = item.reduce((a, b) => a + b, 0);
    //   var formatsum = Number(sum).toFixed(2);
    //   document.getElementById('earned').textContent = formatsum;
    // }
    // async function processArray(rwdArray) {
    //   for (const item of rwdArray) {
    //     await delayedLog(item);
    //   }
    // }
    // return processArray([rwdArray]);
  }
  async function claimit() {
    var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
    const arraynft = Array.from(rawnfts.map(Number));
    const tokenid = arraynft.filter(Number);
    await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
      Web3Alc.eth.getBlock('pending').then((block) => {
        var baseFee = Number(block.baseFeePerGas);
        var maxPriority = Number(tip);
        var maxFee = maxPriority + baseFee;
        tokenid.forEach(async (id) => {
          await vaultcontract.methods.claim([id])
            .send({
              from: account,
              maxFeePerGas: maxFee,
              maxPriorityFeePerGas: maxPriority
            })
        })
      });
    })
  }
  async function unstakeall() {
    var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
    const arraynft = Array.from(rawnfts.map(Number));
    const tokenid = arraynft.filter(Number);
    await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
      Web3Alc.eth.getBlock('pending').then((block) => {
        var baseFee = Number(block.baseFeePerGas);
        var maxPriority = Number(tip);
        var maxFee = maxPriority + baseFee;
        tokenid.forEach(async (id) => {
          await vaultcontract.methods.unstake([id])
            .send({
              from: account,
              maxFeePerGas: maxFee,
              maxPriorityFeePerGas: maxPriority
            })
        })
      });
    })
  }
  async function mintnative() {
    var _mintAmount = Number(outvalue);
    var mintRate = Number(await contract.methods.cost().call());
    var totalAmount = mintRate * _mintAmount;
    await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
        Web3Alc.eth.getBlock('pending').then((block) => {
            var baseFee = Number(block.baseFeePerGas);
            var maxPriority = Number(tip);
            var maxFee = baseFee + maxPriority
        contract.methods.mint(account, _mintAmount)
            .send({ from: account,
              value: String(totalAmount),
              maxFeePerGas: maxFee,
              maxPriorityFeePerGas: maxPriority});
        });
    })
  }

  async function mint0() {
    var _pid = "0";
    var erc20address = await contract.methods.getCryptotoken(_pid).call();
    var currency = new web3.eth.Contract(TOKENABI, erc20address);
    var mintRate = await contract.methods.getNFTCost(_pid).call();
    var _mintAmount = Number(outvalue);
    var totalAmount = mintRate * _mintAmount;
    await Web3Alc.eth.getMaxPriorityFeePerGas().then((tip) => {
      Web3Alc.eth.getBlock('pending').then((block) => {
        var baseFee = Number(block.baseFeePerGas);
        var maxPriority = Number(tip);
        var maxFee = maxPriority + baseFee;
        currency.methods.approve(NFTCONTRACT, String(totalAmount))
					  .send({
						  from: account})
              .then(currency.methods.transfer(NFTCONTRACT, String(totalAmount))
						  .send({
							  from: account,
							  maxFeePerGas: maxFee,
							  maxPriorityFeePerGas: maxPriority
						  },
              async function (error, transactionHash) {
                console.log("Transfer Submitted, Hash: ", transactionHash)
                let transactionReceipt = null
                while (transactionReceipt == null) {
                  transactionReceipt = await web3.eth.getTransactionReceipt(transactionHash);
                  await sleep(expectedBlockTime)
                }
                window.console = {
                  log: function (str) {
                    var out = document.createElement("div");
                    out.appendChild(document.createTextNode(str));
                    document.getElementById("txout").appendChild(out);
                  }
                }
                console.log("Transfer Complete", transactionReceipt);
                contract.methods.mintpid(account, _mintAmount, _pid)
                .send({
                  from: account,
                  maxFeePerGas: maxFee,
                  maxPriorityFeePerGas: maxPriority
                });
            }));
      });
    });
  }
  const refreshPage = ()=>{
    window.location.reload();
  }

  return (
    <div className="App nftapp">
        <nav className="navbar navbarfont navbarglow navbar-expand-md navbar-dark bg-dark mb-4">
          <div className="container-fluid" style={{ fontFamily: "SF Pro Display" }}>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarCollapse" aria-controls="navbarCollapse" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
          <div className='px-5'>
            {/* <input  type="button"  onClick={connectWallet} style={{ fontFamily: "SF Pro Display" }} value="Connect Your Wallet" /> */}
            {!account ? (
              <button id="connectbtn" className="connectbutton" onClick={this.connectWallet}>Connect Wallet</button>
              ) : (
              <button id="disconnectbtn" className="disconnectbutton" onClick={this.disconnect}>Account: {truncateAddress(account)}</button>
            )}
          </div>
        </nav>
        <div className='container container-style'>

        <div className='col'>
          <body className='nftstaker border-0'>
            <form  style={{ fontFamily: "SF Pro Display" }} >
              <h2 style={{ borderRadius: '14px', fontWeight: "300", fontSize: "25px" }}>N2DR NFT Staking Vault </h2>
              <h6 style={{ fontWeight: "300" }}>First time staking?</h6>
              <Button className="btn" onClick={enable} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >Authorize Your Wallet</Button>
              <div className="row px-3">
                <div className="col">
                  <form className="stakingrewards" style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #ffffff" }}>
                    <h5 style={{ color: "#FFFFFF", fontWeight: '300' }}>Your Vault Activity</h5>
                    <h6 style={{ color: "#FFFFFF" }}>Verify Staked Amount</h6>
                    <Button onClick={verify} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >Verify</Button>
                    <table className='table mt-3 mb-5 px-3 table-dark'>
                      <tr key='0'>
                        <td style={{ fontSize: "19px" }}>Your Staked NFTs:
                          <span style={{ backgroundColor: "#ffffff00", fontSize: "21px", color: "#39FF14", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='yournfts'></span>
                        </td>
                      </tr>
                      <tr key='1'>
                        <td style={{ fontSize: "19px" }}>Total Staked NFTs:
                          <span style={{ backgroundColor: "#ffffff00", fontSize: "21px", color: "#39FF14", fontWeight: "500", textShadow: "1px 1px 2px #000000" }} id='stakedbalance'></span>
                        </td>
                      </tr>
                      <tr key='2'>
                        <td style={{ fontSize: "19px" }}>Unstake All Staked NFTs
                          <Button onClick={unstakeall} className='mb-3' style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }}>Unstake All</Button>
                        </td>
                      </tr>
                    </table>
                  </form>
                  </div>
                  <img className="col-lg-4" src="art.png"/>
                  <div className="col">
                    <form className='stakingrewards' style={{ borderRadius: "25px", boxShadow: "1px 1px 15px #ffffff", fontFamily: "SF Pro Display" }}>
                      <h5 style={{ color: "#FFFFFF", fontWeight: '300' }}> Staking Rewards</h5>
                      <Button onClick={rewardinfo} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} >Earned N2D Rewards</Button>
                      <div id='earned' style={{ color: "#39FF14", marginTop: "5px", fontSize: '25px', fontWeight: '500', textShadow: "1px 1px 2px #000000" }}><p style={{ fontSize: "20px" }}>Earned Tokens</p></div>
                      <div className='col-12 mt-2'>
                        <div style={{ color: 'white' }}>Claim Rewards</div>
                        <Button onClick={claimit} style={{ backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} className="mb-2">Claim</Button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="row px-4 pt-2">
                  <div className="header">
                    <div style={{ fontSize: '25px', borderRadius: '14px', color: "#ffffff", fontWeight: "300" }}>N2DR NFT Staking Pool Active Rewards</div>
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
                          <td>N2D Bronze Collection</td>
                          <td className="amount" data-test-id="rewards-summary-ads">
                            <span className="amount">0.50</span>&nbsp;<span className="currency">N2DR</span>
                          </td>
                          <td className="exchange">
                            <span className="amount">2</span>&nbsp;<span className="currency">NFTs/M</span>
                          </td>
                        </tr>
                        <tr>
                          <td>N2D Silver Collection</td>
                          <td className="amount" data-test-id="rewards-summary-ac">
                            <span className="amount">2.50</span>&nbsp;<span className="currency">N2DR</span>
                          </td>
                          <td className="exchange"><span className="amount">10</span>&nbsp;<span className="currency">NFTs/M</span>
                          </td>
                        </tr>
                        <tr className='stakegoldeffect'>
                          <td>N2D Gold Collection</td>
                          <td className="amount" data-test-id="rewards-summary-one-time"><span className="amount">1</span>&nbsp;<span className="currency">N2DR+</span>
                          </td>
                          <td className="exchange">
                            <span className="amount">25 NFTs/M or </span>
                            <span className="currency">100 N2DR/M</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="header">
                      <div style={{ fontSize: '25px', borderRadius: '14px', fontWeight: '300' }}>N2DR Token Stake Farms</div>
                      <table className='table table-bordered table-dark' style={{ borderRadius: '14px' }} >
                        <thead className='thead-light'>
                          <tr>
                            <th scope="col">Farm Pools</th>
                            <th scope="col">Harvest Daily Earnings</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Stake N2DR to Earn N2DR</td>
                            <td className="amount" data-test-id="rewards-summary-ads">
                              <span className="amount">0.01</span>&nbsp;<span className="currency">Per N2DR</span>
                            </td>
                          </tr>
                          <tr>
                            <td>Stake N2DR to Earn N2DR+</td>
                            <td className="amount" data-test-id="rewards-summary-ac">
                              <span className="amount">0.005</span>&nbsp;<span className="currency">Per N2DR</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
            </form>
          </body>
        </div>
      </div>
      <div className='row nftportal mt-3'>
        <div className='col mt-4 ml-3'>
        <img src="polygon.png" width={'60%'}></img>
      </div>
      <div className='col'>
        <h1 className='n2dtitlestyle mt-3'>Your NFT Portal</h1>
      <Button onClick={refreshPage} style={{ backgroundColor: "#000000", boxShadow: "1px 1px 5px #000000" }}>Refresh NFT Portal</Button>
      </div>
      <div className='col mt-3 mr-5'>
      <img src="ethereum.png" width={'60%'}></img>
      </div>
      </div>
      </div>
    )
  }
}
export default App;

