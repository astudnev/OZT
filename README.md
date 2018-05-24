# OZT Smart Contracts

The project contains:

1) OZT Token Smart Contract
2) OZT Crowdsale Smart Contract
3) Supporting scripts


### OZT Token Smart Contract

OZT token is standard ERC-20 token with 18 decimals. 
 
Sources are located in [OZTToken.sol](contracts/OZTToken.sol).

### TokenSale Smart Contract
 
It allows token sale to accept payments, distribute tokens. 

Sources are located in [OZTTokenSale.sol](contracts/OZTTokenSale.sol).


### Production ( Ethereum Foundation network) deployment scripts

Note:  scripts are to be run by the contract's owner

**node script/transfer_tokens** - transfer tokens from the OZT Token owner to address

**node script/batch_assign_tokens** - distribute tokens from the OZT Token owner to the list of addresses from CSV file


## Deployed Addresses

### Foundation Blockchain Network

* OZT Token: [0x9aa9bab278c0ed84c104915bce9b5a9c1b96c4bf](http://bloxy.info/address/0x9aa9bab278c0ed84c104915bce9b5a9c1b96c4bf)

### Ropsten Blockchain Network

* OZT Token: [0xc47f91d5acc5bc644bb2829c4ecd49a8c2dd7f1c](https://ropsten.etherscan.io/token/0xc47f91d5acc5bc644bb2829c4ecd49a8c2dd7f1c)   

# Notes for Developers

## Installation

```
npm install -g ethereumjs-testrpc
npm install -g truffle
npm install -g web3-provider-engine
npm install -g ethereumjs-wallet
```

## Running tests

Tests can be run using Test RPC. Run it with command

```
testrpc -m "warrior minimum breeze raven garden express solar flavor obvious twenty alpha actress"
```

Alternatively you can use [Ganache](https://github.com/trufflesuite/ganache-cli):

```
npm install -g ganache-cli
ganache-cli
```

After server started, you can compile, run migrations and tests


```
$ truffle test
Using network 'development'.

  Contract: OZTTokenSale
    ✓ should be deployed (5003ms)
    ✓ should have all properties set up (147ms)
    ✓ should have tokens to sell (88ms)
    ✓ should sell tokens (161ms)
    ✓ should transfer tokens manually (87ms)
    ✓ should allow transfer tokens manually only to owner (154ms)
    ✓ should pause / resume (163ms)
    ✓ should allow pause only to owner
    ✓ should not sell after finish (5005ms)


  9 passing (11s)


```

## Executing scripts

Crowdsale contract deployment and management scripts are located in script directory.
They are called as node scripts:

```
npm install
node script/transfer_tokens
```

Every script contains variable, defining the environment to run: 
```
const environment = 'ropsten'; // ropsten/foundation, change to foundation to deploy to real
```

Configuration in script/config.js contains all properties for selected environment.

On script run, it asks for credentials, and asks to enter word 'Yes!' before actual execution. After successfull run, it logs the hash of transaction,
that should be looked up in ethereum explorer.

   
## Note on truffle console usage

Use the callback to get deployed instance of contract, as:
```
truffle console --network development
truffle(development)> OZTToken.deployed().then(function(instance){ ozt=instance})
truffle(development)> ozt.name()
```

When using direct address it is not needed:
```
truffle console --network production
truffle(production)> OZTToken.at('0x9aa9bab278c0ed84c104915bce9b5a9c1b96c4bf').name()
```

## Validating contract sources

[solidity_flattener](https://github.com/BlockCatIO/solidity-flattener) generates full sources.
Note, that the unsupported parameter --allow-paths required, Before it is integrated into release of solidity_flattener,
use the installation from branch:
```
npm install -g solc
pip install git+https://github.com/dostu/solidity-flattener.git
```

Then execute:

```
solidity_flattener --output build/src/OZTToken_flat.sol contracts/OZTToken.sol
solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --output build/src/OZTTokenSale_flat.sol contracts/OZTTokenSale.sol

```