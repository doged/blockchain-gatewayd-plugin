express = require "express"

DogecoinBridgeController = require "#{__dirname}/dogecoin_bridge_controller"

DogecoinBridgeRouter = (options) ->
  dogecoinBridgeController = new DogecoinBridgeController(options.gatewayd)
  router = new express.Router
  router.get '/dogecoin-to-ripple/:name', dogecoinBridgeController.get
  return router

module.exports = DogecoinBridgeRouter

