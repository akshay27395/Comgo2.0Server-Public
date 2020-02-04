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
var crud = require('./svr.crudService.service.js');

db.bind('ProjectImage');
db.bind('ProjectDocument');

var service = {};
service.createImage = createImage;
service.projectDocUpload = projectDocUpload;

module.exports = service;

function createImage(req, res) {
    var deferred = Q.defer();
    console.log("multipleImage service uploadProjectImages:", req.body)
    var data = JSON.parse(req.body.fileInformation)
    var length = data.length;
    console.log("image length:",length);
    for (var i = 0; i < data.length; i++) {
        console.log("data[i].imageName:",data[i].imageName);
        var ProjectInformation = {
            imageName: data[i].imageName,
            imagePath: data[i].imagePath,
            type: data[i].type,
            projectId: data[i].projectId
        }
        db.ProjectImage.insert(
            ProjectInformation,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(doc);
            });
    }
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
    var collectionName = 'ProjectDocument'
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