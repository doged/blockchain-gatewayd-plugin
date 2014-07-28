request = require "superagent"

class RippleNameLookup
  constructor: (@name) ->

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

module.exports = RippleNameLookup

