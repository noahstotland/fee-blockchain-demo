import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import DeloitteNFT from '../abis/DeloitteNFT.json';

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. Use MetaMask')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId();
    const networkData = DeloitteNFT.networks[networkId];

    if (networkData) {
      const abi = DeloitteNFT.abi;
      const address = networkData.address;
      const contract = new web3.eth.Contract(abi, address);
      this.setState({ contract });
      const totalSupply = await contract.methods.totalSupply().call();
      this.setState({ totalSupply });

      const contractOwner = await contract.methods.owner().call();
      this.setState({ contractOwner });
      for (var i = 1; i <= totalSupply; i++) {
        const link = await contract.methods.deloitteNFTLinks(i - 1).call();
        const metaDataLink = await contract.methods.tokenURI(i).call();
        this.setState({
          links2: [...this.state.links2, link],
          metaDataLinks: [...this.state.metaDataLinks, metaDataLink]
        });
      }

      const tokensOwnedByCurrentWallet = await contract.methods.tokensOfOwner(this.state.account).call();
      console.log(tokensOwnedByCurrentWallet);
      if (tokensOwnedByCurrentWallet) {
        tokensOwnedByCurrentWallet.forEach(async ownedToken => {
          const ownedTokenContentLink = await contract.methods.deloitteNFTLinks(ownedToken._hex - 1).call();
          const ownedTokenMetadataLink = await contract.methods.tokenURI(ownedToken._hex).call();
          this.setState({
            ownedTokenContentLinks: [...this.state.ownedTokenContentLinks, ownedTokenContentLink],
            ownedTokenMetadataLinks: [...this.state.ownedTokenMetadataLinks, ownedTokenMetadataLink]
          });
        });
        this.setState({ tokensOwnedByCurrentWallet })
      }
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }
  }


  mint = (contentLink, metaDataLink) => {
    this.state.contract.methods.mint(contentLink, metaDataLink).send({ from: this.state.account }, (receipt) => {
      this.setState({
        links2: [...this.state.links2, contentLink]
      });
    });
  }

  transfer = (receiverAddress, tokenIdToSend) => {
    console.log(this.state.account, receiverAddress, tokenIdToSend);
    this.state.contract.methods.safeTransferFrom(this.state.account, receiverAddress, tokenIdToSend).send({ from: this.state.account });
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      contract: null,
      totalSupply: 0,
      links2: [],
      metaDataLinks: [],
      contractOwner: null,
      tokensOwnedByCurrentWallet: [],
      ownedTokenContentLinks: [],
      ownedTokenMetadataLinks: []
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="hello"
            target="_blank"
            rel="noopener noreferrer"
          >
            Deloitte NFTs
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white"><span id="account">Contract owner: {this.state.contractOwner}</span></small>
            </li>
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-white"><span id="account">Current wallet: {this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div>
        </div>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1>Issue a DeloitteNFT</h1>
                <h2>Enter a link to content and metadata</h2>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const link = this.link.value;
                  const metaData = this.metaData.value
                  this.mint(link, metaData);
                }}>
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='content link'
                    ref={(input) => { this.link = input }}
                  />
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='metadata link'
                    ref={(input) => { this.metaData = input }}
                  />
                  <input
                    type='submit'
                    className='btn btn-block btn-primary'
                    value='Mint'
                  />
                </form>
              </div>
            </main>
          </div>
          <hr />
          <h3>List of all DeloitteNFT's in circulation:</h3>
          <div className="row text-center">
            {this.state.links2.map((link, key) => {
              return (
                <div key={key} className="nft-card col-md-3 mb-3">
                  <div>Deloitte NFT #{key + 1}</div>
                  <div className="dltnft">link to content: {link}</div>
                  <div className="dltnft">link to metadata: {this.state.metaDataLinks[key]} </div>
                </div>
              )
            })}
          </div>
          <br/>
          <br/>
          <h3>
            Deloitte NFTs owned by the current wallet
            </h3>
          <div>
            {
              this.state.ownedTokenContentLinks.map((ownedToken, index) => {
                return (<div className="nft-card">
                  <p>content: {ownedToken}</p>
                  <img alt='deloittenftimg' src={ownedToken}/>
                  <p>link to metadata: {this.state.ownedTokenMetadataLinks[index]}</p>
                </div>);
              })
            }
          </div>
        </div>
        <div className="container-fluid mt-5">
          <h1>Transfer a DeloitteNFT</h1>
          <h3>Enter receiver's wallet address and the id of the DeloitteNFT you'd like to transfer</h3>
          <div>
            <form onSubmit={(event) => {
              event.preventDefault()
              const receiverAddress = this.receiverAddress.value;
              const tokenIdToSend = this.tokenIdToSend.value;
              this.transfer(receiverAddress, tokenIdToSend);
            }}>
              <input
                type='text'
                className='form-control mb-1'
                placeholder='receivers wallet address'
                ref={(input) => { this.receiverAddress = input }}
              />
              <input
                type='text'
                className='form-control mb-1'
                placeholder='token id to send'
                ref={(input) => { this.tokenIdToSend = input }}
              />
              <input
                type='submit'
                className='btn btn-block btn-primary'
                value='Transfer'
              />
            </form>
          </div>
        </div>

      </div>
    );
  }
}


export default App;
