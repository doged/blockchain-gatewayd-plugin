express = require "express"

DogecoinBridgeController = require "#{__dirname}/dogecoin_bridge_controller"
RippleToDogecoinBridgeController = require "#{__dirname}/ripple_to_dogecoin_bridge_controller"

DogecoinBridgeRouter = (options) ->
  dogecoinBridgeController = new DogecoinBridgeController(options.gatewayd)
  rippleToDogecoinBridgeController = new RippleToDogecoinBridgeController(options.gatewayd)
  router = new express.Router
  router.get '/dogecoin-to-ripple/:name', dogecoinBridgeController.get
  router.get '/ripple-to-dogecoin/:address', rippleToDogecoinBridgeController.get
  return router

module.exports = DogecoinBridgeRouter

