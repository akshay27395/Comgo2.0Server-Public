/**
 * Created By :- Madhura
 * Created Date :- 27-06-2017 11:30 am
 * Version :- 1.0
 */

var config = require('config.json');
var _ = require('lodash');
var emailCheck = require('email-check');
var Q = require('q');
var mongo = require('mongoskin');
var ObjectId = require('mongodb').ObjectID;
var crud = require('./svr.crudService.service.js');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('Proof');
db.bind('ProofDocType');

var service = {};

service.create = create;
service.getAll = getAll;
service.getDocType = getDocType;
service.getDocTypeForAddProof = getDocTypeForAddProof;
service.checkmail = checkmail;
service.getProof = getProof;
service.updateProof = updateProof;

module.exports = service;

function updateProof(req,res) {
    var deferred = Q.defer();
    var id = req.body.id;

    var set = {
        amount: req.body.amount
    };
    console.log("id and set: ",id,set)
    var collectionName = 'Proof'
    var condition = {};
    condition["_id"] = new ObjectId(id);
    console.log("config.connectionString: ", config.cString)
      
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function getProof(req,res) {
    var deferred = Q.defer();
    var collectionName = 'Proof'
    var condition = req.params.proofId
    var paramNotReq = {}
    console.log("getProof params: ",condition)
    crud.readById(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("getProof data: ",data)
            deferred.resolve(data)
        }).catch(err => {
            console.log("getProof err: ")
            deferred.reject(err)
        })
    return deferred.promise;
}

function create(proof) {
    console.log("Proof create: ",proof)
    var deferred = Q.defer();
    var collectionName = 'Proof'
    crud.createData(config.cString, config.dbName, collectionName, proof)
        .then(data => {
            console.log("Proof inserted successfully", data);
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err);
        })
    return deferred.promise;
}

function checkmail(proof) {
    var deferred = Q.defer();
    emailCheck(proof.valEmail)
        .then(function (res) {
            if (res == true) {
                deferred.resolve({ emailPresent: res });
            } else {
                deferred.reject('Email id does not exist');
            }
        })
        .catch(function (err) {
            if (err.message === 'refuse') {
                deferred.reject('Email id does not exist');
            } else {
                deferred.reject('Email id does not exist');
            }
        });
    return deferred.promise;
}

function getAll(activityId, projectId) {
    var deferred = Q.defer();
    var collectionName = 'Proof'
    var condition = { activityId: activityId, projectId: projectId }
    var paramNotReq = {}
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function getDocType(req, res) {
    var deferred = Q.defer();
    var collectionName = 'ProofDocType'
    var condition = {}
    var paramNotReq = {}
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


function getDocTypeForAddProof(req, res) {
    var deferred = Q.defer();
    var collectionName = 'ProofDocType'
    var condition = {};
    var paramNotReq = {};
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}