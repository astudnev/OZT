const path = require('path');
const fs = require('fs');


const OZTToken = require('../../build/contracts/OZTToken.json');
const Web3 = require('web3');

// LOAD PARAMETERS --------------------------------
const ETHNODE_FILEPATH = path.resolve(__dirname) + '/PARAMS/ethereum_node.txt'
const PWD_FILEPATH = path.resolve(__dirname) + '/PARAMS/owner_pwd.txt'
const ACCOUNTSAMOUNTS_FILEPATH = path.resolve(__dirname) + '/OUTPUTS/generated_input_accounts_amounts.txt'
const CONTRACTADDRESS_FILEPATH = path.resolve(__dirname) + '/OUTPUTS/smart-contract-address.txt'

// set parameters -------------------------------------------------
var urlEthereumNode = require('fs').readFileSync(ETHNODE_FILEPATH, 'utf-8')
var ownerPassword = require('fs').readFileSync(PWD_FILEPATH, 'utf-8')
var contractAddress = require('fs').readFileSync(CONTRACTADDRESS_FILEPATH, 'utf-8')
console.log('urlEthereumNode = ' + urlEthereumNode)
console.log('ownerPwd = ' + ownerPassword)
console.log('filePathAccountsAmounts = ' + ACCOUNTSAMOUNTS_FILEPATH)
console.log('contractAddress = ' + contractAddress)

let web3 = new Web3(new Web3.providers.HttpProvider(urlEthereumNode))
console.log('Web3 OK')

var oztContract = web3.eth.contract(OZTToken.abi).at(contractAddress);

//web3.personal.unlockAccount(web3.eth.accounts[0], ownerPassword)
console.log('unlockAccount OK')
web3.eth.defaultAccount = web3.eth.accounts[0];

console.log('')

//var vaddr = []
//var vamounts = []
//var viced = []
var lines = require('fs').readFileSync(ACCOUNTSAMOUNTS_FILEPATH, 'utf-8').split('\n');

var vmatchOK = []
var vmatchErr = []
var totalAssigned = parseInt(0)

var dict = [];
var dictIced = [];
var multDecimals = 1000000000000000000


var vmatchOK = []
var vmatchErr = []
var totalAssignedOnFile = 0
var totalAssignedOnEth = 0
for (var i=0; i<lines.length; i++) {
  var vv = lines[i].split(",");
  if(vv.length == 3){   
    var userAddress = vv[0];    
    var userAmount = vv[1] * multDecimals; // decimals = 18
    dict[userAddress] = userAmount;    
    var classInvestor = parseInt(vv[2]);

    console.log(userAddress  + " - classInvestor = " + classInvestor )

    if(classInvestor == 1 ){ // iced only (reserve and team + advisors)
        
        totalAssignedOnFile += parseInt(vv[1]);
        oztContract.getAddressAndBalance.call(userAddress, function(error, result){

            if (!error) {

                retAddress = result[0];
                retAmount = result[1];

                console.log("getAddressBalance called : " + retAmount + " tokens found for " + retAddress+ " ----  good = " + dict[retAddress]); 

                if( retAmount == dict[retAddress] ){
                    totalAssignedOnEth += (retAmount / multDecimals)
                    var strOk = retAddress + "  -  AMOUNT MATCHING OK = " + retAmount + " ->  numTokensAssigned = " + totalAssigned;                    
                    vmatchOK.push(strOk)
                }else{
                    var strErr = "!!!!  ERROR ERROR ERROR:  " + dict[retAddress] + "  -  amount MISMATCH ERROR = " + retAmount;
                    console.log(strErr)
                    vmatchErr.push(strErr)
                }
            } else {
                console.log(error);
            }
        });
    }
   
  }
}

const NUMTOKENSENT_FILEPATH = path.resolve(__dirname) + '/OUTPUTS/generated_number_of_tokens.txt'
var sentNumberOfToken = parseInt(require('fs').readFileSync(NUMTOKENSENT_FILEPATH, 'utf-8'))
sentNumberOfToken = sentNumberOfToken;

var cnt=0
var waitTimerID = setInterval(function() {
        if(cnt==0){console.log('')}
        if(totalAssignedOnFile === totalAssignedOnEth){
            
            console.log('')
            console.log('CHECK OK : all tokens were correctly assigned')
            vmatchOK.forEach(function(item) {
                console.log(item);
            });
            console.log('')
            console.log('CHECK NUMBER of TOKEN OK: SENT = ' + totalAssignedOnEth + ' - READ in blockchain = ' + totalAssignedOnFile );
            console.log('')
            console.log('END -----------------------------------------------')
            clearInterval(waitTimerID)
        }else{
            console.log('check in progress please wait... => ' + totalAssignedOnEth + ' of '+ totalAssignedOnFile);
        }        
        cnt++;
}, 2000);


