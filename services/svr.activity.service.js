/**
 * Created By :- Madhura
 * Created Date :- 06-07-2017 05:30 pm
 * Version :- 1.1
 * Updated By :- Akshay
 * Updated Date :- 17-08-2017 04:30 pm
 * Version :- 1.0.1 # Add audit trail into db
 */
var config = require('config.json');
var _ = require('lodash');
const rp = require('request-promise');
var Q = require('q');
var mongo = require('mongoskin');
var twilioNumber = config.twilioNumber;
var mail = require('./svr.email.service');
var sms = require('./svr.sms.service')
var db = mongo.db(config.connectionString, { native_parser: true });
var crud = require('./svr.crudService.service.js');
db.bind('ProjectActivity');
db.bind('AuditTable');
db.bind('User')

var service = {};

service.GetByProjname = GetByProjname;
service.getActivityByProjectId = getActivityByProjectId;
service.updateActivityDetails = updateActivityDetails;
service.delete = _delete;
service.approveActivity = approveActivity;
service.closeActivity = closeActivity;
service.allocateFunds = allocateFunds;
service.balancedFundAllocate = balancedFundAllocate;
service.createActivity = createActivity
//added by sagar
service.getActivityByActivityId = getActivityByActivityId;
service.getMilestoneActivities = getMilestoneActivities;
service.getActivityById = getActivityById;
service.sendForApproval = sendForApproval;
service.BKCActivityValidation = BKCActivityValidation;
module.exports = service;


function sendForApproval(req, res) {
    // fields to update
    var deferred = Q.defer();
    console.log("updateActivityDetails")
    var set = {
        status: req.body.status
    };
    var collectionName = 'ProjectActivity'
    var condition = {};
    condition["activityId"] = req.body.activityId;
    console.log("config.connectionString: ", config.cString)

    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            console.log("updateActivityDetails updated")
            deferred.resolve(sendForApprovalBKC(req, res));
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function BKCActivityValidation(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    if (req.body.status.startsWith('Partial Validation Successful')) {
        req.body.updateActivityFlag = "Partial Validation of Activity " + req.body.activityName + " has been done by " + req.session.username
    } else if (req.body.status.startsWith('Validation Successful')) {
        req.body.updateActivityFlag = "Activity " + req.body.activityName + " has been validated by " + req.session.username
    } else {
        req.body.updateActivityFlag = "Activity " + req.body.activityName + " has been validated by " + req.session.username
    }
    console.log("req.body : ", req.body)
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "updateActivityStatus",
        "args": ["" + req.body.activityId + "", "" + req.body.status + "", "" + req.body.isApproved + "", "" + req.body.remarks + "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + req.body.updateActivityFlag + ""]
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
        console.log("validate Activity res: ", data)
        deferred.resolve({ message: "Activity Updated", data: data });
    }).catch(function (error) {
        deferred.reject(error)
    })
    // deferred.resolve({ message: "Activity Updated"});
    return deferred.promise;
}

function sendForApprovalBKC(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    console.log("req.body.status : ", req.body.status)
    req.body.updateActivityFlag = "Activity " + req.body.activityName + " has been send for approval by " + req.session.username
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "updateActivityStatus",
        "args": ["" + req.body.activityId + "", "" + req.body.status + "", "" + req.body.isApproved + "", "" + req.body.remarks + "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + req.body.updateActivityFlag + ""]
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
        console.log("sendForApprovalBKC res: ", data)
        deferred.resolve({ message: "Activity Updated", data: data });
        sendApprovalSMS(req,res)
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}

function sendApprovalSMS(req, res) {
    var collectionName1 = 'User'
    var condition1 = {};
    var paramNotReq1 = {};
    console.log("req.body.organization: ",req.body.organization)
    var organizations = req.body.organization
    condition1 = { Rules: { $elemMatch: { $and: [{ orgName: {$in:organizations}, approve_Reject: true }] } } }
    crud.readByCondition(config.cString, config.dbName, collectionName1, condition1, paramNotReq1)
        .then(userDetails => {
            console.log("users: ",userDetails)
            var collectionName = 'MessageTemplate'
    var condition = {};
    var paramNotReq = {};
    condition["messageType"] = "approvalNotifyBoard";
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("data[0].smsBody: ",data[0].smsBody)
            var temp = data[0].smsBody
            var body = temp.replace("@@@@@", req.body.projectId)
            console.log("response body: ", body)
            var smsARR = [];
        for (det in userDetails) {
            var details = userDetails[det].phone;
            console.log("userDetails[det].phone: ",userDetails[det].phone)
                smsARR.push(details)
        }
        console.log("smsARR: ",smsARR)
            sms.sendMultipleSMS(req, smsARR, twilioNumber, body)
                .then(function (data) {
                    console.log("Response from send sms->", data)
                    deferred.resolve(data)
                }).catch(function (err) {
                    deferred.reject(err)
                })
        }
        )
        }).catch(err => {
            deferred.reject(err)
        })
}
function getActivityById(req, activityId) {
    var token = req.session.blockChainToken;
    var deferred = Q.defer();
    var activityId = activityId
    console.log("activityId: ", activityId)

    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=read&args=%5B%22read%22%2C%22' + activityId + '%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        var response = JSON.parse(data)
        console.log("getActivityById res", response)
        deferred.resolve(response);
    }).catch(function (err) {
        console.log("getActivityById error", err)
        deferred.reject(err);
    })
    return deferred.promise;
}

function getMilestoneActivities(req, res) {
    var token = req.session.blockChainToken;
    var deferred = Q.defer();
    var url = config.Ip + "/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22milestoneId%5C%22:%5C%22" + req.params.id + "%5C%22,%5C%22docType%5C%22:%5C%22Activity%5C%22%7D%7D%22%2C%22PrivateUser%22%5D"

    rp({
        uri: url,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        console.log("getMilestoneActivities res", data)
        deferred.resolve({ message: "sucess", data: data });
    }).catch(function (err) {
        console.log("getMilestoneActivities error", err)
        deferred.reject(err);
    })
    return deferred.promise;
}

function createActivity(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    req.body.activityId = "Activity" + Date.now();
    // var blockChainToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1NjM4Mjk4OTIsInVzZXJuYW1lIjoidXNlcjEiLCJvcmdOYW1lIjoiT3JnMSIsImlhdCI6MTU2Mzc5Mzg5Mn0.i7SXJZxWtCCUJERW1JQ7AVMMIjIo6uL2WJJZdzwI3xg'
    var username = 'user1'
    var status = 'Activity Created'
    req.body.remarks = 'No Remarks Added'
    var activityBudget = req.body.activityBudget.toString()
    req.body.insertActivityFlag = "Activity " + req.body.activityName + " has been created for project by " + username
    var description = req.body.insertActivityFlag
    body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "addActivity",
        "args": ["" + req.body.projectId + "", "" + req.body.milestoneId + "", "" + req.body.activityId + "", "" + req.body.activityName + "", "" + req.body.startDate + "", "" + req.body.endDate + "", "" + activityBudget + "", "" + description + "", "" + req.body.secondaryValidation + "", "" + req.body.remarks + "", "" + req.body.isApproved + "", "" + req.body.validatorId + "", "" + status + "", "" + req.body.technicalCriteria + "", "" + req.body.financialCriteria + "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + req.body.insertActivityFlag + ""]
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
        console.log("Activity Created:", data)
        deferred.resolve({ message: "Activity Created", data: data });
    }).catch(function (error) {
        console.log("Activity Create Error : ", error)
        deferred.reject(error);
    })
    return deferred.promise;
}

function allocateFunds(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    var status = "Fund Allocated"
    console.log("allocate Funds req body:", req.body.projectId, req.body.milestoneId, req.body.activityId, req.body.funds, req.body.fundsNotAllocated)
    req.body.fundAllocateFlag = "Fund Allocated Manually to " + req.body.activityName + " by " + req.session.username
    console.log("allocate Fund req.body: ", req.body)
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "fundAllocateManually",
        "args": ["" + req.body.activityId + "", "" + req.body.funds + "", "" + status + "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + req.body.fundsNotAllocated + "", "" + req.body.fundAllocateFlag + ""]
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
        console.log("allocate funds:", data)
        deferred.resolve({ message: "Fund has been allocated" });
    }).catch(function (error) {
        deferred.reject(error)
    })
    // deferred.resolve({message:"Fund has been allocated"});
    return deferred.promise;
}

function donate_ActivityUpdate(req, res) {
    var deferred = Q.defer();
    db.ProjectActivity.find({ activityId: req.body.activityId }).toArray(function (err, activity) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        console.log("req.body.activityId :", req.body.activityId)
        console.log("activity ", activity[0].donations)
        if (activity[0].donations) {
            var arr = activity[0].donations
            console.log("donations has been done")
            arr.push(req.session.username)
            var set = {
                donations: arr
            }
        } else {
            console.log("donations not done")
            var arr = []
            arr.push(req.session.username)
            var set = {
                donations: arr
            }
        }
        // console.log("donations element :",element)

        db.ProjectActivity.update({ activityId: req.body.activityId }, { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                console.log("Project Activity updated successfully : ", doc)
                deferred.resolve(doc);
            });
        return deferred.promise;
    });
}

function balancedFundAllocate(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    var funds = req.body.funds;
    var status = 'Fund Allocated'
    req.body.flag = 'Fund Allocated Manually'
    req.body.milestoneStatus = 'Fund Allocated'
    console.log("balanced_fund_allocate req body:", req.body.activityId, req.body.funds, req.body.activityId, req.body.milestoneStatus, req.body.flag, funds)
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "balancedfundAllocate",
        "args": ["" + req.body.activityId + "", "" + req.body.funds + "", "" + status + "", "" + funds + "", "" + req.body.milestoneStatus + "", "" + req.body.flag + ""]
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
        var res = JSON.parse(data)
        console.log("balancedFundAllocate res :", res)
        deferred.resolve({ message: "Fund has been allocated", BCStatus: res.BCStatus });
    }).catch(function (error) {
        deferred.reject(error)
    })

    return deferred.promise;
}

function closeActivity(req, res) {
    var deferred = Q.defer();
    console.log("closeActivity body:", req.body.activityName, req.body.activityId)
    var blockChainToken = req.session.blockChainToken;
    var closeActivityFlag = "Activity " + req.body.activityName + " closed by " + req.session.username;
    console.log("closeActivity flag:", closeActivityFlag)
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "updateActivityStatus",
        "args": ["" + req.body.activityId + "", "" + req.body.status + "", "" + req.body.isApproved + "", "" + req.body.remarks + "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + closeActivityFlag + ""]
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
        console.log("closeActivity:=====> ", data)
        BKCGetTransacHistory(req, res)
        deferred.resolve({ status: "Activity Closed" });
    }).catch(function (error) {
        console.log("inside catcgh")
        deferred.reject(error)
    })

    return deferred.promise;
}

function BKCGetTransacHistory(req, res) {
    var token = req.session.blockChainToken;
    var param = req.body.projectId;
    var deferred = Q.defer();
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=getHistory&args=%5B%22'+ param +'%22%2C%22' + param + '%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(async function (data) {
        var resData = JSON.parse(data);
        var transactions = resData.reverse()
        var donationString
        var userNameList = [];
        for(var i = 0;i < transactions[0].Value.donations.length;i++){
            await new Promise(next => {
            donationString = transactions[0].Value.donations[i].split("-", 5) 
            if (req.body.activityId == donationString[2]){
                console.log("history data => ",donationString)
                userNameList.push(donationString[3])
            }
            next()
        })
        }
        console.log("username list: ",userNameList);
        var collectionName = 'User'
    var condition = { username: { $in: userNameList } };
    var paramNotReq = {};
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(userDetails => {
            var tomail = '';
            for (det in userDetails) {
                var details = userDetails[det];
                if (details.email) {
                    //var email = details.email;
                    tomail = details.email + ';' + tomail;
                }
            }
                var from = 'crm@comgo.io'
                var subject = 'Activity Closed';
                var attachment = ''
                    var filePath = ''
                    var emailbody = "Activity Closed By "+req.session.username;
                    var senderUsername = "crm@comgo.io"
                    var senderPassword = "ComGo1!2@3#4$"
                    mail.sendMail(req, from, tomail, tomail, subject, emailbody, attachment, filePath, senderUsername, senderPassword)
                        .then(function (data) {
                            console.log("Response from send mail->", data)
                            checkActivitesStatus(req,res)
                        }).catch(function (err) {
                            deferred.reject(err)
                        })
        }).catch(err => {
            deferred.reject(err)
        });
        deferred.resolve(data);
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}

function checkActivitesStatus(req, res) {
    console.log("activities status:")
        var token = req.session.blockChainToken;
    var deferred = Q.defer();
    var url = config.Ip + "/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=query&args=%5B%22%7B%5C%22selector%5C%22:%7B%5C%22milestoneId%5C%22:%5C%22" + req.body.milestoneId + "%5C%22,%5C%22docType%5C%22:%5C%22Activity%5C%22%7D%7D%22%2C%22PrivateUser%22%5D"
    console.log("getMilestoneActivities: ", url,token);

    rp({
        uri: url,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(async function (data) {
        console.log("checkActivitesStatus data: ",data)
        var res = JSON.parse(data)
        var activities = res;
        console.log("checkActivitesStatus:", activities)
        var closedActivity = true;
        for (var i = 0; i < activities.length; i++) {
            await new Promise(next => {
                console.log("activities[i].Record.status :", activities[i].Record.status)
                if (activities[i].Record.status != 'Activity Closed') {
                    closedActivity = false;
                    // break;
                }
                next()
            })
        }
        console.log("closedActivity:", closedActivity)
        if (closedActivity == true) {
            getCRMUsersOfProject(req, res)
        }
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}

function getCRMUsersOfProject(req, res) {
    console.log("getCRMUsersOfProject:", req.body)
    var token = req.session.blockChainToken;
    var deferred = Q.defer();
    var userNameList = [];
    var collectionName1 = 'User'
    var condition1 = {};
    var paramNotReq1 = {};
    var organizations = req.body.projectOwner
    console.log("organizations: ",organizations)
    condition1 = { Rules: { $elemMatch: { $and: [{ orgName: organizations, crm_Notification: true }] } } }
    crud.readByCondition(config.cString, config.dbName, collectionName1, condition1, paramNotReq1)
        .then(crmUsers => {
        var tomail = '';
        var u;
        console.log("CRM Users:", crmUsers)
        for (u in crmUsers) {
            userNameList.push(crmUsers[u]);
            tomail = crmUsers[u].email + ';' + tomail;
        }

        var emailbody = "Milestone " + req.body.milestoneName + " of project " + req.body.projectName + " has been completed"
        var tomail = tomail;
        var bcc = tomail
        var subject = req.body.projectName + "- Milestone closed"
        var from = 'crm@comgo.io'
        var attachment = ''
        var filePath = ''
        var senderUsername = "crm@comgo.io"
        var senderPassword = "ComGo1!2@3#4$"

        mail.sendMail(req, from, tomail, bcc, subject, emailbody, attachment, filePath, senderUsername, senderPassword)
            .then(function (data) {
                console.log("Response from send mail->", data)
                deferred.resolve(data)
            }).catch(function (err) {
                deferred.reject(err)
            })
    })
    return deferred.promise;
}



function approveActivity(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    if (req.body.statusFlag == true) {
        req.body.approveActivityFlag = "Activity " + req.body.activityName + " of project has been approved by " + req.session.username
    } else {
        req.body.approveActivityFlag = "Activity " + req.body.activityName + " of project has been rejected by " + req.session.username
    }
    console.log("req.body.remarks :", req.body.remarks)
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "updateActivityStatus",
        "args": ["" + req.body.activityId + "", "" + req.body.status + "", "" + req.body.isApproved + "", "" + req.body.remarks + "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + req.body.approveActivityFlag + ""]
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
        console.log("bKCApproveActivity res: ", data)
        deferred.resolve({ message: "Activity Updated", data: data });
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
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

function updateActivityDetails(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    var status = req.body.status;
    if (req.body.status == 'Budgeted') {
        req.body.updateActivityFlag = "Activity " + req.body.activityName + " has been send for approval by " + req.session.username
    } else {
        req.body.updateActivityFlag = "Activity " + req.body.activityName + " has been updated by " + req.session.username
    }
    var description = req.body.insertActivityFlag
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "updateActivity",
        "args": ["" + req.body.activityId + "", "" + req.body.activityName + "", "" + req.body.startDate + "", "" + req.body.endDate + "", "" + req.body.activityBudget + "", "" + description + "", "" + req.body.secondaryValidation + "", "" + req.body.remarks + "", "" + req.body.isApproved + "", "" + req.body.validatorId + "", "" + status + "", "" + req.body.technicalCriteria + "", "" + req.body.financialCriteria + "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + req.body.updateActivityFlag + ""]
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
        console.log("updateActivityToBKC res: ", data)
        deferred.resolve({ message: "Activity Updated", data: data });
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}


function GetByProjname(_projectId) {
    var deferred = Q.defer();
    db.ProjectActivity.find({ projectId: _projectId }).toArray(function (err, milestone) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(milestone);
    });
    return deferred.promise;
}


function getActivityByProjectId(projectId) {
    var deferred = Q.defer();
    db.ProjectActivity.find({ projectId: projectId }).toArray(function (err, milestone) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(milestone);
    });
    return deferred.promise;
}

function _delete(req, res) {
    var deferred = Q.defer();
    var _id = req.params._id;
    db.ProjectActivity.remove({ activityId: req.body.activityId },
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            auditTrailDeleteActivity(req, res);
            deferred.resolve(deleteActivityFromBKC(req, res));
        });

    return deferred.promise;
}

function deleteActivityFromBKC(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    req.body.deleteActivityFlag = "Activity " + req.params.activityName + " of project has been deleted by " + req.session.username
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "invoke",
        "args": ["delete_activity", "" + req.params.role + "", "" + req.params.projectId + "", "" + req.params.milestoneId + "", "" + req.params.activityId + "", "" + req.body.deleteActivityFlag + ""]
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
        deferred.resolve({ message: "Activity Deleted", data: data });
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

// Akshay :- 02-08-2017 Audit trail for update milestone go to db
function auditTrailDeleteActivity(req, res) {
    var deferred = Q.defer();
    var projectId = req.params.projectId;
    var milestoneId = req.params.milestoneId;
    var activityId = req.params.activityId;
    var milestoneName = req.params.milestoneName;
    var activityName = req.params.activityName;
    var role = req.session.role;
    var username = req.session.username;
    var set = {
        updatedDate: Date(),
        projectId: projectId,
        milestoneId: milestoneId,
        milestone: milestoneName,
        activityName: activityName,
        activityId: activityId,
        role: role,
        username: username,
        currentStatus: 'Activity Deleted',
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

function getActivityByActivityId(activityId) {
    var deferred = Q.defer();
    db.ProjectActivity.find({ activityId: activityId }).toArray(function (err, activity) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(activity);
    });
    return deferred.promise;
}