var config = require('nconf');

config
  .argv()
  .env()
  .file({ file: __dirname+'/config.json' });

module.exports = config;
  
