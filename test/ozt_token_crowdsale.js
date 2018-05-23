var OZTToken = artifacts.require("OZTToken");
var OZTTokenSale = artifacts.require("OZTTokenSale");

function delay(t) {
    return new Promise(function(resolve) {
        setTimeout(resolve, t)
    });
}

contract('OZTTokenSale', function(accounts) {

    var owner = accounts[0];

    it("should be deployed", function (done) {

        OZTTokenSale.deployed().then(function (instance) {
            assert.isTrue(!!instance.address);
        }).then( function(){
            return delay(5000); // delay because the crowdsale starts in 3 seconds
        }).then( function(){
            done();
        });

    });


    it("should have all properties set up", function (done) {

        var crowdsale, token, rate;

        OZTTokenSale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            assert.isTrue(!!instance);
            return crowdsale.token();
        }).then( function(result){
            token = result;
            return OZTToken.deployed();
        }).then( function(instance){
            assert.equal(instance.address, token);
            return crowdsale.wallet();
        }).then( function(result){
            assert.equal(result, '0xddfe42ddb9c406b9143d85f294583e0f1c00c223');
            return crowdsale.rate();
        }).then( function(result){
            rate = result.toNumber();
            assert.isTrue(rate>0);
            return crowdsale.weiRaised();
        }).then( function(result){
            assert.equal(0, result.toNumber());
            return crowdsale.owner();
        }).then( function(result){
            assert.equal(owner, result);
            return crowdsale.paused();
        }).then( function(result){
            assert.equal(false, result);
            return crowdsale.min_token_amount_sale();
        }).then( function(result){
            assert.equal(1000*1e18, result.toNumber());
            return crowdsale.min_wei_amount_sale();
        }).then( function(result){
            assert.equal(1000*1e18/rate, result.toNumber());
            done();
        });

    });

    it("should have tokens to sell", function (done) {

        var crowdsale, token;

        var amount = 70*1e6*1e18;
        OZTTokenSale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            token = OZTToken.at(instance);
            return token.transfer(crowdsale.address, amount, {from: owner});
        }).then( function(){
            return token.balanceOf(crowdsale.address);
        }).then( function(result){
            assert.equal(result.toNumber(), amount);
            done();
        });

    });

    it("should sell tokens", function (done) {

        var crowdsale, token, rate;
        const purchaser = accounts[1];
        const amt = web3.toWei(0.3, "ether");

        OZTTokenSale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            token = OZTToken.at(instance);
            return token.balanceOf(purchaser);
        }).then( function(value){
            assert.equal(0, value.toNumber());
            return crowdsale.rate();
        }).then( function(result){
            rate = result.toNumber();
            return crowdsale.sendTransaction({from: purchaser, value: amt, gas: 150000});
        }).then( function(result){
            var log = result.logs[0];

            assert.equal(log.event, 'TokenPurchase');
            assert.equal(log.address , crowdsale.address);
            assert.equal(log.args.value.toNumber() , amt);
            assert.equal(log.args.amount.toNumber() , amt*rate);
            assert.equal(log.args.beneficiary, purchaser);
            assert.equal(log.args.purchaser, purchaser);

            return token.balanceOf(purchaser);
        }).then( function(value){
            assert.equal(value, amt*rate);
            return crowdsale.weiRaised();
        }).then( function(value){
            assert.equal(value, amt);
            done();
        });

    });

    /*
    it("should grant bonus tokens to affiliate", function (done) {

        var crowdsale, token, token_balance, cpa_token, cpa_token_balance;
        const purchaser = accounts[0];
        const affiliate = accounts[4];

        const amt = web3.toWei(0.00006, "ether");

        CpaCrowdsale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            token = MintableToken.at(instance);
            return token.balanceOf(purchaser);
        }).then( function(value){
            token_balance = value.toNumber();
            return crowdsale.cpa_token();
        }).then( function(instance){
            cpa_token = MintableBonusToken.at(instance);
            return cpa_token.balanceOf(affiliate);
        }).then( function(value){
            cpa_token_balance = value.toNumber();
            return crowdsale.sendTransaction({from: purchaser, value: amt, gas: 150000, data: affiliate});
        }).then( function(result){
            return token.totalSupply();
        }).then( function(value){
            assert.equal(value.toNumber(), parseInt(amt) + parseInt(token_balance));
            return cpa_token.balanceOf(affiliate);
        }).then( function(value){
            assert.equal(value.toNumber(), cpa_token_balance + amt);
            done();
        });

    });
*/
});
