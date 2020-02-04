/**
 * Created By :- Girijashankar Mishra
 * Created Date :- 08-05-2017 15:30 pm
 * Version :- 1.0
 */

var config = require('config.json');
var _ = require('lodash');
var path = require('path');
var Q = require('q');
var mongo = require('mongoskin');
var ObjectId = require('mongodb').ObjectID;
var fs = require('fs');
var db = mongo.db(config.connectionString, { native_parser: true });
var crud = require('./svr.crudService.service.js');

db.bind('Document');
db.bind('OrganizationDocument');
db.bind('PublishedProjectFiles');

var service = {};

service.create = create;
service.saveFile = saveFile;
service.projectFileInfo = projectFileInfo;
service.updatePastEvent = updatePastEvent;
service.deletePastEvent = deletePastEvent;
service.updateProjectSupporter = updateProjectSupporter;
service.deleteProjectSupporter = deleteProjectSupporter;
service.multiOrgDoc = multiOrgDoc;
module.exports = service;


function multiOrgDoc(req, res) {
    var deferred = Q.defer();
    console.log("multipleImage service uploadProjectImages:", req.body)
    var data = JSON.parse(req.body.fileInformation)
    var length = data.length;
    console.log("image length:",length);
    for (var i = 0; i < data.length; i++) {
        console.log("data[i].imageName:",data[i].fileName);
        var ProjectInformation = {
            organizationName: data[i].organizationName,
            filePath: data[i].filePath,
            fileName: data[i].fileName,
            type: data[i].type
        }
        db.OrganizationDocument.insert(
            ProjectInformation,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(doc);
            });
    }
    return deferred.promise;
}

function create(document) {
    var deferred = Q.defer();
    var collectionName = 'Document'
    crud.createData(config.cString, config.dbName, collectionName, document)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })

    return deferred.promise;
}

/** 
        * @author:Kuldeep
        * @argument:contains file information
        * @description:Upload Organization Docs
       */
function saveFile(req, res) {
    var deferred = Q.defer();
    var data = JSON.parse(req.body.fileInformation)
    var orgDocInformation = {
        organizationName: data.organizationName,
        filePath: data.filePath,
        fileName: data.fileName,
        type: data.type
    }
    console.log("orgDocInformation :",orgDocInformation)

    var collectionName = 'OrganizationDocument'
    crud.createData(config.cString, config.dbName, collectionName, orgDocInformation)
        .then(data => {        
                deferred.resolve(data)
        }).catch(err => {
            console.log("user not found")
            deferred.reject(err)
        })
    return deferred.promise;
}

/*
** 
    * @author:Kuldeep
    * @argument:contains file information
    * @description:Upload Project Past Events
   */
function projectFileInfo(req, res) {
    var deferred = Q.defer();
    var data = JSON.parse(req.body.fileInformation)
    var orgDocInformation = {
        filePath: data.filePath,
        fileName: data.fileName,
        type: data.type,
        projectId: data.projectId,
        projectRelation: data.projectRelation
    }
    var collectionName = 'ProjectFiles'
console.log("config.connectionString: ",config.cString)
 
crud.createData(config.cString, config.dbName, collectionName,orgDocInformation)
.then(data => {
    console.log("create function: ",data)
            // if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
          })
    return deferred.promise;
}

function updatePastEvent(req, res) {
    var deferred = Q.defer();
    var data = JSON.parse(req.body.fileInformation)
    fs.unlink(path.join(__dirname, "../" + data.oldFilePath), (err) => {
        if (err) throw err;
    })
    var collectionName = 'ProjectFiles'
    var condition = { _id: new ObjectId(data.id) };
    var set = { filePath: data.filePath, fileName: data.fileName }
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
        })
   
    return deferred.promise;
}


function deletePastEvent(req, res) {
    var data = req.body;
    var deferred = Q.defer();
    fs.unlink(path.join(__dirname, "../" + data.oldFilePath), (err) => {
        if (err) throw err;
    })
    var collectionName = 'ProjectFiles'
    
    crud.deleteById(config.cString, config.dbName, collectionName, data.id)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function updateProjectSupporter(req, res) {
    var deferred = Q.defer();
    var data = JSON.parse(req.body.fileInformation);
    fs.unlink(path.join(__dirname, "../" + data.oldFilePath), (err) => {
        if (err) throw err;
    })
    var collectionName = 'ProjectFiles'
    var condition = { _id: new ObjectId(data.id) };
    var set = { filePath: data.filePath, fileName: data.fileName }
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function deleteProjectSupporter(req, res) {
    var data = req.body;
    var deferred = Q.defer();
    fs.unlink(path.join(__dirname, "../" + data.oldFilePath), (err) => {
        if (err) throw err;
    })
    var collectionName = 'ProjectFiles'
    crud.deleteById(config.cString, config.dbName, collectionName, data.id)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}