var async = require("async");

function BlockchainBridge(gatewayd, rippleAddress) {
  this.gatewayd = gatewayd;
  this.rippleAddress = rippleAddress;
}

BlockchainBridge.prototype.getBlockchainBridge = function(callback) {
  return async.waterfall([
    this._getExternalAccount.bind(this),
    this._getNewDogecoinAddress.bind(this),
    this._registerDogeBridge.bind(this)
  ], callback);
};

BlockchainBridge.prototype._getExternalAccount = function(callback) {
  return this.gatewayd.data.models.externalAccounts.find({
    where: {
      uid: this.rippleAddress
    }
  }).complete(callback);
};

BlockchainBridge.prototype._getNewDogecoinAddress = function(externalAccount, callback) {
  if (externalAccount) {
    return callback(null, externalAccount, null);
  } else {
    return request
      .get(this.gatewayd.config.get("dogecoinExpressDomain") + "/v1/getnewaddress")
      .auth("admin", this.gatewayd.config.get("dogecoinExpressApiKey"))
      .end(function(error, response) {
        if (error) {
          return callback(error, null, null);
        } else {
          return callback(null, null, response.body.address);
        }
      });
  }
};

BlockchainBridge.prototype._registerDogeBridge = function(externalAccount, dogecoinAddress, callback) {
  if (externalAccount) {
    return callback(null, externalAccount);
  } else {
    return this.gatewayd.data.models.externalAccounts.create({
      name: dogecoinAddress,
      uid: this.rippleAddress,
      user_id: 1
    }).complete(callback);
  }
};

module.exports = BlockchainBridge;

