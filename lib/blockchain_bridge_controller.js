RippleNameLookup = require("" + __dirname + "/ripple_name_lookup.js");
BlockchainBridge = require("" + __dirname + "/blockchain_bridge.js");

function BlockchainBridgeController(gatewayd) {
  this.gatewayd = gatewayd;
}

BlockchainBridgeController.prototype.get = function(request, response) {
  if (!this.gatewayd.validator.isRippleAddress(request.params.name)) {
    rippleNameLookup = new RippleNameLookup(request.params.name);
    rippleNameLookup.resolveNameToAddress(function(error, rippleAddress) {
      if (error) {
        return response.status(500).send({
          error: error
        });
      } else if (rippleAddress) {
        var dogecoinBridge = new BlockchainBridge(_this.gatewayd, rippleAddress);
        dogecoinBridge.getBlockchainBridge(function(error, bridge) {
          response.status(200).send({
            ripple: {
              address: bridge.uid
            },
            dogecoin: {
              address: bridge.name
            }
          });
        });
      } else {
        var body = {
          field: 'name',
          message: 'must be a valid ripple address or ripple name'
        };
        response.status(500).send(body);
      }
    });
  } else {
    var dogecoinBridge = new BlockchainBridge(this.gatewayd, request.params.name);
    dogecoinBridge.getBlockchainBridge(function(error, bridge) {
      response.status(200).send({
        ripple: {
          address: bridge.uid
        },
        dogecoin: {
          address: bridge.name
        }
      });
    });
  }
};

module.exports = BlockchainBridgeController;

