/**
 * Created By :- Mamta
 * Created Date :- 10-08-2017 12:55 pm
 * Version :- 1.0
 */


var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var crud = require('./svr.crudService.service.js');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('Country');
db.bind('CountryCodes')
var service = {};

service.getAll = getAll;
service.countryCodes = countryCodes;

module.exports = service;


function getAll() {
    var deferred = Q.defer();

    var collectionName = 'Country'
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

/**
    * @author: Kuldeep
    * @argument:none
    * @description:Get Country Codes
    */
function countryCodes() {
    var deferred = Q.defer();

    var collectionName = 'CountryCodes'
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