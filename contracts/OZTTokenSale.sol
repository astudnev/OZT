pragma solidity 0.4.21;

import 'zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol';
import 'zeppelin-solidity/contracts/lifecycle/Destructible.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';


contract OZTTokenSale is Destructible, Pausable, TimedCrowdsale {


    // minimum amount of OZT tokens, allowed to buy
    uint256 public min_token_amount_sale;
    // minimum amount of ETH, used to buy tokens, derived from min_token_amount_sale
    uint256 public min_wei_amount_sale;

    function OZTTokenSale(  uint256 _openingTime,
                            uint256 _closingTime,
                            uint256 _rate,
                            address _wallet,
                            ERC20 _token,
                            uint256 _min_token_amount_sale
                            )
        TimedCrowdsale( _openingTime,  _closingTime)
        Crowdsale( _rate,  _wallet,  _token) public {
        min_token_amount_sale = _min_token_amount_sale;
        min_wei_amount_sale = _min_token_amount_sale / _rate;
    }

  /**
   * @dev Extend parent behavior requiring to be within contributing period
   * @param _beneficiary Token purchaser
   * @param _weiAmount Amount of wei contributed
   */
  function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal whenNotPaused {
    require(_weiAmount >= min_wei_amount_sale);
    super._preValidatePurchase(_beneficiary, _weiAmount);
  }

  /*
  * @dev destroy contract, send all tokens back to owner
  */
  function destroy() onlyOwner public {
    token.transfer(owner, token.balanceOf(this));
    super.destroy();
  }

  /*
  * @dev destroy contract, send all tokens to recepient
  * @param _recipient Token receiver
  *
  */
  function destroyAndSend(address _recipient) onlyOwner public {
    require(_recipient!=address(0));
    token.transfer(_recipient, token.balanceOf(this));
    super.destroyAndSend(_recipient);
  }


}
