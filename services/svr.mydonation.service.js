/**
 *Created By :- Akshay
 * Created Date :- 10-06-2017 02:30 pm
 * Version :- 1.0
 */
var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('ProjectDonation');

var service = {};

service.getAll = getAll;

module.exports = service;

function getAll(projId, donorId) {
    var deferred = Q.defer();
    db.ProjectDonation.find({ projectId: projId, donorId: donorId }).toArray(function (err, mydonation) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(mydonation);
    });
    return deferred.promise;
}