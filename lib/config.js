const config = require('nconf');

config
  .file({ file: __dirname+'/../config.json' });

module.exports = config;

