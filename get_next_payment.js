var request = require('superagent');
var _ = require('underscore-node');
var config = require(__dirname+'/config/config.js');

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

function pollForPayments(callback){
  listNextBlock(config.get('lastBlockHash'), function(error, transactions){
    if (error) {
      callback(callback);
    } else if (transactions && transactions.length > 0) {
      if (transactions[0].blockhash) {
        console.log('NEW BLOCK WITH TRANSACTIONS!', transactions);
        config.set('lastBlockHash', transactions[0].blockhash);
        config.save();
      }
      callback(callback);
    } else {
      callback(callback);
    }
  });
}

pollForPayments(pollForPayments);

