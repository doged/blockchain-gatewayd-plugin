const config = require('./config.js');

const dogecoind = require('node-dogecoin')({
  host: config.get('HOST'),
  port: config.get('PORT'),
  user: config.get('USER'),
  pass: config.get('PASS'),
  https: true
});

module.exports = dogecoind;

