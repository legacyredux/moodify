const db = require('../database');
const Promise = require('bluebird');
const hash = require('./hash.js');

const userExists = (username, password) =>
  new Promise((resolve, reject) => {
    const hashedPassword = hash.createHash(password);
    db.User
    .find({
      username,
      password: hashedPassword,
    })
    .exec((err, user) => {
      if (!err && user.length !== 0) {
        resolve(true);
      } else { resolve(false); reject(false); } // what?
    });
  });

const verifyUser = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  return userExists(username, password)
  .then((item) => {
    if (!item) {
      res.send({ errorMessage: 'user not found' });
    } else {
      next();
    }
  });
};

const usernameExists = username =>
  new Promise((resolve, reject) => {
    db.User
    .find({
      username,
    })
    .exec((err, user) => {
      if (!err && user.length !== 0) {
        resolve(true);
      } else { resolve(false); reject(false); }
    });
  });

const createUser = (req, res, next) =>
  usernameExists(req.body.username)
  .then((item) => {
    if (!item) {
      const username = req.body.username;
      const hashedPassword = hash.createHash(req.body.password);
      const newUser = new db.User({
        username,
        password: hashedPassword,
      });
      newUser.save(() => {
        next();
      });
    } else {
      res.send({ errorMessage: 'username already exists' });
    }
  });

module.exports.verifyUser = verifyUser;
module.exports.createUser = createUser;
