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
var crud = require('./svr.crudService.service.js');
db.bind('ProjectDonation');
db.bind('AuditTable');
db.bind('SaveDonate');

var service = {};
service.getAll = getAll;
service.getAllDonorListDB = getAllDonorListDB;
service.getMyDonations = getMyDonations;
service.getDonorProjectDonation = getDonorProjectDonation;



module.exports = service;

function getDonorProjectDonation(req, res) {

    var username = req.body.username;
    var projectId = req.body.projectId;
    // var projectId = 'Project744273';
    var deferred = Q.defer();
    var role = "donor";
    db.SaveDonate.find({ $and: [{ username: username }, { projectId: projectId }] }).toArray(function (err, donationInfo) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        console.log("donationInfo : ",donationInfo)
        deferred.resolve(donationInfo);
    });
    return deferred.promise;
}

function getAll(projId, donorId) {
    var deferred = Q.defer();
    // db.ProjectDonation.find({ projectId: projId, donorId: donorId }).toArray(function (err, alldonor) {
    //     if (err) deferred.reject(err.name + ': ' + err.message);
    //     deferred.resolve(alldonor);
    // });
    var collectionName = 'ProjectDonation'
    var paramNotReq = {};
    var condition = { projectId: projId, donorId: donorId };
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
    .then(data => {
        deferred.resolve(data)
    }).catch(err => {
        deferred.reject(err)
    })
    return deferred.promise;
}

function getAllDonorListDB(req, res) {
    var deferred = Q.defer();
    var projectId = req.body.projectId;
    console.log("getAllDonorListDB projId: ",projectId)
    db.SaveDonate.find({ projectId: projectId, }).toArray(function (err, alldonor) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(alldonor);
    });
    return deferred.promise;
}

function getMyDonations(req, res) {
    var deferred = Q.defer();
    var userName = req.body.userName;

    db.SaveDonate.find({ aliasName: userName }).toArray(function (err, donationInfo) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(donationInfo);
    });
    return deferred.promise;
}