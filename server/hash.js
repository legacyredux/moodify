const crypto = require('crypto');

const createHash = (data) => {
  const shasum = crypto.createHash('sha256');
  shasum.update(data);
  return shasum.digest('hex');
};

module.exports.createHash = createHash;
