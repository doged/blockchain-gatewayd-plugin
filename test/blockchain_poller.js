var BlockchainPoller = require(__dirname+'/../lib/blockchain_poller.js');
var DogecoinClient = require(__dirname+'/../lib/client.js');

describe('Blockchain Poller', function() {

  before(function() {
    blockchainPoller = new BlockchainPoller({
      lastBlockHash: 'someBlockHash',
      blockchainClient:  new DogecoinClient()
    });
  });

  it('accepts a function to call when a block with new transactions is discovered', function() {
  
    blockchainPoller.pollForBlocks(function(block, next, done) {
      console.log('NEW BLOCK OF TRANSACTIONS', block);
      config.set('lastBlockHash', block.hash);
      config.save();
      next();
    });
  });

  it('should not advance if an error is received', function(block, next) {
    delete block;
    next(new Error('AccidentalBlockDeletionError'));
  });

  it('#stop should stop the polling behavior', function() {
    var blocks = 0;
    blockchainPoller.pollForBlocks(function(block, next) {
      if (blocks+=1 > 3) {
        return blockchainPoller.stopPollingForBlocks();
      }
      next();
    });
  });

});

