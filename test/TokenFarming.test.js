const { assert } = require('chai')
const { default: Web3 } = require('web3')

const DappToken = artifacts.require("DappToken")
const FuncToken = artifacts.require("FuncToken")
const TokenFarming = artifacts.require("TokenFarming")

require('chai')
  .use(require('chai-as-promised'))
  .should()

// Helper function for converting tokens to decimal
    function token(n) {
        return web3.utils.toWei(n, 'ether');
    }

contract('TokenFarming', (accounts) => {
    owner = accounts[0]
    investor = accounts[1]
    let funcToken, dappToken, tokenFarming
    before(async() => {
        
    // Load Contracts
        funcToken = await FuncToken.new()
        dappToken = await DappToken.new()
        tokenFarming = await TokenFarming.new(dappToken.address, funcToken.address)
    // Transfer 1 Million DappTokens to TokenFarming Contract
        await dappToken.transfer(tokenFarming.address, token('1000000'))
    // Send Func Tokens to investors
        await funcToken.transfer(investor, token('100'), { from: owner})
    })
    
    // Write test here              
    describe('Fun Coupons Deployment', async() => {
        it('has-a-name', async() => {
            const name = await funcToken.name()
            assert.equal(name, 'FUN COUPONS')
        })
    })
    // Dapp Token Test
    describe('Dapp Token Deployment', async() => {
        it('has-a-name', async() => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })
    // Token Farm Test
    describe('TokenFarming Deployment', async() => {
        it('has-a-name', async() => {
            let name = await tokenFarming.name()
            assert.equal(name, 'DApp Token Farming')
        })
        
        it('contract has tokens', async() => {
            let balance = await dappToken.balanceOf(tokenFarming.address)
            assert.equal(balance.toString(), token('1000000'))
        })
    })

    describe('Farming Tokens', async() => {
        it('rewards stakers for staking FuncTokens', async() => {
            let result

            // Check balance of investor account before staking
            result = await funcToken.balanceOf(investor)
            assert.equal(result.toString(), token('100'), 'Investor FuncToken wallet Balance correct before staking')
            
            // First Approve the Tokens for spending using transferFrom
            await funcToken.approve(tokenFarming.address, token('100'), {from: investor })

            // Stake FuncTokens now
            await tokenFarming.stakeTokens(token('100'), {from : investor})
            
            // Now check the Investor account balance account 
            // (Since all tokens are invested into TokenFarm 
            // so the balance should be zero)
            result = await funcToken.balanceOf(investor)
            assert.equal(result.toString(), token('0'), 'Investor FuncToken wallet Balance correct before staking')

            // Now check TokenFarm balance
            result = await funcToken.balanceOf(tokenFarming.address)
            assert.equal(result.toString(), token('100'), 'Token Farm FuncToken balance correct after staking')
        
            // Check Staking Balance for Investor
            result = await tokenFarming.stakingBalance(investor)
            assert.equal(result.toString(), token('100'), 'Investor staking balance correct after staking')

            // Check Staking status for Investor
            result = await tokenFarming.isStaking(investor)
            assert.equal(result.toString(), 'true', 'Investor staking balance correct after staking')

            // Give Rewards to the Stakers (investors)
            await tokenFarming.rewardStakers({ from: owner })

            // Check balance of Investor after reward issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), token('100'), 'Investor DAppWallet balance correct after reward issuance')
        
            // Only owner can issue rewards
            await tokenFarming.rewardStakers({ from: investor }).should.be.rejected;
  
              // unStake FuncTokens from tokenFarming
              await tokenFarming.unStakeTokens({from : investor})
            
              // Now check the Investor account balance account 
              // (Since all tokens are reverted back to investor account 
              // so the balance should be 100 now)
              result = await funcToken.balanceOf(investor)
              assert.equal(result.toString(), token('100'), 'Investor FuncToken wallet Balance correct before staking')
  
              // Now check TokenFarm balance
              result = await funcToken.balanceOf(tokenFarming.address)
              assert.equal(result.toString(), token('0'), 'Token Farm FuncToken balance correct after staking')
          
              // Check Staking Balance for Investor
              result = await tokenFarming.stakingBalance(investor)
              assert.equal(result.toString(), token('0'), 'Investor staking balance correct after staking')
  
              // Check Staking status for Investor
              result = await tokenFarming.isStaking(investor)
              assert.equal(result.toString(), 'false', 'Investor staking balance correct after staking')

        })
    })
})