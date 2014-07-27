request = require "superagent"
_ = require "underscore-node"
config = require "#{__dirname}/../config/config.js"
EventEmitter = require("events").EventEmitter
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"  unless process.env.NODE_ENV is "production"
lastBlockHash = config.get "lastBlockHash"

listSinceBlock = (block, callback) ->
  request.get(config.get('DOGECOIND_HOST')+block).auth("admin", config.get("DOGECOIND_API_KEY")).end (error, response) ->
    try
      sorted = _.sortBy(response.body.received.transactions, (transaction) ->
        transaction.blocktime
      )
      callback null, sorted
    catch error
      callback error, null

listNextBlock = (lastBlock, callback) ->
  listSinceBlock lastBlock, (error, transactions) ->
    if not transactions or transactions.length is 0
      callback error, null
      return
    nextBlockHash = transactions[0].blockhash
    nextBlock = _.filter(transactions, (transaction) ->
      transaction.blockhash is nextBlockHash
    )
    callback null, nextBlock

pollForPayments = (callback) ->
  listNextBlock config.get("lastBlockHash"), (error, transactions) ->
    if error
      callback callback
    else if transactions and transactions.length > 0
      if transactions[0].blockhash
        emitter.emit "block", transactions
        config.set "lastBlockHash", transactions[0].blockhash
        config.save()
      callback callback
    else
      callback callback

emitter = new EventEmitter()
emitter.on "block", (transactions) ->
  transactions.forEach (transaction) ->
    request
      .get config.get("gatewaydDomain") + "/v1/external_accounts?name=" + transaction.address
      .auth config.get("adminEmail"), config.get("apiKey")
      .end (error, response) ->
        if error
          console.log "error", error
        else if response.body.external_accounts and response.body.external_accounts.length > 0
          externalAccount = response.body.external_accounts[0]
          request
            .post config.get("gatewaydDomain") + "/v1/deposits"
            .auth config.get("adminEmail"), config.get("apiKey")
            .send
              external_account_id: externalAccount.id
              currency: "DOG"
              amount: transaction.amount
            .end (error, response) ->
              if error
                console.log "error", error
              else
                console.log response.body
        else
          console.log "no account found"
    console.log transaction

pollForPayments pollForPayments
