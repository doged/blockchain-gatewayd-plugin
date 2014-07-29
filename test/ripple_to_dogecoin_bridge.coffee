assert = require "assert"
RippleToDogecoinBridge = require "#{__dirname}/../src/ripple_to_dogecoin_bridge"
gatewayd = require "#{__dirname}/../../../ripple/gatewayd/"

describe "Ripple To Dogecoin Bridge", ->

  it "should require a dogecoin address", ->
    bridge = new RippleToDogecoinBridge
    assert bridge instanceof Error
    assert.strictEqual bridge.message, "invalid dogecoin address"
    assert.strictEqual bridge.field, "dogecoinAddress"

  it "should reject an invalid dogecoin address", (next) ->
    bridge = new RippleToDogecoinBridge "b@dAddre$s", gatewayd
    bridge.getRippleAddress (error, rippleAddress) ->
      assert error instanceof Error
      assert.strictEqual error.message, "invalid dogecoin address"
      assert.strictEqual error.field, "dogecoinAddress"
      next()

  it "should accept a valid dogecoin address", (next) ->
    dogecoinAddress = "DFUVhzpRrmvGwy4ETtkxtsXJagoN1imanZ"
    bridge = new RippleToDogecoinBridge dogecoinAddress, gatewayd
    bridge.getRippleAddress (error, rippleAddress) ->
      assert not error
      assert gatewayd.validator.isRippleAddress rippleAddress.address
      assert rippleAddress.tag > 0
      next()

  it "should create an external account for the dogecoin address", (next) ->
    dogecoinAddress = "DFUVhzpRrmvGwy4ETtkxtsXJagoN1imanZ"
    bridge = new RippleToDogecoinBridge dogecoinAddress, gatewayd
    bridge.getRippleAddress (error, rippleAddress) ->
      gatewayd.data.models.externalAccounts.find({
        where:
          name: dogecoinAddress
      }).complete (error, externalAccount) ->
        assert externalAccount.id > 0
        assert.strictEqual externalAccount.name, dogecoinAddress
        next()

