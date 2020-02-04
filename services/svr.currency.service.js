/**
 * Created By :- Madhura
 * Created Date :- 12-06-2017 13:13 pm
 * Version :- 1.0
 */


var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var crud = require('./svr.crudService.service.js');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('CurrencyCheck');

var service = {};

service.getAll = getAll;

module.exports = service;


function getAll() {
  var deferred = Q.defer();

    var collectionName = 'CurrencyCheck'
    var condition = {};
    var paramNotReq = {};
    console.log("config.connectionString: ",config.cString)
     
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
    .then(data => {
      deferred.resolve(data)
    }).catch(err => {
      deferred.reject(err)
    })
    return deferred.promise;
}
