const DappToken = artifacts.require("DappToken")
const FuncToken = artifacts.require("FuncToken")
const TokenFarming = artifacts.require("TokenFarming")


module.exports = async function(deployer, network, accounts) {
// Deploy Dapp Token
await deployer.deploy(DappToken)
// Fetch the address of deployed DappToken
const dappToken = await DappToken.deployed()

// Deploy FuncToken
await deployer.deploy(FuncToken)
const funcToken = await FuncToken.deployed()

// Deploy TokenFarm
await deployer.deploy(TokenFarming, dappToken.address, funcToken.address)
const tokenFarming = await TokenFarming.deployed()

// Transfer all (1M) DappTokens to the TokenFarm
await dappToken.transfer(tokenFarming.address, '1000000000000000000000000')

// Transfer 100 FuncTokens to the investor 
await funcToken.transfer(accounts[1], '100000000000000000000')

};