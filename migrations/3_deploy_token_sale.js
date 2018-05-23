var OZTToken = artifacts.require("./OZTToken.sol");
var OZTTokenSale = artifacts.require("./OZTTokenSale.sol");

module.exports = function(deployer, network) {

    var token;
    deployer.then(function() {
        return OZTToken.deployed();
    }).then(function(instance) {
        token = instance;

        var openingTime, closingTime;
        var now = new Date().getTime()/1000;
        switch(network){
            case 'development':
                openingTime = now + 3;
                closingTime = now + 30;
                break;
            case 'ropsten':
                openingTime = now + 60;
                closingTime =  Date.parse('2018-06-09 00:00 GMT').getTime();
                break;
            case 'foundation':
                openingTime = Date.parse('2018-05-26 00:00 GMT').getTime();
                closingTime =  Date.parse('2018-06-09 00:00 GMT').getTime();
                break;
        }


        return deployer.deploy(OZTTokenSale,
            openingTime,                                   //uint256 _openingTime,
            closingTime,                                   //uint256 _closingTime,
            5269,                                           //uint256 _rate,
            '0xDDFe42ddB9C406B9143d85F294583E0F1c00c223',   //address _wallet,
            token.address,                                  //ERC20 _token,
            1000*1e18                                       // uint256 _min_token_amount_sale
            );


    }).then(function() {
        console.log('OZTTokenSale deployed at ' + OZTTokenSale.address + ' for token '+OZTToken.address)
    });
};
