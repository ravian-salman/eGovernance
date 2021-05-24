// SPDX-License-Identifier: MIT
pragma solidity >=0.4.0 <0.9.0;
import "./DappToken.sol";
import "./FuncToken.sol";                                                                                           
contract TokenFarming {
    string public name = "DApp Token Farming";
    DappToken public dappToken;
    FuncToken public funcToken;
    
    address public owner;
    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    constructor(DappToken _dappToken, FuncToken _funcToken) public {
       funcToken = _funcToken;
       dappToken = _dappToken;
       owner = msg.sender;
    }

    // 1. Stake Tokens (Deposit FuncTokens)
    function stakeTokens(uint _stakeValue) public {
        //Transfer FuncTokens to this StakingFarm contract
        funcToken.transferFrom(msg.sender, address(this), _stakeValue);
        
        // Update StakingBalance
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _stakeValue;

        // Add user to the StakerArray only if it hasn't already staked
        if(!hasStaked[msg.sender]) {
           stakers.push(msg.sender);
        }
        
        // Updating staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }
    // 2. Unstake Tokens (Withdraw FuncTokens)
    function unStakeTokens() public {
        // Get the staked token amount
        uint stakedTokens = stakingBalance[msg.sender];

        // Check if tokens are actually staked
        require(stakedTokens>0, 'No tokens are stakes from this account');
        // Transfer back to the tokens to the user
        funcToken.transfer(msg.sender, stakedTokens);

        // Reset the staking balance to zero for this user
        stakingBalance[msg.sender] = 0;

        // Update Staking status to null
        isStaking[msg.sender] = false;
    }

    // 3. Issuing Tokens (Reward DappTokens)
    function rewardStakers() public {
    // Only owner can call this function
        require(msg.sender == owner, "caller must be the owner");

        // Issue tokens to all stakers
        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}       