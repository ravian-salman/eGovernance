import React, {Component} from 'react'
import Web3 from 'web3'
import Navbar from './Navbar'
import Main from './Main'
import DappToken from '../abis/DappToken.json'
import FuncToken from '../abis/FuncToken.json'
import TokenFarming from '../abis/TokenFarming.json'

class App extends Component {
    constructor(props) {
        super(props)
        this.state = {
            account: '0x0',
            dappToken: {},
            funcToken: {},
            tokenFarming: {},
            dappTokenBalance: '0',
            funcTokenBalance: '0',
            stakingBalance: '0',
            loading: true
        }
    }    

    // Check if Blockchain is connected
    async componentWillMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    // Connect to the Blockchain using Web3 
    async loadWeb3() {
        if(window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        }
        else if(window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        else{
            window.alert('Non-Ethereum Browser detected')
        }
    }

    // Load Blockchain data 
    async loadBlockchainData() {
        const web3 = window.web3
        
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0]})
        
        // To get the Network you are connected with
        const networkID = await web3.eth.net.getId()
        console.log(networkID)

        // Load FuncToken 
        const funcTokenData = FuncToken.networks[networkID]
        if(funcTokenData) {
            // Get web3 version of funcToken SmartContract
            const funcToken = await new web3.eth.Contract(
                FuncToken.abi, funcTokenData.address
            )
            this.setState({ funcToken })
            console.log(funcToken)
            let funcTokenBalance = await funcToken.methods.balanceOf(
                this.state.account).call()
                console.log(funcTokenBalance.toString())
            this.setState({ funcTokenBalance: funcTokenBalance.toString() })
   
        } else {
            window.alert('FuncToken contract is not deployed on this network')
        }

        // Load DappToken 
        const dappTokenData = DappToken.networks[networkID]
        if(dappTokenData) {
            // Get web3 version of funcToken SmartContract
            const dappToken = await new web3.eth.Contract(
                DappToken.abi, dappTokenData.address
            )
            this.setState({ dappToken })
            console.log(dappToken)
            let dappTokenBalance = await dappToken.methods.balanceOf(
                this.state.account).call()
                console.log(dappTokenBalance.toString())
            this.setState({ dappTokenBalance: dappTokenBalance.toString() })
   
        } else {
            window.alert('DappToken contract is not deployed on this network')
        }        

        // Load TokenFarming 
        const tokenFarmingData = TokenFarming.networks[networkID]
        if(tokenFarmingData) {
            // Get web3 version of funcToken SmartContract
            const tokenFarming = await new web3.eth.Contract(
                TokenFarming.abi, tokenFarmingData.address
            )
            this.setState({ tokenFarming })
            console.log(tokenFarming)
            let stakingBalance = await tokenFarming.methods.stakingBalance(
                this.state.account).call()
                console.log(stakingBalance.toString())
            this.setState({ stakingBalance: stakingBalance.toString() })
   
        } else {
            window.alert('TokenFarming contract is not deployed on this network')
        }

        this.setState({ loading:false })
    }
    // for staking
    stakeTokens = (amount) => {
        this.setState({ loading: true })
        this.state.funcToken.methods.approve(this.state.tokenFarming._address, amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
          this.state.tokenFarming.methods.stakeTokens(amount).send({ from: this.state.account }).on('transactionHash', (hash) => {
            this.setState({ loading: false })
          })
        })
      }
    //For Unstaking
    unStakeTokens = (amount) => {
        this.setState({ loading: true })
        this.state.tokenFarming.methods.unStakeTokens().send({ from: this.state.account }).on('transactionHash', (hash) => {
          this.setState({ loading: false })
        })
    }
    
    

    render() {
        let pageContent 
        if(this.state.loading) {
            pageContent = <p id="loader" className="text-center"> Loading... </p>
        } else {
            // Load data into Main Component
            pageContent = <Main 
                funcTokenBalance = {this.state.funcTokenBalance}
                dappTokenBalance = {this.state.dappTokenBalance}
                stakingBalance = {this.state.stakingBalance}
                stakeTokens = {this.stakeTokens}
                unStakeTokens = {this.unStakeTokens}
            />
        }
        return (
            <div> 
                <Navbar account = {this.state.account}/>
                <br />
                <br />
                {pageContent}
            </div>
        )
    }
}
export default App