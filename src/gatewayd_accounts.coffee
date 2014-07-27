loopAndSetNewGatewayExternalAccount = (callback) ->
  getNewGatewayAccount (error, gatewayExternalAccount) ->
    if error
      console.log "ERROR", error
      callback callback
    else if gatewayExternalAccount
      setDogecoinAddress gatewayExternalAccount.id, (error, gatewayExternalAccount) ->
        if error
          callback callback
          console.log "ERROR", error
        else
          console.log "UPDATED", gatewayExternalAccount
          callback callback

    else
      callback callback

getNewGatewayAccount = (callback) ->
  request.get(config.get("gatewaydDomain") + "/v1/external_accounts?name=default").auth(config.get("adminEmail"), config.get("apiKey")).end (error, response) ->
    if error
      callback error, null
    else
      try
        account = response.body.external_accounts[0]
        callback null, account
      catch error
        callback error, null

getNewDogecoinAddress = (callback) ->
  request.get(config.get("dogecoinExpressDomain") + "/v1/getnewaddress").auth("admin", config.get("dogecoinExpressApiKey")).end (error, response) ->
    callback error, response.body.address

setDogecoinAddress = (externalAccountId, callback) ->
  getNewDogecoinAddress (error, dogecoinAddress) ->
    request.put(config.get("gatewaydDomain") + "/v1/external_accounts/" + externalAccountId).send(name: dogecoinAddress).auth(config.get("adminEmail"), config.get("apiKey")).end (error, response) ->
      if error
        callback error, null
      else
        console.log error, response.body
        callback null, response.body.external_account


request = require("superagent")
config = require(__dirname + "/config/config.js")
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"  unless process.env.NODE_ENV is "production"
loopAndSetNewGatewayExternalAccount loopAndSetNewGatewayExternalAccount
