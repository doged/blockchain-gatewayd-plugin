async = require "async"

class DogecoinBridge
  constructor: (@gatewayd, @rippleAddress) ->

  getDogecoinBridge: (callback) ->
    async.waterfall [
      @_getExternalAccount.bind(@),
      @_getNewDogecoinAddress.bind(@)
      @_registerDogeBridge.bind(@)
    ], callback

  _getExternalAccount: (callback) ->
    @gatewayd.data.models.externalAccounts.find
      where:
        uid: @rippleAddress
    .complete callback

  _getNewDogecoinAddress: (externalAccount, callback) ->
    if externalAccount
      callback null, externalAccount, null
    else
      request
        .get @gatewayd.config.get("dogecoinExpressDomain") + "/v1/getnewaddress"
        .auth "admin", @gatewayd.config.get("dogecoinExpressApiKey")
        .end (error, response) ->
          if error
            callback error, null, null
          else
            callback null, null, response.body.address

   _registerDogeBridge: (externalAccount, dogecoinAddress, callback) ->
    if externalAccount
      callback null, externalAccount
    else
      @gatewayd.data.models.externalAccounts.create
        name: dogecoinAddress
        uid: this.rippleAddress
        user_id: 1
      .complete callback  
      
module.exports = DogecoinBridge

