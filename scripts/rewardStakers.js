const TokenFarming = artifacts.require('TokenFarming')

module.exports = async function(callback) {
  let tokenFarm = await TokenFarming.deployed()
  await tokenFarm.rewardStakers()
  // Code goes here...
  console.log("Tokens issued!")
  callback()
}
