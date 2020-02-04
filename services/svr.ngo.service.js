/**
 * Created By :- Madhura
 * Created Date :- 09-08-2017 17:43 pm
 * Version :- 1.0
 */

var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('User');

var service = {};

service.getAll = getAll;
service.getUserDetails = getUserDetails;

module.exports = service;


function getAll() {
  var deferred = Q.defer();

  db.User.find().toArray(function (err, cust) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    deferred.resolve(cust);
  });

  return deferred.promise;
}

function getUserDetails(req, res) {
  var deferred = Q.defer();

  db.User.find({ username: req.body.username }).toArray(function (err, cust) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    deferred.resolve(cust);
  });

  return deferred.promise;
}