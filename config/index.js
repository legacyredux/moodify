const env = process.env.NODE_ENV || 'development';
let config;

if (env === 'development') {
  config = require('./config.dev.js');
} else {
  config = require('./config.prod.js');
}

module.exports = config;
