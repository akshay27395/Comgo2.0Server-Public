var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var mail = require('./svr.email.service');
var sms = require('./svr.sms.service');
var twilioNumber = config.twilioNumber;
var random = require("random-js")(); // uses the nativeMath engine
var crud = require('./svr.crudService.service.js');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('ProjectMilestone');
db.bind('ProjectActivity');
db.bind('AuditTable');
db.bind('Project');
db.bind('User');


const rp = require('request-promise');

var service = {};

service.GetByProjname = GetByProjname;
service.getAllAudit = getAllAudit;
service.create = create;
service.getMilestoneById = getMilestoneById;
service.update = update;
service.delete = _delete;
service.UpdateFundReq = UpdateFundReq;
service.BKCFundReleased = BKCFundReleased;
service.BKCFundRequest = BKCFundRequest;
service.UpdateFundRel = UpdateFundRel;
service.UpdateProofStatus = UpdateProofStatus;
service.updateFundBudget = updateFundBudget;
service.getProjectMilestones = getProjectMilestones;
service.BKCGetAllDetails = BKCGetAllDetails;
// service.FundRequest = FundRequest;
service.getAllByMilestoneId = getAllByMilestoneId;


module.exports = service;


function getProjectMilestones(req, res) {
    var token = req.session.blockChainToken;
    console.log("getProjectMilestones params: ",req.params.id)
    var deferred = Q.defer();
    var url = config.Ip + "/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22projectId%5C%22:%5C%22"+ req.params.id +"%5C%22,%5C%22docType%5C%22:%5C%22Milestone%5C%22%7D%7D%22%2C%22PrivateUser%22%5D"
    console.log("getProjectMilestones: ",url);

    rp({
        uri: url,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        console.log("getProjectMilestones res",data)
        deferred.resolve({ message: "sucess", data: data });
    }).catch(function (err) {
        console.log("getProjectMilestones error",err)
        deferred.reject(err);
    })
    return deferred.promise;
}

// test()
function test() {
    var query = "{'selector':{'projectId':'Project1563429329400'}}"
    var url = config.Ip + "/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22"+query+"%22%2C%22PrivateUser%22%5D"
    console.log("url = ",url);
}

//#Akshay :- get history from blockchain
function BKCGetAllDetails(req, res) {
    var token = req.session.blockChainToken;
    var param = req.params.projectId;
    var deferred = Q.defer();
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=getHistory&args=%5B%22'+ param +'%22%2C%22' + param + '%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        deferred.resolve(data);
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}


function GetByProjname(_projectId) {
    var deferred = Q.defer();
    db.ProjectMilestone.find({ projectId: _projectId }).toArray(function (err, milestone) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(milestone);
    });
    return deferred.promise;
}

// # Akshay :- 19-08-2017 get all audit from audit table
function getAllAudit(projectId) {
    var deferred = Q.defer();
    db.AuditTable.find({ projectId: projectId }).toArray(function (err, milestone) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(milestone);
    });
    return deferred.promise;
}


function create(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    req.body.milestoneId = 'Milestone' + Date.now();
    var currentStatus = 'Milestone Created';
    req.body.insertMilestoneFlag = "Milestone " + req.body.milestone + " has been created for project by " + req.session.username
    var Description = req.body.insertMilestoneFlag;
    var body = {
        "peers": ["peer0.org1.example.com","peer1.org1.example.com"],
        "fcn": "addMilestone",
        "args": ["" + req.body.projectId + "", "" + req.body.milestoneId + "", "" + req.body.milestone + "", "" + req.body.startDate + "", "" + req.body.endDate + "", "" + Description + "", "" + currentStatus + "", "" + req.body.isApproved + "", "" + req.body.projectStatus + "", "" + req.body.insertMilestoneFlag + ""]
    };

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
        console.log("Milestone created bkc", data,body.args["length"])
        deferred.resolve({ message: "Milestone Created", data: req.body.milestoneId });
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}


function getMilestoneActivityCount(req, res) {
    var deferred = Q.defer();
    var activity = req.body;
    var milestoneId = activity.milestoneId;
    var activityId = activity.activityId;
    var activityBudget = activity.activityBudget;
    db.ProjectMilestone.find({ milestoneId: milestoneId }).toArray(function (err, data) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        var actCount = data[0].activityCount;
        var milestoneAmount = data[0].milestoneAmount;
        milestoneAmount = milestoneAmount + activityBudget;
        actCount.push(activityId);
        updateMilestoneActivityCount(milestoneId, actCount, milestoneAmount)
        deferred.resolve(data)
    });

    return deferred.promise;
}

function updateMilestoneActivityCount(milestoneId, actCount, milestoneAmount) {
    var deferred = Q.defer();

    var set = {
        activityCount: actCount,
        milestoneAmount: milestoneAmount
    };
    db.ProjectMilestone.update({ milestoneId: milestoneId }, { $set: set },
        function (err, data) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(data);
        });
    return deferred.promise;
}

//Akshay :01-11-2017 update Milestone status
function updateMilestoneStatus(req, res) {
    var deferred = Q.defer();
    var projectId = req.body.projectId;
    var status = 'Budgeted';
    // validation
    db.Project.findById(projectId, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        updateProject();
    });

    function updateProject() {
        // fields to update
        var set = {
            status: status,
        };
        db.Project.update({ projectId: projectId }, { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve(auditTrailUpdateMilestoneStatus(req, res));
            });
    }

    return deferred.promise;
}

// Akshay :- 01-11-2017 Audit trail for update milestone go to db
function auditTrailUpdateMilestoneStatus(req, res) {
    var deferred = Q.defer();
    var projectId = req.body.projId;
    var status = 'Budgeted';
    var role = req.session.role;
    var username = req.session.username;
    var set = {
        updatedDate: Date(),
        projectId: projectId,
        role: role,
        username: username,
        currentStatus: 'Milestone Updated',
        previousStatus: status
    };
    db.AuditTable.insert(
        set,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });
    return deferred.promise;
}

function getMilestoneById(req,milestoneId) {
    var deferred = Q.defer();
    var token = req.session.blockChainToken;
    console.log("getMilestoneById",milestoneId)
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=read&args=%5B%22read%22%2C%22' + milestoneId + '%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        console.log("getMilestoneById : ",data)
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}
// #GM 060717 :- Update FundRequested in ProjectMilestone
function UpdateFundReq(_id, fundReq) {
    var deferred = Q.defer();

    db.ProjectMilestone.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        updateProjectMilestone();

    });

    function updateProjectMilestone() {
        var set = {
            fundRequested: fundReq,
            status: 'Not Started'
        };


        db.ProjectMilestone.update({ milestoneId: _id }, { $set: set },
            function (err, milestone) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//# Akshay :- 27-07-2017 fund relese to blockchain///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
function BKCFundReleased(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    req.body.fundReleaseFlag = "Fund Released from "+ req.session.username;
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "fundRelease",
        "args": ["" + req.body.activityId + "", "" + req.body.status + "", "" + req.body.fundReq+ "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + req.body.fundReleaseFlag + ""]
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
        console.log("Fund Released : ",data)
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//# Akshay :- 27-07-2017 fund request to blockchain///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
function BKCFundRequest(req, res) {
    var deferred = Q.defer();
    console.log("BKCFundRequest Service: ",req.body)
    var blockChainToken = req.session.blockChainToken;
    req.body.requestFundFlag = "Fund Requested for activity " + req.body.activityName + " by " + req.session.username
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "fundReq",
        "args": ["" + req.body.activityId + "", "" + req.body.status + "", "" + req.body.fundReq+ "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + req.body.requestFundFlag + ""]
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
        console.log("Fund Request : ",data)
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}




// Akshay :- 02-08-2017 Audit trail for fund allocate go to db
function auditTrailFundAllocate(req, res) {
    var deferred = Q.defer();
    var projectId = req.params.projectId;
    var milestoneId = req.params.milestoneId;
    var activityId = req.params.activityId;
    var role = req.session.role;
    var username = req.session.username;
    var set = {
        updatedDate: Date(),
        projectId: projectId,
        milestoneId: milestoneId,
        activityId: activityId,
        role: role,
        username: username,
        currentStatus: 'Fund Allocated',
        previousStatus: 'Project Published'
    };
    db.AuditTable.insert(
        set,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });
    return deferred.promise;
}


// #GM 060717 :- Update FundReleased in ProjectMilestone
function UpdateFundRel(_id, fundRel) {
    var deferred = Q.defer();

    db.ProjectMilestone.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        updateProjectMilestone();

    });

    function updateProjectMilestone() {
        var set = {
            fundReleased: fundRel,
            status: 'In Progress'
        };

        db.ProjectMilestone.update({ milestoneId: _id }, { $set: set },
            function (err, milestone) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }
    return deferred.promise;
}

// #GM 060717 :- Update proof status in ProjectMilestone
function UpdateProofStatus(_id, status) {
    var deferred = Q.defer();

    db.ProjectMilestone.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        updateProjectMilestone();

    });

    function updateProjectMilestone() {
        var set = {
            status: status
        };

        db.ProjectMilestone.update({ milestoneId: _id }, { $set: set },
            function (err, milestone) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve(milestone);
            });
    }

    return deferred.promise;
}

//#MG update fundBudgeted
function updateFundBudget(_id, fundBudgeted) {
    var deferred = Q.defer();

    db.ProjectMilestone.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        updateProjectMilestone();

    });

    function updateProjectMilestone() {
        var set = {
            fundBudgeted: fundBudgeted
        };

        db.ProjectMilestone.update({ milestoneId: _id }, { $set: set },
            function (err, milestone) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    var currentStatus = req.body.status;
    req.body.updateMilestoneFlag = "Milestone " + req.body.milestone + " has been updated by " + req.session.username
    var Description = req.body.updateMilestoneFlag;
    var body = {
        "peers": ["peer0.org1.example.com","peer1.org1.example.com"],
        "fcn": "updateMilestone",
        "args": ["" + req.body.milestoneId + "", "" + req.body.milestone + "", "" + req.body.startDate + "", "" + req.body.endDate + "", "" + Description + "", "" + currentStatus + "", "" + req.body.projectStatus +"", "" + req.body.updateMilestoneFlag + ""]
    };

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
        console.log("milestone updated bkc", data)
        var Id = req.body.projectId;
        var blockChainToken = req.session.blockChainToken;
        if (req.body.status == 'Budgeted') {
            notifyBoard(req, res)
        }
        deferred.resolve({data:"Milestone Updated"});

    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}

function notifyBoard(req,res) {
    var deferred = Q.defer();
    db.User.find({ $and: [{ foundationCompany: req.body.foundationCompany, role: 'board' }] }).toArray(function (err, userDetails) {
        console.log("req.body : ", req.body.foundationCompany, req.body.projectName)
        console.log("boardDetails : ", userDetails)
        var tomail = '';
        var smsARR = [];
        for (det in userDetails) {
            var details = userDetails[det];
            if (details.email) {
                tomail = details.email + ';' + tomail;
                smsARR.push(details.phone)
            }
        }
        console.log("smsARR : ", smsARR)
        var from = 'crm@comgo.io'
        var subject = "Project Pending For Approval";
        var body = "There is a new project pending for approval : " + req.body.projectName
        var attachment = ''
        var filePath = ''
        var senderUsername = "crm@comgo.io"
            sms.sendMultipleSMS(req, smsARR, twilioNumber, body)
                .then(function (data) {
                    console.log("Response from send sms->", data)
                    deferred.resolve(data)
                }).catch(function (err) {
                    deferred.reject(err)
                })
    })
}


function getBKCById(Id, blockChainToken) {
    var deferred = Q.defer();
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=invoke&args=%5B%22read%22%2C%22' + Id + '%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + blockChainToken
        }
    }).then(function (data) {
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}



function _delete(req, res) {
    var deferred = Q.defer();
    var milestoneId = req.params.milestoneId;
    db.ProjectMilestone.remove({ milestoneId: milestoneId },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            auditTrailDeleteMilestone(req, res);
            deleteActivityByMilestone(req, res)
            deferred.resolve(deleteMilestoneFromBKC(req, res));
        });

    return deferred.promise;
}

function deleteMilestoneFromBKC(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    req.body.deleteMilestoneFlag = "Milestone " + req.params.milestone + " of project has been deleted by " + req.session.username
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "invoke",
        "args": ["delete_milestone", "" + req.params.role + "", "" + req.params.projectId + "", "" + req.params.milestoneId + "", "" + req.body.deleteMilestoneFlag + ""]
    };

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
        deferred.resolve({ message: "Milestone deleted.", data: data });
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}

function deleteActivityByMilestone(req, res) {
    var deferred = Q.defer();
    var milestoneId = req.params.milestoneId;
    db.ProjectActivity.remove({ milestoneId: milestoneId },
        function (err, data) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(auditTrailDeleteActivity(req, res));
        });

    return deferred.promise;
}


// Akshay :- 02-08-2017 Audit trail for update milestone go to db
function auditTrailDeleteMilestone(req, res) {
    var deferred = Q.defer();
    var projectId = req.params.projectId;
    var milestoneId = req.params.milestoneId;
    var milestone = req.params.milestone;
    var role = req.session.role;
    var username = req.session.username;

    var set = {
        updatedDate: Date(),
        projectId: projectId,
        milestoneId: milestoneId,
        milestone: milestone,
        role: role,
        username: username,
        currentStatus: 'Milestone Deleted',
        previousStatus: 'Not Initiated'
    };
    db.AuditTable.insert(
        set,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve();
        });
    return deferred.promise;
}

// Akshay :- 02-08-2017 Audit trail for update milestone go to db
function auditTrailDeleteActivity(req, res) {
    var deferred = Q.defer();
    var projectId = req.params.projectId;
    var milestoneId = req.params.milestoneId;
    var milestoneName = req.params.milestoneName;
    var role = req.session.role;
    var username = req.session.username;
    var set = {
        updatedDate: Date(),
        projectId: projectId,
        milestoneId: milestoneId,
        milestone: milestoneName,
        role: role,
        username: username,
        currentStatus: 'Activity Deleted',
        previousStatus: 'Not Initiated'
    };
    db.AuditTable.insert(
        set,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            deferred.resolve(doc);
        });
    return deferred.promise;
}

function getAllByMilestoneId(milestoneId) {
    var deferred = Q.defer();
    db.ProjectMilestone.find({ milestoneId: milestoneId }).toArray(function (err, milestone) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(milestone);
    });
    return deferred.promise;
}
