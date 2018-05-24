const cli = require('readline-sync');
const Connection = require('./eth_connection');
const token_sale = require('../build/contracts/OZTTokenSale.json');
const request = require('request');
const fs = require('fs');

const environment = 'ropsten';

var mnemonics = cli.question('Enter your mnemonics or pkey for '+environment + ': ');
var connection = new Connection(mnemonics, environment);

var deployed_token_sale = connection.web3.eth.contract(token_sale.abi).at(connection.config.sale);

var amount = cli.question('Enter amount of tokens to transfer FROM TOKENSALE in '+environment + ': ');
var destination = cli.question('Enter destination to transfer '+connection.web3.toWei(amount)+' WEI to : ');

var gasprice = cli.question('Enter gas price in gwei:');
var yesno = cli.question('Enter Yes! to transfer tokens FROM TOKENSALE in '+environment+ ' with these parameters: ');
if(yesno!='Yes!'){
    console.log('Not confirmed, stopping');
    process.exit(1);
}
console.log('generating now...');

deployed_token_sale.transferTokens.sendTransaction(
            destination,
            connection.web3.toWei(amount) , {
        from: connection.address,
        gas: 80000,
        gasPrice: connection.web3.toWei(gasprice, 'gwei')},
    function(error, result){
        console.log(error, result);
        if(result) {
            connection.close();
            console.log('Done.');
        }
    }
);