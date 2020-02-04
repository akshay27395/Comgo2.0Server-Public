/**
 * Created By :- Akshay
 * Created Date :- 09-06-2017 04:30 pm
 * Version :- 1.0
 */
var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var crud = require('./svr.crudService.service.js');
db.bind('ProjectImage');

var service = {};

service.GetImageByProjId = GetImageByProjId;
service.allByProjIdWeb = allByProjIdWeb;

module.exports = service;


function GetImageByProjId(_projectId) {
    var deferred = Q.defer();
    var collectionName = 'ProjectImage'
    var condition = {};
    condition["projectId"] = _projectId;
    var paramNotReq = {};
    console.log("config.connectionString: ",config.cString)
     
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
    .then(data => {
        console.log("Project Images data: ",data)
      deferred.resolve(data)
    }).catch(err => {
      deferred.reject(err)
    })
    return deferred.promise;
}

function allByProjIdWeb(_projectId) {
    var deferred = Q.defer();
    db.ProjectImage.find({projectId : mongo.helper.toObjectID(_projectId)}).toArray(function (err, data) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(data);
    });
    return deferred.promise;
}

