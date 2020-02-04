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
db.bind('ProjectDocument');

var service = {};

service.GetDocByProjId = GetDocByProjId;
service.allByProjIdWeb = allByProjIdWeb;
module.exports = service;


function GetDocByProjId(_projectId) {
    var deferred = Q.defer();
    db.ProjectDocument.find({ projectId: mongo.helper.toObjectID(_projectId) }).toArray(function (err, data) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(data);
    });
    return deferred.promise;
}

function allByProjIdWeb(_projectId) {
    var deferred = Q.defer();
    db.ProjectDocument.find({projectId : mongo.helper.toObjectID(_projectId)}).toArray(function (err, data) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(data);
    });
    // mongo.helper.toObjectID(_projectId)
    return deferred.promise;
}

