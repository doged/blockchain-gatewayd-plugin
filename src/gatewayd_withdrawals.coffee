
#if (process.env.NODE_ENV != 'production') {

#}
loopAndProcessWithdrawal = (callback) ->
  async.waterfall [ (next) ->
    getWithdrawal next
  , (withdrawal, next) ->
    getWithdrawalAddress withdrawal.external_account_id, (error, externalAccount) ->
      if error
        console.log "getWithdrawalAddress::error", error
        next error, null
      else
        console.log "getWithdrawalAddress::address", externalAccount
        next null, withdrawal, externalAccount

  , (withdrawal, externalAccount, next) ->
    sendDogecoins
      amount: withdrawal.amount
      address: externalAccount.uid
    , (error, response) ->
      next error, withdrawal

  , (withdrawal, next) ->
    clearWithdrawal withdrawal, next
   ], (error, clearedWithdrawal) ->
    setTimeout (->
      callback callback
    ), 2000

getWithdrawal = (callback) ->
  request.get(config.get("gatewaydDomain") + "/v1/withdrawals").auth(config.get("adminEmail"), config.get("apiKey")).end (error, response) ->
    if error
      callback error, null
    else
      withdrawal = response.body.withdrawals[0]
      if withdrawal
        callback null, withdrawal
      else
        callback "no withdrawals", null

getWithdrawalAddress = (externalAccountId, callback) ->
  request.get(config.get("gatewaydDomain") + "/v1/external_accounts/" + externalAccountId).auth(config.get("adminEmail"), config.get("apiKey")).end (error, response) ->
    if error
      callback error, null
    else
      console.log "getWithdrawalAddress::response", response.body
      callback null, response.body.external_account

sendDogecoins = (options, callback) ->
  url = config.get("dogecoinExpressDomain") + "/v1/sendtoaddress/" + options.address + "/" + options.amount
  console.log "send dogecoins", url
  request.post(url).auth("admin", config.get("dogecoinExpressApiKey")).send({}).end (error, response) ->
    console.log "SENT DOGECOINS", response.body
    console.log "SEND DOGECOINS ERROR", error
    callback error, response.body.address, options.withdrawal

clearWithdrawal = (withdrawal, callback) ->
  url = config.get("gatewaydDomain") + "/v1/withdrawals/" + withdrawal.id + "/clear"
  console.log "clearWithdrawal", url
  request.post(url).auth(config.get("adminEmail"), config.get("apiKey")).send({}).end (error, response) ->
    console.log "withdrawal::clear::success", response.body
    console.log "withdrawal::clear::error", response.error
    callback error, response

request = require("superagent")
config = require(__dirname + "/config/config.js")
async = require("async")
SqlMqWorker = require("sql-mq-worker")
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
loopAndProcessWithdrawal loopAndProcessWithdrawal
