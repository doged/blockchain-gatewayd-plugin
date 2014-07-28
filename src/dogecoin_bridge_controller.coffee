RippleNameLookup = require "#{__dirname}/ripple_name_lookup"
DogecoinBridge = require "#{__dirname}/dogecoin_bridge"

class DogecoinBridgeController 
  constructor: (@gatewayd) ->

  get: (request, response) =>
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

module.exports = DogecoinBridgeController 

