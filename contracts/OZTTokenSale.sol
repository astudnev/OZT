pragma solidity 0.4.21;

import 'zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol';
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

/**
 * @title Crowdsale for OZT token
 * @dev the crowdsale is based on Open Zeppelin implementation, adding the following functionality:
 *   1) it is limited in time
 *   2) owner can pause and resume the crowdsale if needed
 *   3) the minimum amount of single sale is limited
 *   4) tokens can be transfered to the recipient. It is used for 2 cases:
 *     4.1) when buyer pay other cuurrency (BTC/LTC), he provides the ethereum wallet and the tokens are manualy transfered during the token
 *       sale or after it
 *     4.2) after the finish of crowdsale all unsold tokens are transfered to owner
 *
 *  To use the crowdsale, the following procedure applied:
 *   1) contract is deployed, specifying time range, token address, rate ( token price ), wallet and minimum token same amount.
 *   2) tokens in the amount of token sale volume are transfered to the contract
 */
contract OZTTokenSale is Pausable, TimedCrowdsale {


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
  * @dev transfer tokens
  * @param _to token receiver
  * @param _value token amount
  */
  function transferTokens(address _to, uint256 _value) onlyOwner public {
    token.transfer(_to, _value);
  }



}
