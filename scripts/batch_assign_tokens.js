const cli = require('readline-sync');
const Connection = require('./eth_connection');
const ozt_token = require('../build/contracts/OZTToken.json');
const fs = require('fs');

const environment = 'ropsten'; // ropsten/foundation, change to foundation to deploy to real

var filename = cli.question('Enter full path to CSV file:');

var mnemonics = cli.question('Enter your mnemonics or pkey for '+environment + ': ');
var connection = new Connection(mnemonics, environment);

var deployed_token = connection.web3.eth.contract(ozt_token.abi).at(connection.config.token);

var addresses = [];
var amounts = [];
var defrost_classes = [];

fs.readFile(filename, 'utf8',function(err,data){

   var transfers = data.split('\n');
   var total = 0;

   for(var i=0;i<transfers.length;i++){
       var row = transfers[i].split(',');
       if(row[0].indexOf('0x')!=0)
           continue;
       addresses.push(row[0]);
       amounts.push( parseInt(row[1],10));
       defrost_classes.push(parseInt(row[2],10));
   }

    for(var i=0;i<addresses.length;i++){
       console.log(addresses[i] + ' <- ' + amounts[i] + ' OZT');
        total += amounts[i];
    }

   console.log( "Batch transactions: "+ addresses.length + ', total amount '+ total + ' OZT');

    var gasprice = cli.question('Enter gas price in gwei:');
    var yesno = cli.question('Enter Yes! to make token transfers in '+environment+': ');
    if(yesno!='Yes!'){
        console.log('Not confirmed, stopping');
        process.exit(1);
    }

    deployed_token.batchAssignTokens(addresses, amounts, defrost_classes, {from: connection.address,
            gas: 40000*(addresses.length+1), gasPrice: connection.web3.toWei(gasprice, 'gwei')},
        function(error,result){
            console.log(error, result);
            if(result) {
                connection.close();
                console.log('Done.');
            }
        }
    );

});




