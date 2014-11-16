// Generated by CoffeeScript 1.7.1
var SqlMqWorker, async, clearWithdrawal, config, getWithdrawal, getWithdrawalAddress, loopAndProcessWithdrawal, request, sendDogecoinDarks;

loopAndProcessWithdrawal = function(callback) {
  return async.waterfall([
    function(next) {
      return getWithdrawal(next);
    }, function(withdrawal, next) {
      return getWithdrawalAddress(withdrawal.external_account_id, function(error, externalAccount) {
        if (error) {
          console.log("getWithdrawalAddress::error", error);
          return next(error, null);
        } else {
          console.log("getWithdrawalAddress::address", externalAccount);
          return next(null, withdrawal, externalAccount);
        }
      });
    }, function(withdrawal, externalAccount, next) {
      return sendDogecoinDarks({
        amount: withdrawal.amount,
        address: externalAccount.uid
      }, function(error, response) {
        return next(error, withdrawal);
      });
    }, function(withdrawal, next) {
      return clearWithdrawal(withdrawal, next);
    }
  ], function(error, clearedWithdrawal) {
    return setTimeout((function() {
      return callback(callback);
    }), 2000);
  });
};

getWithdrawal = function(callback) {
  return request.get(config.get("gatewaydDomain") + "/v1/withdrawals").auth(config.get("adminEmail"), config.get("apiKey")).end(function(error, response) {
    var withdrawal;
    if (error) {
      return callback(error, null);
    } else {
      withdrawal = response.body.withdrawals[0];
      if (withdrawal) {
        return callback(null, withdrawal);
      } else {
        return callback("no withdrawals", null);
      }
    }
  });
};

getWithdrawalAddress = function(externalAccountId, callback) {
  return request.get(config.get("gatewaydDomain") + "/v1/external_accounts/" + externalAccountId).auth(config.get("adminEmail"), config.get("apiKey")).end(function(error, response) {
    if (error) {
      return callback(error, null);
    } else {
      console.log("getWithdrawalAddress::response", response.body);
      return callback(null, response.body.external_account);
    }
  });
};

sendDogecoins = function(options, callback) {
  var url;
  url = config.get("dogecoindarkExpressDomain") + "/v1/sendtoaddress/" + options.address + "/" + options.amount;
  console.log("send dogecoindarks", url);
  return request.post(url).auth("admin", config.get("dogecoindarkExpressApiKey")).send({}).end(function(error, response) {
    console.log("SENT DOGECOINDARKS", response.body);
    console.log("SEND DOGECOINDARKS ERROR", error);
    return callback(error, response.body.address, options.withdrawal);
  });
};

clearWithdrawal = function(withdrawal, callback) {
  var url;
  url = config.get("gatewaydDomain") + "/v1/withdrawals/" + withdrawal.id + "/clear";
  console.log("clearWithdrawal", url);
  return request.post(url).auth(config.get("adminEmail"), config.get("apiKey")).send({}).end(function(error, response) {
    console.log("withdrawal::clear::success", response.body);
    console.log("withdrawal::clear::error", response.error);
    return callback(error, response);
  });
};

request = require("superagent");

config = require(__dirname + "/config/config.js");

async = require("async");

SqlMqWorker = require("sql-mq-worker");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

loopAndProcessWithdrawal(loopAndProcessWithdrawal);
