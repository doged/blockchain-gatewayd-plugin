request = require "superagent"

class DogecoinAddressValidator
  constructor: (@gatewayd) ->

  validate: (address, callback) ->
    request
      .get "#{@gatewayd.config.get('dogecoinExpressDomain')}/v1/validateaddress/#{address}"
      .auth "admin", @gatewayd.config.get("dogecoinExpressApiKey")
      .end (error, response) ->
        if error
          callback error, null
        else
          callback null, response.body.validation.isvalid
      
module.exports = DogecoinAddressValidator

