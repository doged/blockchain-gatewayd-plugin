RouterPlugin = require "#{__dirname}/../src/plugin_router"
supertest = require "supertest"
express = require "express"
assert = require "assert"
gatewayd = require "#{__dirname}/../../../ripple/gatewayd/"

appServer = express()

routerPlugin = new RouterPlugin
  gatewayd: gatewayd

appServer.use '/bridge', routerPlugin

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"  unless process.env.NODE_ENV is "production"

describe "Dogecoin Bridge Router Plugin", ->
  it "should get a dogecoin bridge given a ripple address", (next) ->
    rippleAddress = 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk'
    supertest appServer
      .get "/bridge/dogecoin-to-ripple/#{rippleAddress}"
      .expect 200
      .end (error, response) ->
        dogecoinAddress = 'DHvcZHmmwZzzMnKJ4ohZRHY6aE7S63rwne'
        assert.strictEqual response.body.ripple.address, rippleAddress
        assert.strictEqual response.body.dogecoin.address, dogecoinAddress
        assert not error
        next()

  it "should get a dogecoin bridge given a ripple name", (next) ->
    rippleName = 'stevenzeiler'
    supertest appServer
      .get "/bridge/dogecoin-to-ripple/#{rippleName}"
      .expect 200
      .end (error, response) ->
        rippleAddress = 'r4EwBWxrx5HxYRyisfGzMto3AT8FZiYdWk'
        dogecoinAddress = 'DHvcZHmmwZzzMnKJ4ohZRHY6aE7S63rwne'
        assert.strictEqual response.body.ripple.address, rippleAddress
        assert.strictEqual response.body.dogecoin.address, dogecoinAddress
        assert not error
        next()

  it "should return an error with invalid ripple address or name", (next) ->
    rippleName = 'a;lkjalkj23lkjflkjf'
    supertest appServer
      .get "/bridge/dogecoin-to-ripple/#{rippleName}"
      .expect 500
      .end (error, response) ->
        assert.strictEqual response.body.field, 'name'
        assert.strictEqual response.body.message, 'must be a valid ripple address or ripple name'
        next()

  it "should get a dogecoin bridge given a dogecoin address", (next) ->
    dogecoinAddress = "D9Vm5YbSL3HL1Ha1Tm6eGdc929thZyhhqy"
    supertest appServer 
      .get "/bridge/ripple-to-dogecoin/#{dogecoinAddress}"
      .expect 200
      .end (error, response) ->
        console.log response.body
        assert.strictEqual response.body.dogecoin.address, dogecoinAddress
        assert gatewayd.validator.isRippleAddress response.body.ripple.address
        next()

  it "should get a dogecoin bridge given another dogecoin address", (next) ->
    dogecoinAddress = "DDNFc5ZH3wj4gnFZgupea2PUTERuZr4P97"
    supertest appServer 
      .get "/bridge/ripple-to-dogecoin/#{dogecoinAddress}"
      .expect 200
      .end (error, response) ->
        assert.strictEqual response.body.dogecoin.address, dogecoinAddress
        assert gatewayd.validator.isRippleAddress response.body.ripple.address
        next()
    

