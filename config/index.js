const env = process.env.NODE_ENV || 'development';
let config;
if (env === 'development') {
  config = require('./config.dev.js');
}

if (env === 'production') {
  config = require('./config.prod.js');
}
console.log('exporting: ', config);
module.exports = config;
