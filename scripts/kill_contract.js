const cli = require('readline-sync');
const Connection = require('./eth_connection');
const ozt_token = require('../build/contracts/OZTToken.json');

const environment = 'ropsten'; // only at ropsten we generate tokens manually

var mnemonics = cli.question('Enter your mnemonics or pkey for '+environment + ': ');
var connection = new Connection(mnemonics, environment);

var address = cli.question('Enter contract to kill : ');

var contract_to_kill = connection.web3.eth.contract(ozt_token.abi).at(address);


var gasprice = cli.question('Enter gas price in gwei:');
var yesno = cli.question('Enter Yes! to continue in '+environment+ ' with these parameters: ');
if(yesno!='Yes!'){
    console.log('Not confirmed, stopping');
    process.exit(1);
}
console.log('killing now...');

contract_to_kill.killContract.sendTransaction({
        from: connection.address,
        gas: 100000,
        gasPrice: connection.web3.toWei(gasprice, 'gwei')},
    function(error, result){
        console.log(error, result);
        if(result) {
            connection.close();
            console.log('Done.');
        }
    }
);