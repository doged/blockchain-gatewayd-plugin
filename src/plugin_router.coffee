express = require "express"
async = require "async"
request = require "superagent"

RippleNameLookup = (name)  ->
  @name = name

RippleNameLookup.prototype =
  resolveNameToAddress: (callback) ->
    request
      .get "https://id.ripple.com/v1/authinfo?username=#{@name}"
      .end (error, response) ->
        if error
          callback error, null
        else if response.body.exists && response.body.address
          callback null, response.body.address 
        else
          callback null, null

DogecoinBridge = (gatewayd, rippleAddress) ->
  this.gatewayd = gatewayd
  this.rippleAddress = rippleAddress
  return this

DogecoinBridge.prototype =

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
      
DogecoinBridgeController = (gatewayd) ->
  @gatewayd = gatewayd
  return this

DogecoinBridgeController.prototype =
  get: (request, response) ->
    if not @gatewayd.validator.isRippleAddress(request.params.name)
      rippleNameLookup = new RippleNameLookup request.params.name
      rippleNameLookup.resolveNameToAddress (error, rippleAddress) =>
        if error
          response.status(500).send
            error: error
        else if rippleAddress
          dogecoinBridge = new DogecoinBridge @gatewayd, rippleAddress
          dogecoinBridge.getDogecoinBridge (error, bridge) ->
            response.status(200)
              .send
                ripple:
                  address: bridge.uid
                dogecoin:
                  address: bridge.name
        else
          body =
            field: 'name'
            message: 'must be a valid ripple address or ripple name'
          response.status(500).send(body)
    else 
      dogecoinBridge = new DogecoinBridge this.gatewayd, request.params.name
      dogecoinBridge.getDogecoinBridge (error, bridge) ->
        response.status(200)
          .send
            ripple:
              address: bridge.uid
            dogecoin:
              address: bridge.name

DogecoinBridgeRouter = (options) ->
  dogecoinBridgeController = new DogecoinBridgeController(options.gatewayd)
  router = new express.Router
  router.get '/dogecoin-to-ripple/:name',
    dogecoinBridgeController.get.bind(dogecoinBridgeController)
  return router

module.exports = DogecoinBridgeRouter
