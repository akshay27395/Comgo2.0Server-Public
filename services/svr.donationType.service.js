/**
 * Created By :- Madhura
 * Created Date :- 12-06-2017 13:13 pm
 * Version :- 1.0
 */


var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('DonationType');

var service = {};
var ftuc =0;

service.getAll = getAll;

module.exports = service;


function getAll() {
  var deferred = Q.defer();

  db.DonationType.find().toArray(function (err, cust) {
    if (err) deferred.reject(err.name + ': ' + err.message);
    deferred.resolve(cust);
  });

  return deferred.promise;
}
