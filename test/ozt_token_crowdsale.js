var OZTToken = artifacts.require("OZTToken");
var OZTTokenSale = artifacts.require("OZTTokenSale");

function delay(t) {
    return new Promise(function(resolve) {
        setTimeout(resolve, t)
    });
}

contract('OZTTokenSale', function(accounts) {

    var owner = accounts[0];
    var total_amount = 70*1e6*1e18;

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

        OZTTokenSale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            token = OZTToken.at(instance);
            return token.transfer(crowdsale.address, total_amount, {from: owner});
        }).then( function(){
            return token.balanceOf(crowdsale.address);
        }).then( function(result){
            assert.equal(result.toNumber(), total_amount);
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
            return token.balanceOf(crowdsale.address);
        }).then( function(value){
            assert.equal(value, total_amount-amt*rate);
            done();
        });

    });

    it("should transfer tokens manually", function (done) {

        var crowdsale, token;
        const purchaser = accounts[2];
        const amount = web3.toWei(1, "ether");

        OZTTokenSale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            token = OZTToken.at(instance);
            return token.balanceOf(purchaser);
        }).then( function(value){
            assert.equal(0, value.toNumber());
            return crowdsale.transferTokens(purchaser, amount, {from: owner});
        }).then( function(result){
            return token.balanceOf(purchaser);
        }).then( function(value){
            assert.equal(value, amount);
            done();
        });
    });


    it("should allow transfer tokens manually only to owner", function (done) {

        var crowdsale, token;
        const purchaser = accounts[2];
        const amount = web3.toWei(1, "ether");

        OZTTokenSale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            token = OZTToken.at(instance);
            return crowdsale.transferTokens(purchaser, amount, {from: purchaser});
        }).then( function(){
            assert.fail("Exception expected");
        }).catch(function(error) {
            done();
        });
    });


    it("should pause / resume", function (done) {

        var crowdsale, token, rate;
        const purchaser = accounts[3];
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
            return crowdsale.pause({from: owner});
        }).then( function(result){
            return crowdsale.sendTransaction({from: purchaser, value: amt, gas: 150000});
        }).then( function(){
            assert.fail("Exception expected");
        }).catch(function(error) {
            return crowdsale.unpause({from: owner});
        }).then( function(result){
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
            done();
        });

    });

    it("should allow pause only to owner", function (done) {

        var crowdsale;
        const purchaser = accounts[2];

        OZTTokenSale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.pause({from: purchaser});
        }).then( function(){
            assert.fail("Exception expected");
        }).catch(function(error) {
            done();
        });
    });


    it("should not sell after finish", function (done) {

        var crowdsale;
        const purchaser = accounts[5];

        OZTTokenSale.deployed().then(function (instance) {
            crowdsale = instance;
            return delay(5000); // delay because the crowdsale finish in 10 seconds
        }).then( function(){
            return crowdsale.sendTransaction({from: purchaser, value: amt, gas: 150000});
        }).then( function(){
            assert.fail("Exception expected");
        }).catch(function(error) {
            done();
        });

    });


});
