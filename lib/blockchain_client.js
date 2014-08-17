const _ = require('underscore');
const dogecoind = require('./node_dogecoin.js');
const CONFIRMATIONS = 2;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0" 

function DogecoinClient(options) {  }

DogecoinClient.prototype = {

  listNextBlock: function(previousBlockHash, callback) {
    var _this = this;
    dogecoind.exec('listsinceblock', previousBlockHash, CONFIRMATIONS, function(error, response) {
      if (error) {
        return callback(error, null);
      }
      var transactions = response.transactions; 
      if (!transactions || transactions.length === 0) {
        callback();
      } else {
        var sorted = _this._sortTransactionsByTime(transactions);
        var nextBlockHash = sorted[0].blockhash;
        callback(null, _this._transactionsInBlock(sorted, nextBlockHash));
      }
    });
  },
  
  _sortTransactionsByTime: function(transactions) {
    return _.sortBy(transactions, function(transaction){
      return transaction.blocktime;
    }); 
  },

  _transactionsInBlock: function(transactions, blockHash) {
    return _.filter(transactions, function(transaction){
      return transaction.blockhash === blockHash;
    });
  }

}

module.exports = DogecoinClient;
