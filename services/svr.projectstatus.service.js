/**
 *Created By :- Mamta
 * Created Date :- 5-10-2017 03:30 pm
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
    db.ProjectDonation.find({ projectId: projId, donorId: donorId }).toArray(function(err, alldonor) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(alldonor);
    });
    return deferred.promise;
}