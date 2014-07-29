RippleToDogecoinBridge = require "#{__dirname}/ripple_to_dogecoin_bridge"

class RippleToDogecoinBridgeController
  constructor: (@gatewayd) ->

  get: (request, response) =>
    bridge = new RippleToDogecoinBridge request.params.address, @gatewayd
    bridge.getRippleAddress (error, rippleAddress) =>
      if error
        response
          .status 500
          .end()
      else
        response 
          .status 200
          .send
            dogecoin:
              address: request.params.address
            ripple:
              address: rippleAddress.address
              tag: rippleAddress.tag
       
module.exports = RippleToDogecoinBridgeController

