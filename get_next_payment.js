var request = require('superagent');
var _ = require('underscore-node');
var config = require(__dirname+'/config/config.js');
var EventEmitter = require('events').EventEmitter;

if (process.env.NODE_ENV != 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

var lastBlockHash = config.get('lastBlockHash');
var dogecoinExpressApiKey = '749817026993458';

function listSinceBlock(block, callback) {
  var url = 'https://ec2-54-82-142-91.compute-1.amazonaws.com/v1/listsinceblock/'+block;
  request
    .get(url)
    .auth('admin', dogecoinExpressApiKey)  
    .end(function(error, response){
      try {
        var sorted = _.sortBy(response.body.received.transactions, function(transaction){
          return transaction.blocktime;
        });
        callback(null, sorted);
      } catch(error) {
        callback(error, null);
      }
    });
}

function listNextBlock(lastBlock, callback) {
  listSinceBlock(lastBlock, function(error, transactions) {
    if (!transactions || transactions.length === 0) { callback(error, null); return };
    var nextBlockHash = transactions[0].blockhash;
    var nextBlock = _.filter(transactions, function(transaction){
      return transaction.blockhash === nextBlockHash;
    });
    callback(null, nextBlock);
  });
}

var emitter = new EventEmitter();

function pollForPayments(callback){
  listNextBlock(config.get('lastBlockHash'), function(error, transactions){
    if (error) {
      callback(callback);
    } else if (transactions && transactions.length > 0) {
      if (transactions[0].blockhash) {
        emitter.emit('block', transactions);
        config.set('lastBlockHash', transactions[0].blockhash);
        config.save();
      }
      callback(callback);
    } else {
      callback(callback);
    }
  });
}

emitter.on('block', function(transactions){
  console.log('NEW BLOCK WITH TRANSACTIONS!');
  transactions.forEach(function(transaction) {
    request
      .get(config.get('gatewaydDomain')+'/v1/external_accounts?name='+transaction.address)
      .auth(config.get('adminEmail'), config.get('apiKey'))
      .end(function(error, response) {
        if (error) {
          return console.log('error', error);
        } else if (response.body.external_accounts && response.body.external_accounts.length > 0){
          var externalAccount = response.body.external_accounts[0];
          request
            .post(config.get('gatewaydDomain')+'/v1/deposits')
            .auth(config.get('adminEmail'), config.get('apiKey'))
            .send({
              external_account_id: externalAccount.id,
              currency: 'DOG',
              amount: transaction.amount
            })
            .end(function(error, response) {
              if (error) {
                return console.log('error', error);
              } else {
                console.log(response.body);
              }
            });
        } else {
          console.log('no account found');
        }
      });
    console.log(transaction);
  });  
});

pollForPayments(pollForPayments);

