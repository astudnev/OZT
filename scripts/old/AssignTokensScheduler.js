const fs = require('fs');
const path = require('path');

function AssignObject(chunkSize, fpath, interval, contractaddr, pwd) {
    this.chunkSize = parseInt(chunkSize)
    this.filePath = fpath
    this.intervalSec = parseInt(interval)
    this.contractaddress = contractaddr
    this.accountpwd = pwd
}

const ETHNODE_FILEPATH = path.resolve(__dirname) + '/PARAMS/ethereum_node.txt'
const PWD_FILEPATH = path.resolve(__dirname) + '/PARAMS/owner_pwd.txt'
const CHUNKSIZE_FILEPATH = path.resolve(__dirname) + '/PARAMS/chunk_size.txt'
const ACCOUNTSAMOUNTS_FILEPATH = path.resolve(__dirname) + '/OUTPUTS/generated_input_accounts_amounts.txt'
const INTERVALSEC_FILEPATH = path.resolve(__dirname) + '/PARAMS/assign_interval_sec.txt'
const CONTRACTADDRESS_FILEPATH = path.resolve(__dirname) + '/OUTPUTS/smart-contract-address.txt'

var urlEthereumNode = require('fs').readFileSync(ETHNODE_FILEPATH, 'utf-8')
var ownerPassword = require('fs').readFileSync(PWD_FILEPATH, 'utf-8')
var chunkSize = require('fs').readFileSync(CHUNKSIZE_FILEPATH, 'utf-8')
var assignIntervalSec = parseInt(1000 * require('fs').readFileSync(INTERVALSEC_FILEPATH, 'utf-8'))
var contractAddress  = require('fs').readFileSync(CONTRACTADDRESS_FILEPATH).toString();

console.log('-----------------------------------------------------')
console.log('urlEthereumNode = ' + urlEthereumNode)
console.log('ownerPwd = ' + ownerPassword)
console.log('chunkSize = ' + chunkSize)
console.log('filePathAccountsAmounts = ' + ACCOUNTSAMOUNTS_FILEPATH)
console.log('assignIntervalSec = ' + assignIntervalSec)
console.log('contractAddress = ' + contractAddress)
console.log('-----------------------------------------------------')

objAssignParams = new AssignObject(chunkSize,ACCOUNTSAMOUNTS_FILEPATH,assignIntervalSec,contractAddress, ownerPassword);

console.log('contractaddress =  ' + objAssignParams.contractaddress + ' owner pwd = ' + objAssignParams.accountpwd );

const OZTToken = require('../../build/contracts/OZTToken.json');

const MNEMONICS_FILEPATH = path.resolve(__dirname) + '/PARAMS/mnemonics.txt'
const Web3 = require('web3')
const ProviderEngine = require('web3-provider-engine');
const Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
const WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
const HDKey = require('ethereumjs-wallet/hdkey');
var eth = require('ethereumjs-wallet');
const BIP39 = require('bip39');

var mnemonics = require('fs').readFileSync(MNEMONICS_FILEPATH, 'utf-8')
var wallet = HDKey.fromMasterSeed(BIP39.mnemonicToSeed(mnemonics)).derivePath("m/44'/60'/0'/0/0").getWallet();

var engine = new ProviderEngine();

engine.addProvider(new WalletSubprovider(wallet, {}));
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(urlEthereumNode)));
engine.start();

var web3 = new Web3(engine);

console.log('Web3 OK, connected to '+wallet.getAddressString());




var ACTIONS_PATH = "./ACTIONS"
var LOGS_PATH = "./LOGS/"

var oztContract = web3.eth.contract(OZTToken.abi).at(contractAddress);


// read account/amounts file to assign -------------------------------------------------
vAccounts  = require('fs').readFileSync(ACCOUNTSAMOUNTS_FILEPATH).toString().split('\n')
console.log('NUM ACCOUNTS = ' + vAccounts.length)

// launch assign timer  ----------------------------------------------------------------
console.log('intervalSec = ' + assignIntervalSec)
assignTimerId = setInterval(timerAssignFunction, assignIntervalSec);

var cntTimer = parseInt(0)
function timerAssignFunction() {

        console.log('timerAssignFunction scheduler call ............................. cntTimer = ' + cntTimer)
        var numToSend = parseInt(0)
        var from = parseInt(cntTimer * objAssignParams.chunkSize)
        var to = parseInt(from) + parseInt(objAssignParams.chunkSize)
        console.log('from = ' + from + '  -  to = ' + to)

        if( from >= vAccounts.length){
            console.log('timer stopped //////////////////////////////////');
            clearInterval(assignTimerId);
        }
        // fill address/amounts arrays
        var vaddr = []
        var vamounts = []
        var vclass = []
        for(i=from;i<to;i++){

            // check the end 
            if(i>=vAccounts.length){
                // stop timer
                console.log('timer stopped //////////////////////////////////');
                clearInterval(assignTimerId);
                break;

            }else{

                //console.log('vAccounts[i] = ' + vAccounts[i] + '  - numToSend = ' + numToSend)
                var vv = vAccounts[i].split(",");
                if(vv.length == 3){
                    vaddr.push(vv[0]);
                    vamounts.push(parseInt(vv[1]));
                    vclass.push(parseInt(vv[2]));
                    //console.log(numToSend + ' => addr='+vv[0] + ' amount=' + vv[1] + ' class=' + vv[2])
                    numToSend++;
                }/*else{
                    console.log('Fatal error in data format')
                    numToSend = -1;
                    break;
                }*/
            }
        }

        console.log('numToSend = ' + numToSend + '  - vaddr.length = '+vaddr.length + '  -  vamounts.length = '+  vamounts.length);
        if(numToSend === vaddr.length && numToSend === vamounts.length && numToSend == vclass.length)
        {
              console.log('calling timerAssignFunction ....... ');
              console.log('param =  ' + objAssignParams.contractaddress + ' ' + objAssignParams.accountpwd +' ' + numToSend);
              
              var numSent = sendAssignChunkToSmartContract(objAssignParams.contractaddress,objAssignParams.accountpwd,
                                                      vaddr, vamounts, vclass, numToSend);
              console.log("...END -> cntTimer = " + cntTimer)
        }
        else{
          console.log('Fatal error: numToSend / size arrays mismatch ')
        }
        
        cntTimer++;
        console.log('.......................................................................')
}


function sendAssignChunkToSmartContract(contractAddress, accountPwd, vaddr, vamounts, vclass, numToSend) {

    console.log("into sendAssignChunkToSmartContract ...");
    dataparam = oztContract.batchAssignTokens.getData(vaddr, vamounts, vclass)
    //console.log("dataparam = " + dataparam );
    /*var estimatedGas = web3.eth.estimateGas({data: dataparam, gas: 99000})    
    //console.log("estimatedGas = " + estimatedGas );
    //estimatedGas = estimatedGas + 5000;

    gasLimit = web3.eth.getBlock("latest").gasLimit
    console.log("gasLimit = " + gasLimit);

    gasOk=0 
    if(estimatedGas  < gasLimit){
      gasOk=estimatedGas;
    }else{
      gasOk=gasLimit;
    }
    console.log("gasOk = " + gasOk );*/

    oztContract.batchAssignTokens(vaddr, vamounts, vclass, { gas: 999000, from: wallet.getAddressString() },  function(error, result){
            if (!error) {
                console.log("batchAssignTokens2Arrays OK:" + result);  // OK
            } else {
                console.log("Error: " + error); 
            }
    });
}

