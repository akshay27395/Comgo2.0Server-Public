var config = require('config.json');
var ObjectId = require('mongodb').ObjectID;
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var Q = require('q');
var mongo = require('mongoskin');
var crud = require('./svr.crudService.service.js');
var rp = require('request-promise');
var db = mongo.db(config.connectionString, { native_parser: true });

db.bind('Project');
db.bind('AuditTable');
db.bind('PrivateDonors');
db.bind('SDG');
db.bind('ProjectActivity');
db.bind('PublishedProjectFiles');
db.bind('ProjectImage');

var service = {};


service.create = create;
service.publishProject = publishProject;
service.updateProject = updateProject;
service.GetByProjId = getByProjid;
service.getAllSDG = getAllSDG;
service.projectFiles = projectFiles;
service.approveProject = approveProject;
service.getAllProjects = getAllProjects;
service.deleteProjectImage = deleteProjectImage
service.getProjectForWebsite = getProjectForWebsite;
service.publishedProjectFilesWeb = publishedProjectFilesWeb;
service.getProjectActivities = getProjectActivities
service.getAllPublishedProjects = getAllPublishedProjects
service.getOrgPublishedProjects = getOrgPublishedProjects
service.changeProjectVisibility = changeProjectVisibility
service.getMyProjects = getMyProjects
service.BKCGetAllDetailsByParamsWeb = BKCGetAllDetailsByParamsWeb;
service.getProjRatings = getProjRatings;
module.exports = service;

/**
 * @author: Kuldeep
 * @description: This function will return project ratings
 */
function getProjRatings(session,projectId) {
    var deferred = Q.defer();

    var collectionName = 'ProjectRating'
    var condition = {};
    condition["projectId"] = projectId;
    var paramNotReq = {};
    console.log("config.connectionString: ", config.cString,condition)

    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function getAllProjectsForWebSite(reqBody, session, params, query) {
    var deferred = Q.defer();
    var token = session.blockChainToken;
    var body = 'username=mrfuser1&orgName=Org1';
    console.log("getAllProjectsForWebSite")
    rp({
        method: 'POST',
        uri: config.Ip + '/users',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (enrollRes) {
        var bcData = JSON.parse(enrollRes);
        var blockChainToken = bcData["token"]
        console.log("blockChainToken: ",blockChainToken)
        rp({
            uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22isPublished%5C%22:true,%5C%22docType%5C%22:%5C%22Project%5C%22%7D%7D%22%2C%22PrivateUser%22%5D',
            headers: {
                'User-Agent': 'Request-Promise',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + blockChainToken
            }
        }).then(function (data) {
            console.log("getMyProjects: ", data)
            deferred.resolve(data);
        }).catch(function (error) {
            deferred.reject(error);
        })
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

function BKCGetAllDetailsByParamsWeb(reqBody, res) {
    var deferred = Q.defer();
    var projectOwner = 'comgoWebsite';
    var body = 'username=' + projectOwner + '&orgName=Org1';
    rp({
        method: 'POST',
        uri: config.Ip + '/users',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (data) {
        var tokenData = JSON.parse(data);
        console.log("req.body.bcData", tokenData.token)
        token = tokenData.token;
        deferred.resolve(BKCGetAllDetailsByParamsWeb2(reqBody, res, token));
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}

function BKCGetAllDetailsByParamsWeb2(reqBody, res, token) {
    var token = token;
    var param = reqBody.projId;
    var deferred = Q.defer();
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=read&args=%5B%22read%22%2C%22' + param + '%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        var projectData = JSON.parse(data)
        deferred.resolve(projectData);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

function getMyProjects(reqBody, session, params, query) {
    var deferred = Q.defer();
    var token = session.blockChainToken;
    console.log("params: ", params.userType)
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22isPublished%5C%22:true,%5C%22docType%5C%22:%5C%22Project%5C%22%7D%7D%22%2C%22PrivateUser%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        console.log("getMyProjects: ", data)
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

function changeProjectVisibility(req, reqBody, session, params, query) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    // console.log("Inside updateProjectToBKC function : ",reqBody.projectId," ",reqBody.projectOwner," ",reqBody.projectName," ",reqBody.fundGoal.toString()," ",reqBody.projectType," ",reqBody.startDate," ",reqBody.endDate," ",reqBody.description," ",reqBody.currency," ",reqBody.FundRaised," ",reqBody.FundAllocated," ",reqBody.projectBudget," ",reqBody.fundAllocationType," ",reqBody.isPublished," ",reqBody.status," ",reqBody.updateFlag," ",reqBody.lat," ",reqBody.long," ",reqBody.country)
    console.log("reqBody.visibility: ", reqBody.visibility)
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "updateProjectVisibility",
        "args": ["" + reqBody.projectId + "", "" + reqBody.visibility + ""]
    }
    rp({
        method: 'POST',
        uri: config.Ip + '/channels/mychannel/chaincodes/test',
        body: JSON.stringify(body),
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + blockChainToken
        }

    }).then(function (data) {
        console.log("project updated response", data)
        // notifyBoard(reqBody, session, params, query)
        deferred.resolve({ message: "Project Updated.", projectId: reqBody.projectId });
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

function getProjectActivities(req, res) {
    console.log("Project Id: ")
    var token = req.session.blockChainToken;
    var deferred = Q.defer();
    var url = config.Ip + "/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22projectId%5C%22:%5C%22" + req.params.projectId + "%5C%22,%5C%22docType%5C%22:%5C%22Activity%5C%22%7D%7D%22%2C%22PrivateUser%22%5D"
    console.log("getMilestoneActivities: ", url);

    rp({
        uri: url,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        console.log("getProjectActivities res", data)
        deferred.resolve({ message: "sucess", data: data });
    }).catch(function (err) {
        console.log("getMilestoneActivities error", err)
        deferred.reject(err);
    })
    return deferred.promise;
}

function getProjectForWebsite(reqBody, res) {
    console.log("reqBody.orgName :", reqBody.id)
    var deferred = Q.defer();
    var projectOwner = 'comgoWebsite';
    var body = 'username=' + projectOwner + '&orgName=Org1';
    rp({
        method: 'POST',
        uri: config.Ip + '/users',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (data) {
        var tokenData = JSON.parse(data);
        console.log("req.body.bcData", tokenData.token)
        token = tokenData.token;
        deferred.resolve(BKCAllByParamsForProject(reqBody, res, token));
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}

function BKCAllByParamsForProject(reqBody, res, token) {
    var token = token;
    var param = reqBody.id;
    // console.log("BKCGetAllDataByParams Id : ", param, token)
    var deferred = Q.defer();
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=invoke&args=%5B%22read%22%2C%22' + param + '%22%5D',
        //  uri:config.Ip+'/channels/mychannel/chaincodes/test?peer=peer1&fcn=invoke&args=%5B%22getHistory%22%2C%22'+param+'%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        console.log("BKCGetAllDataByParams data", data)
        deferred.resolve({ message: "sucess", data: data });
        // res.send(data,len);
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}

function publishedProjectFilesWeb(projectId) {
    console.log("publishedProjectFilesWeb :")
    var deferred = Q.defer();
    var projectOwner = 'comgoWebsite';
    var body = 'username=' + projectOwner + '&orgName=Org1';
    rp({
        method: 'POST',
        uri: config.Ip + '/users',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (data) {
        var tokenData = JSON.parse(data);
        console.log("req.body.bcData", tokenData.token)
        token = tokenData.token;
        deferred.resolve(publishedProjectFilesWeb2(projectId, token));
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}

function publishedProjectFilesWeb2(projectId, token) {
    var deferred = Q.defer();
    console.log("projectId : ", projectId)
    db.PublishedProjectFiles.find({ projectId: projectId }).toArray(function (err, filesInfo) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(filesInfo);
    });
    return deferred.promise;
}

function deleteProjectImage(req, res) {
    var data = req.body
    var deferred = Q.defer();
    fs.unlink(path.join(__dirname, "../" + data.oldFilePath), (err) => {
        if (err) throw err;
    })
    db.ProjectImage.remove({ _id: new ObjectId(data.id) }, function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(doc);
    });
    return deferred.promise;
}

/**
   * @author: Kuldeep
   * @argument:projectId :- contains project id.
   * @description:used to get data of published project files
   */
function projectFiles(projectId) {
    var deferred = Q.defer();
    var collectionName = 'ProjectFiles'
    var condition = {};
    var paramNotReq = {};
    condition["projectId"] = projectId;
    console.log("config.connectionString: ", config.cString)

    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("projectFiles res : ", data)
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}





function create(reqBody, session, params, query) {
    var deferred = Q.defer();
    reqBody.projectId = "Project" + Date.now();
    var blockChainToken = session.blockChainToken;

    var tempSDG = [];
    var sdg = reqBody.SDG;
    reqBody.flag = "Project " + reqBody.projectName + " created by " + session.username

    for (i = 0; i < sdg.length; i++) {
        var first = sdg[i];
        var finalSDG = JSON.stringify(first);
        var testSDG = '\"' + first + '\"';
        tempSDG.push(testSDG)
    }

    var prjBody = {}
    var peerArr = [];
    peerArr.push("peer0.org1.example.com");
    peerArr.push("peer1.org1.example.com");
    prjBody["peers"] = peerArr;
    prjBody["fcn"] = "invoke";
    var args = [];
    args.push("init_project");
    args.push(reqBody.role);
    args.push(reqBody.projectId);
    args.push(reqBody.projectName);
    args.push(reqBody.projectType);
    args.push(reqBody.fundGoal.toString());
    args.push(reqBody.currency);
    args.push(reqBody.fundAllocationType);
    args.push(reqBody.ngoId);
    args.push(JSON.stringify(reqBody.SDG));
    args.push(reqBody.foundationCompany);
    args.push(reqBody.lat);
    args.push(reqBody.long);
    args.push(reqBody.subRole);
    args.push(reqBody.startDate);
    args.push(reqBody.endDate);
    args.push(reqBody.description);
    args.push(reqBody.projectBudget.toString());
    args.push(reqBody.country);
    args.push(reqBody.flag);
    prjBody["args"] = args;
    console.log("JSON.stringify(reqBody.SDG) :", JSON.stringify(reqBody.SDG))
    console.log("JSON.stringify(reqBody.organizations) :", JSON.stringify(reqBody.organizations))
    console.log("JSON.stringify(reqBody.beneficiaries) :", JSON.stringify(reqBody.beneficiaries))
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "addProject",
        "args": ["" + reqBody.projectId + "", "" + reqBody.projectOwner + "", "" + JSON.stringify(reqBody.organizations) + "", "" + reqBody.projectName + "", "" + reqBody.fundGoal.toString() + "", "" + reqBody.projectType + "", "" + reqBody.startDate + "", "" + reqBody.endDate + "", "" + reqBody.description + "", "" + reqBody.currency + "", "" + reqBody.FundRaised.toString() + "", "" + reqBody.FundAllocated.toString() + "", "" + reqBody.projectBudget + "", "" + JSON.stringify(reqBody.organizations) + "", "" + reqBody.fundAllocationType + "", "" + reqBody.isPublished + "", "" + reqBody.status + "", "" + reqBody.flag + "", JSON.stringify(reqBody.SDG), "" + reqBody.lat + "", "" + reqBody.long + "", "" + reqBody.country + "", "" + reqBody.fundNotAllocated + "", "" + JSON.stringify(reqBody.beneficiaries) + ""]
    }
    rp({
        method: 'POST',
        uri: config.Ip + '/channels/mychannel/chaincodes/test',
        body: JSON.stringify(body),
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + blockChainToken
        }

    }).then(function (data) {
        console.log("project added response", data)
        deferred.resolve({ message: "Project created.", projectId: reqBody.projectId });
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

function notifyBoard(reqBody, session, params, query) {
    var deferred = Q.defer();
    db.User.find({ $and: [{ foundationCompany: reqBody.foundationCompany, role: 'board' }] }).toArray(function (err, userDetails) {
        console.log("boardDetails : ", userDetails)
        var tomail = '';
        for (det in userDetails) {
            var details = userDetails[det];
            if (details.email) {
                //var email = details.email;
                tomail = details.email + ';' + tomail;
            }
        }
        var from = 'crm@comgo.io'
        var subject = "Project Pending For Approval";
        var emailbody = "There is a new project pending for approval:" + reqBody.projectName
        var attachment = ''
        var filePath = ''
        var senderUsername = "abc@gmail.com"
        var senderPassword = "xyz"
        mail.sendMail(reqBody, from, tomail, tomail, subject, emailbody, attachment, filePath, senderUsername, senderPassword)
            .then(function (data) {
                console.log("Response from send mail->", data)
                deferred.resolve({ message: "Project created.", projectId: reqBody.projectId });
            }).catch(function (err) {
                deferred.reject(err)
            })
    })
}
// Akshay :- 02-08-2017 Audit trail go to db
function auditTrail(reqBody, session, params, query) {
    // var temp = JSON.stringify(doc.ops[0].projectId);
    var deferred = Q.defer();
    var projectId = reqBody.projectId;
    var role = session.role;
    var username = session.username;

    var set = {
        updatedDate: Date(),
        projectId: projectId,
        role: role,
        username: username,
        currentStatus: 'Project Created'
    };
    var collectionName = 'AuditTable'
    console.log("config.connectionString: ", config.cString)

    crud.createData(config.cString, config.dbName, collectionName, set)
        .then(data => {
            console.log("create function: ", data)
            // if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function approveProject(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    req.body.projectApproveflag = "Project " + req.body.projectName + " has been approved by " + req.session.username

    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "updateProjectStatus",
        "args": ["" + req.body.projectId + "", "" + req.body.status + "", "" + req.body.projectApproveflag + "", "" + req.body.isPublished + "", "" + req.body.isApproved + "", "" + req.body.remarks + ""]
    }
    rp({
        method: 'POST',
        uri: config.Ip + '/channels/mychannel/chaincodes/test',
        body: JSON.stringify(body),
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + blockChainToken
        }

    }).then(function (data) {
        console.log("approve Project:", data)
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}

function updateProject(req, reqBody, session, params, query) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    console.log("JSON.stringify(reqBody.beneficiaries): ", JSON.stringify(reqBody.beneficiaries))
    reqBody.updateFlag = "Project " + reqBody.projectName + " has been updated by " + session.username
    // console.log("Inside updateProjectToBKC function : ",reqBody.projectId," ",reqBody.projectOwner," ",reqBody.projectName," ",reqBody.fundGoal.toString()," ",reqBody.projectType," ",reqBody.startDate," ",reqBody.endDate," ",reqBody.description," ",reqBody.currency," ",reqBody.FundRaised," ",reqBody.FundAllocated," ",reqBody.projectBudget," ",reqBody.fundAllocationType," ",reqBody.isPublished," ",reqBody.status," ",reqBody.updateFlag," ",reqBody.lat," ",reqBody.long," ",reqBody.country)
    console.log("JSON.stringify(reqBody.projectOwner) :", JSON.stringify(reqBody.projectOwner))
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "updateProject",
        "args": ["" + reqBody.projectId + "", "" + reqBody.projectOwner + "", "" + JSON.stringify(reqBody.organizations) + "", "" + reqBody.projectName + "", "" + reqBody.fundGoal.toString() + "", "" + reqBody.projectType + "", "" + reqBody.startDate + "", "" + reqBody.endDate + "", "" + reqBody.description + "", "" + reqBody.currency + "", "" + reqBody.FundRaised.toString() + "", "" + reqBody.FundAllocated.toString() + "", "" + reqBody.projectBudget + "", "" + JSON.stringify(reqBody.organizations) + "", "" + reqBody.fundAllocationType + "", "" + reqBody.isPublished + "", "" + reqBody.status + "", "" + reqBody.updateFlag + "", JSON.stringify(reqBody.SDG), "" + reqBody.lat + "", "" + reqBody.long + "", "" + reqBody.country + "", "" + reqBody.fundNotAllocated + "", "" + JSON.stringify(reqBody.beneficiaries) + ""]
    }
    rp({
        method: 'POST',
        uri: config.Ip + '/channels/mychannel/chaincodes/test',
        body: JSON.stringify(body),
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + blockChainToken
        }

    }).then(function (data) {
        console.log("project updated response", data)
        // notifyBoard(reqBody, session, params, query)
        deferred.resolve({ message: "Project Updated.", projectId: reqBody.projectId });
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}


// # Akshay :- 26-07-2017 call invoke function and send projectid to blockchain published project
function publishProject(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    req.body.projectPublishflag = "Project " + req.body.projectName + " has been published by " + req.session.username

    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "updateProjectStatus",
        "args": ["" + req.body.projectId + "", "" + req.body.status + "", "" + req.body.projectPublishflag + "", "" + req.body.isPublished + "", "" + req.body.isApproved + "", "" + req.body.remarks + ""]
    }
    rp({
        method: 'POST',
        uri: config.Ip + '/channels/mychannel/chaincodes/test',
        body: JSON.stringify(body),
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + blockChainToken
        }

    }).then(function (data) {
        console.log("Project Published:", data)
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}


function getByProjid(session, projId) {
    var deferred = Q.defer();
    var token = session.blockChainToken;
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=read&args=%5B%22read%22%2C%22' + projId + '%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

function getAllSDG() {
    var deferred = Q.defer();

    var collectionName = 'SDG'
    var condition = {};
    var paramNotReq = {};
    console.log("config.connectionString: ", config.cString)

    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


function getAllProjects(reqBody, session, params, query) {
    var deferred = Q.defer();
    var token = session.blockChainToken;
    console.log("req.params: ", params.orgName)
    rp({
        // uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22isPublished%5C%22:false,%5C%22docType%5C%22:%5C%22Project%5C%22%7D%7D%22%2C%22PrivateUser%22%5D',
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22docType%5C%22:%5C%22Project%5C%22,%5C%22isPublished%5C%22:false,%5C%22organization%5C%22:%7B%5C%22$elemMatch%5C%22:%20%7B%5C%22OrgName%5C%22:%20%5C%22' + params.orgName + '%5C%22%7D%7D%7D%7D%22%2C%22PrivateUser%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

function getAllPublishedProjects(reqBody, session, params, query) {
    var deferred = Q.defer();
    var token = session.blockChainToken;
    var uri;
    if (params.userType == 'Private User') {
        console.log("params: ", params.userType)
        uri = config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22docType%5C%22:%5C%22Project%5C%22,%5C%22isPublished%5C%22:true,%5C%22visibility%5C%22:%5C%22Public%5C%22%7D%7D%22%2C%22PrivateUser%22%5D'
    } else {
        uri = config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22docType%5C%22:%5C%22Project%5C%22,%5C%22isPublished%5C%22:true,%5C%22$or%5C%22:%20[%7B%5C%22visibility%5C%22:%5C%22Only%20Organizations%5C%22%7D,%7B%5C%22visibility%5C%22:%5C%22Public%5C%22%7D]%7D%7D%22%2C%22PrivateUser%22%5D'
    }
    rp({
        uri: uri,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        console.log("getAllPublishedProjects: ", data)
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

function getOrgPublishedProjects(reqBody, session, params, query) {
    var deferred = Q.defer();
    var token = session.blockChainToken;
    var orgName = params.orgName
    console.log("getOrgPublishedProjects: ", orgName)
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22docType%5C%22:%5C%22Project%5C%22,%5C%22isPublished%5C%22:true,%5C%22organization%5C%22:%7B%5C%22$elemMatch%5C%22:%20%7B%5C%22OrgName%5C%22:%20%5C%22' + orgName + '%5C%22%7D%7D%7D%7D%22%2C%22PrivateUser%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        console.log("getAllPublishedProjects: ", data)
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}