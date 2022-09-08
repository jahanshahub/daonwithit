import Web3 from 'web3'
import ABI from './ABI.json';
import VAULTABI from './VAULTABI.json';
import { NFTCONTRACT, STAKINGCONTRACT } from './config';

const provider = () => {
    // 1. Try getting newest provider
    const { ethereum } = window
    if (ethereum) return ethereum

    // 2. Try getting legacy provider
    const { web3 } = window
    if (web3 && web3.currentProvider) return web3.currentProvider
}

let contractInstance

if (provider()) {
    const web3 = new Web3(provider())
    contractInstance = web3.eth.getAccounts().then(accounts => {
        const stkContract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);
        const tokenContract = new web3.eth.Contract(ABI, NFTCONTRACT);
        console.log(accounts[0], stkContract, tokenContract)
        return {
            async getStakedTokens() {
                return await stkContract.methods.getStakedTokens(accounts[0]).call()
            },
            async userStakeInfo() {
                return await stkContract.methods.userStakeInfo(accounts[0]).call()
            },
            async stakers() {
                return await stkContract.methods.stakers(accounts[0]).call()
            },
            async withdrawArray(stakedTokens) {
                console.log(stakedTokens)
                return await stkContract.methods.withdrawArray(stakedTokens).send({ from: accounts[0] })
            },
            async claimRewards() {
                return await stkContract.methods.claimRewards().send({ from: accounts[0] })
            },
            async stake(tokenIds) {
                return await stkContract.methods.stake(tokenIds).send({ from: accounts[0] })
            },
            async walletOfOwner() {
                return await tokenContract.methods.walletOfOwner(accounts[0]).call()
            },
            async setApprovalForAll() {
                return await tokenContract.methods.setApprovalForAll(STAKINGCONTRACT, true).send({ from: accounts[0] })
            }
        }
    })
}

export default contractInstance
