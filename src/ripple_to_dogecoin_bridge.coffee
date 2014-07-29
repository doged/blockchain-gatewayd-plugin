DogecoinAddressValidator = require "#{__dirname}/dogecoin_address_validator"

class RippleToDogecoinBridge
  constructor: (@dogecoinAddress, @gatewayd) -> 
    if not @dogecoinAddress
      error = new Error
      error.field = "dogecoinAddress"
      error.message = "invalid dogecoin address"
      return error

  _validateDogecoinAddress: (callback) ->
    dogecoinAddressValidator = new DogecoinAddressValidator @gatewayd
    dogecoinAddressValidator.validate @dogecoinAddress, callback

  _getDogecoinAddressRecord: (callback) ->
    @gatewayd.data.models.externalAccounts.findOrCreate(
      name: @dogecoinAddress
    ).complete callback

  getRippleAddress: (callback) -> 
    @_validateDogecoinAddress (error, isvalid) => 
      if error or not isvalid 
        error = new Error
        error.field = "dogecoinAddress"
        error.message = "invalid dogecoin address"
        callback error, null
      else 
        @gatewayd.data.models.externalAccounts.findOrCreate(
          name: @dogecoinAddress,
          user_id: 0
        ).complete (error, externalAccount) =>
          callback error,
            address: @gatewayd.config.get('COLD_WALLET')
            tag: externalAccount.id

module.exports = RippleToDogecoinBridge

