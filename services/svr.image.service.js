/**
 * Created By :- Madhu
 * Created Date :- 10-08-2018 12:30 pm
 * Version :- 1.0
 * * Created By :- Kuldeep
 * Created Date :- 05-09-2018 6:45 pm
 * * Version :- 1.1
 */

var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var ObjectId = require('mongodb').ObjectID;
var crud = require('./svr.crudService.service.js');

db.bind('ProjectImage');
db.bind('ProjectDocument');

var service = {};
service.createImage = createImage;
service.projectDocUpload = projectDocUpload;
service.projectDocUpdate = projectDocUpdate;

module.exports = service;

function createImage(req, res) {
    var deferred = Q.defer();
    var data = JSON.parse(req.body.fileInformation)
    var ProjectInformation
    if(data.type){
    ProjectInformation = {
        imageName: data.imageName,
        imagePath: data.imagePath,
        type: data.type,
        projectId: data.projectId
    }
}else{
    ProjectInformation = {
        imageName: data.imageName,
        imagePath: data.imagePath,
        type: "image/jpeg",
        projectId: data.projectId
    }
}
var collectionName = 'ProjectImage'
console.log("config.connectionString: ",config.cString)
 
crud.createData(config.cString, config.dbName, collectionName,ProjectInformation)
.then(data => {
    console.log("create function: ",data)
            // if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
          })
    return deferred.promise;
}

 /** 
        * @author:Kuldeep
        * @argument:contains file information
        * @description:Upload Project Document
       */
function projectDocUpload(req, res) {
    var deferred = Q.defer();
    var data = JSON.parse(req.body.fileInformation)
    var ProjectInformation = {
        docName: data.docName,
        docPath: data.docPath,
        projectId: data.projectId
    }
    db.ProjectDocument.insert(
        ProjectInformation,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(doc);
        });
    return deferred.promise;
}


function projectDocUpdate(req, res) {
    var deferred = Q.defer();
    var data = JSON.parse(req.body.fileInformation)
    console.log("Update Info:",data.docName,data.docPath)
    db.ProjectDocument.update({ _id: new ObjectId(req.query.fileId) }, { $set: { docPath: data.docPath, docName: data.docName } }, function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        console.log("file updated:",doc)
        deferred.resolve(doc);
    });
   
    return deferred.promise;
}