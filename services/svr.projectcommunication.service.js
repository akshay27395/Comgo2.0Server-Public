/**
 *Created By :- Mamta
 * Created Date :- 5-10-2017 03:30 pm
 * Version :- 1.0
 */
var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var nodemailer = require("nodemailer");
var rp = require('request-promise');
var accountSid = config.accountSid;
var authToken = config.authToken;
var twilioNumber = config.twilioNumber;
var client = require('twilio')(accountSid, authToken);
var mail = require('./svr.email.service');
var sms = require('./svr.sms.service');
const fs = require('fs');
var crud = require('./svr.crudService.service.js');

var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('ProjectDonation');
db.bind('NotificationPreference');
db.bind('SaveDonate');
db.bind('User');
db.bind('SmsNotification');
db.bind('MessageTemplate');
db.bind('ProjectActivity');
var service = {};

service.getAll = getAll;
service.saveEmail = saveEmail;
service.GetAllReceiveSms = GetAllReceiveSms

module.exports = service;

function getAll(projId, donorId) {
    var deferred = Q.defer();
    db.ProjectDonation.find({ projectId: projId, donorId: donorId }).toArray(function (err, alldonor) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(alldonor);
    });
    return deferred.promise;
}

function saveEmail(req, res) {
    var deferred = Q.defer();
    var body = req.body;
    if (body.finalRepOly == 'All updates') {
        var notification = { projectId: body.projectId, donationType: 'Donation' }
    } else if (body.finalRepOly == 'Important Reports') {
        var notification = { $and: [{ projectId: body.projectId, donationType: 'Donation' }, { notificationPreference: { $ne: 'All updates' } }] }
    } else {
        var notification = { $and: [{ notificationPreference: body.finalRepOly, projectId: body.projectId }] }
    }
    db.SaveDonate.find(notification).toArray(function (err, alldonor) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        var userNameList = [];
        for (u in alldonor) {
            var user = alldonor[u];
            if (user.username && !userNameList.includes(user.username)) {
                userNameList.push(user.username);
            }
        }
        console.log("username list:", userNameList);
        var collectionName = 'User'
        var condition = { username: { $in: userNameList } };
        var paramNotReq = {};
        crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
            .then(userDetails => {
                var body = req.body;
                var tomail = '';
                for (det in userDetails) {
                    var details = userDetails[det];
                    if (details.email) {
                        //var email = details.email;
                        tomail = details.email + ';' + tomail;
                    }
                }
                if (body.email) {
                    req.fileName = body.fileName;
                    var from = 'crm@comgo.io'
                    var subject = body.subject;
                    var emailbody = body.email
                    if (body.fileName) {
                        var attachment = body.fileName
                        var filePath = './crmFiles/' + body.fileName
                    } else {
                        var attachment = ''
                        var filePath = ''
                    }
                    var senderUsername = "crm@comgo.io"
                    var senderPassword = "ComGo1!2@3#4$"
                    mail.sendMail(req, from, tomail, tomail, subject, emailbody, attachment, filePath, senderUsername, senderPassword)
                        .then(function (data) {
                            console.log("Response from send mail->", data)
                            if (req.fileName) {
                                fs.unlink('./crmFiles/' + req.fileName, function (error) {
                                    if (error) {
                                        throw error;
                                    }
                                });
                            }
                        }).catch(function (err) {
                            deferred.reject(err)
                        })
                }

                if (body.sms) {
                    var smsId = Date.now();
                    for (det in userDetails) {
                        var details = userDetails[det];
                        if (details.phone) {
                            var toNumber = details.phone;
                            var set = {
                                mobileNo: toNumber,
                                smsBody: body.sms,
                                createDtTm: Date(),
                                sendDtTm: "0",
                                sendStatus: "0",
                                AckStatus: "0",
                                smsId: smsId
                            }
                            db.SmsNotification.insert(
                                set,
                                function (err, doc) {
                                    if (err) deferred.reject(err.name + ': ' + err.message);
                                    deferred.resolve(doc);
                                });
                            sms.sendSMS(req, toNumber, twilioNumber, body.sms)
                                .then(function (data) {
                                    console.log("Response from send sms->", data)
                                    deferred.resolve({ "message": "messages send successfully" });
                                }).catch(function (err) {
                                    deferred.reject(err)
                                })
                            // deferred.resolve({ "message": "messages send successfully" });
                        }
                    }

                }

            }).catch(err => {
                deferred.reject(err)
            });
    });


    return deferred.promise;
}

function GetAllReceiveSms(req, res) {
    var deferred = Q.defer();
    var collectionName = 'User'
    var condition = {};
    var condition2 = {};
    var paramNotReq = {};
    condition["phone"] = "+917045870802";
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("GetAllReceiveSms data: ",data[0])
            var body = 'username=' + data[0].username + '&orgName=Org1';
            // rp({
            //     method: 'POST',
            //     uri: config.Ip + '/users',
            //     body: body,
            //     headers: {
            //         'User-Agent': 'Request-Promise',
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     }
            // }).then(function (data) {
            //     var tokenData = JSON.parse(data)
            //     var blockChainToken = tokenData.token
            // })
        }).catch(err => {
            deferred.reject(err)
        })
}

function GetAllReceiveSms(req, res) {
    var deferred = Q.defer();
    var smsApi = 'https://api.twilio.com';
    rp({
        uri: smsApi
    }).then(function (data) {
        var msgData = JSON.parse(data);
        msgData = msgData.messages;
        db.SmsNotification.find({ sendStatus: '1' }, {
            sendDtTm: 0,
            smsBody: 0,
            createDtTm: 0,
            sendStatus: 0,
            _id: 0,
            AckStatus: 0
        }).toArray(function (err, sms) {
            for (var i = 0; i < sms.length; i++) {
                for (var j = 0; j < msgData.length; j++) {
                    var direction = msgData[j].direction;
                    if (direction == "inbound") {
                        var smsRcvd = msgData[j].body;
                        var getSid = smsRcvd.toString().split("-");
                        var receivedSid = getSid[1];
                        var dbSid = sms[i].smsId
                        if (receivedSid == dbSid) {
                            var n = msgData[j].body;
                            var message = n.endsWith("Si");
                            if (n.endsWith("si") || n.endsWith("Si") || n.endsWith("SI") || n.endsWith("sI")) {
                                message = 'Yes';
                            } else if (n.endsWith("Yes")) {
                                message = 'Yes';
                            }
                            if (message) {
                                message = 'Yes';
                            } else {
                                message = 'No';
                            }
                            req.custResponse = message;
                            req.smsId = sms[i].smsId;
                            req.phone = "+" + sms[i].mobileNo;
                            set = {
                                sendStatus: '2'
                            }
                            db.SmsNotification.update({ smsId: req.smsId }, { $set: set },
                                function (err, doc) {
                                    if (err) deferred.reject(err.name + ': ' + err.message);
                                    var collectionName = 'User'
                                    var condition = {};
                                    var condition2 = {};
                                    var paramNotReq = {};
                                    condition["phone"] = req.phone;
                                    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
                                        .then(data => {
                                            console.log("GetAllReceiveSms data: ",data[0])
                                            var body = 'username=' + data[0].username + '&orgName=Org1';
                                        rp({
                                            method: 'POST',
                                            uri: config.Ip + '/users',
                                            body: body,
                                            headers: {
                                                'User-Agent': 'Request-Promise',
                                                'Content-Type': 'application/x-www-form-urlencoded'
                                            }
                                        }).then(function (data) {
                                            console.log("Enroll user data: ",data)
                                            var tokenData = JSON.parse(data)
                                            var blockChainToken = tokenData.token
                                            BKCProjectValidation(req, res, blockChainToken);
                                        })
                                        }).catch(err => {
                                            deferred.reject(err)
                                        })
                                    deferred.resolve();
                                });
                        } else {
                        }
                    }
                }
            }

        })
    }).catch(function (error) {

    });
    return deferred.promise;
}


///////////////////////////////////////////////////////////////////////////////////////////////////////
//# Akshay :- 27-07-2017 project validation at blockchain///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////

function BKCProjectValidation(req, res, blockChainToken) {
    var deferred = Q.defer();
    console.log("BKCProjectValidation")
    var validationCheck;
    if (req.custResponse == 'Yes' || req.custResponse == 'yes' || req.custResponse == 'YES') {
        validationCheck = 'Validation Successful';
    }
    if (req.custResponse == 'No' || req.custResponse == 'no' || req.custResponse == 'NO') {
        validationCheck = 'Validation failed';
    }


    var smsId = req.smsId;
    var bkcToken = blockChainToken;
    db.SmsNotification.find({ smsId: smsId }).toArray(function (err, ProjDetails) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        var projectId = ProjDetails[0].projectId;
        req.body.projectId = projectId;
        var milestoneId = ProjDetails[0].milestoneId;
        var activityId = ProjDetails[0].activityId;
        req.body.activityId = activityId;
        // req.body.updateActivityFlag = "Activity has been validated using sms"
        var body = {
            "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
            "fcn": "updateActivityValidation",
            "args": ["" + req.body.activityId + "", "" + validationCheck]
        }
        rp({
            method: 'POST',
            uri: config.Ip + '/channels/mychannel/chaincodes/test',
            body: JSON.stringify(body),
            headers: {
                'User-Agent': 'Request-Promise',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + bkcToken
            }
        }).then(function (data) {
            sendEmail(req, res);
            deferred.resolve(data);
        });
    });
    return deferred.promise;
}


// Akshay : 15-01-2018 send email to all donor for a single project
function sendEmail(req, res) {
    var deferred = Q.defer();
    var type = 'activityComplete';
    db.MessageTemplate.find({ messageType: type }).toArray(function (err, data) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        var Template = data;
            var projectId = req.body.projectId;
            db.SaveDonate.find({ projectId: projectId }, {
                notificationPreference: 0,
                role: 0,
                _id: 0
            }).toArray(function (err, DonorList) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                var userNameList = [];
                for (u in DonorList) {
                    var user = DonorList[u];
                    if (user.username && !userNameList.includes(user.username)) {
                        userNameList.push(user.username);
                    }
                }
                db.User.find({ username: { $in: userNameList } }).toArray(function (err, userDetails) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    var tomail = '';
                    for (det in userDetails) {
                        var details = userDetails[det];
                        if (details.email) {
                            tomail = details.email + ';' + tomail;
                        }
                    }
                    var from = 'crm@comgo.io'
                    var subject = 'Activity is complete'
                    var attachment = ''
                    var filePath = ''
                    var senderUsername = "crm@comgo.io"
                    var senderPassword = "ComGo1!2@3#4$"
                    var emailbody = 'Gracias por tu donacion! Ya se ha pagado la nómina de Samirbhai Macwan por valor de INR 3000 del mes de diciembre. Gracias por hacerlo posible. Gracias de parte del equipo itwillbe.'
                    mail.sendMail(req, from, tomail, tomail, subject, emailbody, attachment, filePath, senderUsername, senderPassword)
                        .then(function (data) {
                            console.log("Response from send mail->", data)
                            deferred.resolve(data)
                        }).catch(function (err) {
                            deferred.reject(err)
                        })
                });
                deferred.resolve(DonorList);
            });
        deferred.resolve(Template);
    });
    return deferred.promise;
}