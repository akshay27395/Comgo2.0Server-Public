/**
 * Created By :- Girijashankar Mishra
 * Created Date :- 08-05-2017 15:30 pm
 * Version :- 1.0
 * Created By :- Akshay
 * Updated Date :- 16-08-2017 10:30 pm
 * Version :- 1.0.1
 */

var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var rp = require('request-promise');
var MessagingResponse = require('twilio').twiml.MessagingResponse;
var nodemailer = require("nodemailer");
var mail = require('./svr.email.service');
var accountSid = config.accountSid;
var authToken = config.authToken;
var twilioNumber = config.twilioNumber;
var express = require('express');
var sms = require('./svr.sms.service');
var app = express();
var crud = require('./svr.crudService.service.js');

// require the Twilio module and create a REST client
var client = require('twilio')(accountSid, authToken);
db.bind('Document');
db.bind('MessageTemplate');
db.bind('AuditTable');
db.bind('User');
db.bind('SmsNotification');
db.bind('SaveDonate');
db.bind('ProjectActivity');

var service = {};

service.getById = getById;
service.getAll = getAll;
service.create = create;
service.update = update;
service.delete = _delete;
service.getAll = getAll;

module.exports = service;


function getById(_id) {
    var deferred = Q.defer();
    db.Document.findById(_id, function (err, document) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (document) {
            // return user (without hashed password)
            deferred.resolve(_.omit(document, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(req, res) {
    var deferred = Q.defer();
    var document = {
        documentName: req.body.documentName,
        documentPath: req.body.documentPath,
        documentHash: req.body.documentHash
    }
    db.Document.insert(
        document,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            if (doc) {
                BKCSubmitProof(req, res);
                deferred.resolve(doc);
            }

        });
    return deferred.promise;
}

function BKCSubmitProof(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    req.body.addProofFlag = "Proof of activity " + req.body.activityName + " has been submitted by " + req.session.username
    console.log("req.body.addProofFlag:", req.body.addProofFlag)
    // var body = "{" +
    //     "\"peers\": [\"peer0.org1.example.com\", \"peer1.org1.example.com\"]," +
    //     "\"fcn\":\"invoke\"," +
    //     "\"args\":[\"submit_proof\",\"" + projectId + "\",\"" + milestoneId + "\",\"" + activityId + "\",\"" + documentHash + "\",\"" + req.body.addProofFlag + "\"]" + "}";

    // rp({
    //     method: 'POST',
    //     uri: config.Ip + '/channels/mychannel/chaincodes/test',
    //     body: body,
    //     headers: {
    //         'User-Agent': 'Request-Promise',
    //         'Content-Type': 'application/json',
    //         'Authorization': 'Bearer ' + blockChainToken
    //     }
    // }).then(function (data) {
    //     console.log("Proof submitted bkc", data)
    //     deferred.resolve(registerOtherValidator(req.body, res))
    //     // deferred.resolve(data);

    // });

    var status = 'Proof Submitted'
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "submitProof",
        "args": ["" + req.body.allId.activityId + "", "" + status + "", "" + req.body.documentHash + "", "" + req.body.milestoneStatus + "", "" + req.body.projectStatus + "", "" + req.body.addProofFlag + ""]
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
        console.log("Proof submitted bkc", data)
        auditTrailSubmitProof(req, res)
        if (req.body.supplierName) {
            registerOtherValidator(req.body, res)
        } else {
            deferred.resolve(data)
        }
    }).catch(function (error) {
        deferred.reject(error)
    })
    return deferred.promise;
}


// Akshay :- 02-08-2017 Audit trail for fund request go to db
function auditTrailSubmitProof(req, res) {
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
        currentStatus: 'Fund Requested',
        previousStatus: 'Fund Allocated'
    };
    db.AuditTable.insert(
        set,
        function (err, doc) {
            if (err) deferred.reject(err.name + ': ' + err.message);
            GetSMSByType(req, res);
            deferred.resolve();
        });
    return deferred.promise;
}

////////////////////////////////////////////////////////////////////
//////////////////#Akshay : - get sms by type ////////////////////
////////////////////////////////////////////////////////////////
function GetSMSByType(req, res) {
    var deferred = Q.defer();

    var type = 'ngo';
    type = type.trim();
    db.MessageTemplate.find({ messageType: type }).toArray(function (err, SMS) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        var projectName = req.body.allId.projectName;
        var SMSBody = SMS[0].smsBody;
        req.temp2 = SMSBody.replace("####", projectName);
        var smsId = Date.now();
        var activityId = req.body.allId.activityId;
    var token = req.session.blockChainToken;
        rp({
            uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=read&args=%5B%22read%22%2C%22' + activityId + '%22%5D',
            headers: {
                'User-Agent': 'Request-Promise',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }).then(function (data) {
            var resp = JSON.parse(data)
            var result = [resp];
            result.push()
            console.log("getActivityById res", result[0])
            var validators = result[0].validatorId.split("-", 2);
            console.log("technicalValidator:", validators[0], " ", validators[1])
            var technicalValidator = validators[0];
            var financialValidator = validators[1];
            if (technicalValidator) {
        if (req.body.smsBody) {
            req.finalSMS = "-" + smsId + "-" + req.body.smsBody;
        }

        req.finalSMS = "-" + smsId + "-" + req.temp2;
        var projectId = req.body.allId.projectId;
        var milestoneId = req.body.allId.milestoneId;
        var activityId = req.body.allId.activityId;

        var body = {
            smsBody: req.finalSMS,
            createDtTm: Date(),
            projectId: projectId,
            milestoneId: milestoneId,
            activityId: activityId,
            sendDtTm: "0",
            sendStatus: "0",
            AckStatus: "0",
            smsId: smsId
        }
        req.smsId = smsId;
        db.SmsNotification.insert(
            body,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                sendSMS(req, res,'technical validator');
                deferred.resolve(doc);
            });
        }
        if (financialValidator) {
            var smsId2 = Date.now();
            if (req.body.smsBody) {
                req.financialSMS = "-" + smsId2 + "-" + req.body.smsBody;
            }
    
            req.financialSMS = "-" + smsId2 + "-" + req.temp2;
            var projectId = req.body.allId.projectId;
            var milestoneId = req.body.allId.milestoneId;
            var activityId = req.body.allId.activityId;
    
            var body = {
                smsBody: req.financialSMS,
                createDtTm: Date(),
                projectId: projectId,
                milestoneId: milestoneId,
                activityId: activityId,
                sendDtTm: "0",
                sendStatus: "0",
                AckStatus: "0",
                smsId: smsId2
            }
            req.smsId2 = smsId2;
            db.SmsNotification.insert(
                body,
                function (err, doc) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    sendSMS(req, res,'financial validator');
                    deferred.resolve(doc);
                });
            }

    });
})
    return deferred.promise;
}

/////////////////////////////////////////////////////////////////////
//////////////////#Akshay : - send sms ///////////////////////////
////////////////////////////////////////////////////////////////
function sendSMS(req, res,typeOfValidator) {
    var deferred = Q.defer();
    var activityId = req.body.allId.activityId;
    var token = req.session.blockChainToken;
    console.log("activityId: ", activityId)
    rp({
        uri: config.Ip + '/channels/mychannel/chaincodes/test?peer=peer0.org1.example.com&fcn=read&args=%5B%22read%22%2C%22' + activityId + '%22%5D',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    }).then(function (data) {
        var resp = JSON.parse(data)
        var result = [resp];
        result.push()
        console.log("getActivityById res", result[0])
        var validators = result[0].validatorId.split("-", 2);
        console.log("technicalValidator:", validators[0], " ", validators[1])
        var technicalValidator = validators[0];
        var financialValidator = validators[1];
        console.log("validators: ", technicalValidator, financialValidator)
        if (technicalValidator && typeOfValidator == 'technical validator') {
            db.User.find({ username: technicalValidator }).toArray(function (err, contactDetails) {
                var mobilleNumber = contactDetails[0].phone;
                var tomail = contactDetails[0].email;
                // var mobilleNumber = '+917045870802';
                // var tomail = 'kuldeep@cateina.com';
                console.log("send sms to activity technical validator ", mobilleNumber)
                var technicalVSMS = req.finalSMS + " to " + twilioNumber;
                sms.sendSMS(req, mobilleNumber, twilioNumber, technicalVSMS)
                    .then(function (data) {
                        console.log("Response from send sms to activity technical validator->", data)
                    }).catch(function (err) {
                        deferred.reject(err)
                    })
                    if(req.body.smsBody != null && req.body.smsBody != undefined && req.body.smsBody != ''){
                sms.sendSMS(req, mobilleNumber, twilioNumber, req.body.smsBody)
                    .then(function (data) {
                        console.log("Response from send sms technical validator smsBody->", data)
                    }).catch(function (err) {
                        deferred.reject(err)
                    })
                }
                var collectionName = 'EmailTemplate'
                var condition = {};
                var paramNotReq = {};
                condition["name"] = "Proof Mail To Reg Validators";
                crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
                    .then(temp => {
                        var tempBody = temp[0].body
                        var tempSub = temp[0].subject
                        var from = 'crm@comgo.io'
                        var subject = tempBody.replace('@@@@@', req.body.allId.projectName)
                        var attachment = ''
                        var filePath = ''
                        var senderUsername = "crm@comgo.io"
                        var senderPassword = "ComGo1!2@3#4$"
                        var emailBody = tempSub.replace('$$$$$', req.body.allId.activityName)
                        console.log("send email to activity financial validator ", tomail)
                        mail.sendMail(req, from, tomail, tomail, subject, emailBody, attachment, filePath, senderUsername, senderPassword)
                            .then(function (data) {
                                console.log("Response from validator send mail->", data)
                            }).catch(function (err) {
                                deferred.reject(err)
                            })
                    })
                var set = {
                    sendStatus: '1',
                    mobileNo: +mobilleNumber
                }
                db.SmsNotification.update({ smsId: req.smsId }, { $set: set },
                    function (err, doc) {
                        if (err) deferred.reject(err.name + ': ' + err.message);
                        console.log("sms notification updated");
                        if (!financialValidator) {
                            console.log("sms notification updated financial validator is not selected");
                            sendSMSToSupplier(req, res);
                        }
                    });
            });
        }
        if (financialValidator && typeOfValidator == 'financial validator') {
            db.User.find({ username: financialValidator }).toArray(function (err, contactDetails) {
                var mobilleNumber = contactDetails[0].phone;
                var tomail = contactDetails[0].email;
                console.log("send sms to activity financial validator ", mobilleNumber)
                var financialVSMS = req.financialSMS + " to " + twilioNumber;
                sms.sendSMS(req, mobilleNumber, twilioNumber, financialVSMS)
                    .then(function (data) {
                        console.log("Response from send sms to activity financial validator->", data)
                    }).catch(function (err) {
                        deferred.reject(err)
                    })
                    if(req.body.smsBody != null && req.body.smsBody != undefined && req.body.smsBody != ''){
                sms.sendSMS(req, mobilleNumber, twilioNumber, req.body.smsBody)
                    .then(function (data) {
                        console.log("Response from send sms financial validator smsBody->", data)
                    }).catch(function (err) {
                        deferred.reject(err)
                    })
                }
                var collectionName = 'EmailTemplate'
                var condition = {};
                var paramNotReq = {};
                 condition["name"] = "Proof Mail To Reg Validators";
                crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
                    .then(temp => {
                        var tempBody = temp[0].body
                        var tempSub = temp[0].subject
                        var from = 'crm@comgo.io'
                        var subject = tempBody.replace('@@@@@', req.body.allId.projectName)
                        var attachment = ''
                        var filePath = ''
                        var senderUsername = "crm@comgo.io"
                        var senderPassword = "ComGo1!2@3#4$"
                        var emailBody = tempSub.replace('$$$$$', req.body.allId.activityName)
                        console.log("send email to activity financial validator ", tomail)
                        mail.sendMail(req, from, tomail, tomail, subject, emailBody, attachment, filePath, senderUsername, senderPassword)
                            .then(function (data) {
                                console.log("Response from validator send mail->", data)
                            }).catch(function (err) {
                                deferred.reject(err)
                            })
                    })

                var set = {
                    sendStatus: '1',
                    mobileNo: +mobilleNumber
                }
                db.SmsNotification.update({ smsId: req.smsId2 }, { $set: set },
                    function (err, doc) {
                        if (err) deferred.reject(err.name + ': ' + err.message);
                        sendSMSToSupplier(req, res);
                        deferred.resolve();
                    });
            });
        }
    }).catch(function (err) {
        console.log("getActivityById error", err)
        deferred.reject(err);
    });
    return deferred.promise;
}

// Akshay : when secondaryValidation is 'true' send sms
function sendSMSToSupplier(req, res) {
    var deferred = Q.defer();
    var smsId = Date.now();
    var smsBody = "-" + smsId + "-" + req.temp2 + " to " + twilioNumber;
    console.log("Inside send SMS Supplier :", req.body.supplierName)
    if (req.body.supplierName) {
        // if (req.body.validatorId) {
        //     db.User.find({ username: req.body.validatorId }).toArray(function (err, contactDetails) {
        //         var mobilleNumber = contactDetails[0].phone;
        //         // client.messages
        //         //     .create({
        //         //         to: mobilleNumber,
        //         //         from: twilioNumber,
        //         //         body: sms,
        //         //     })
        //         //     .then(message => console.log("send sms to secondary validator => ", message.sid));
        //         console.log("sms to secondary validator",contactDetails);
        //         sms.sendSMS(req,mobilleNumber,twilioNumber,smsBody)
        //             .then(function (data) {
        //                 console.log("Response from send sms to secondary validator->", data)
        //             }).catch(function (err) {
        //                 deferred.reject(err)
        //             })

        //         var set = {
        //             sendStatus: '1',
        //             mobileNo: +mobilleNumber
        //         }

        //         var body = {
        //             body: req.finalSMS,
        //             smsBody: req.finalSMS,
        //             createDtTm: Date(),
        //             projectId: req.body.allId.projectId,
        //             milestoneId: req.body.allId.milestoneId,
        //             activityId: req.body.allId.activityId,
        //             smsId: smsId,
        //             sendDtTm: "0",
        //             sendStatus: "1",
        //             AckStatus: "0",
        //             mobileNo: +mobilleNumber
        //         }

        //         db.SmsNotification.insert(
        //             body,
        //             function (err, doc) {
        //                 if (err) deferred.reject(err.name + ': ' + err.message);
        //                 deferred.resolve(doc);
        //             });
        //     });
        // } 
        // else {
        console.log("supplier Mob No:", req.body.supplierMobNo)
        var body = {
            body: req.finalSMS,
            smsBody: req.finalSMS,
            createDtTm: Date(),
            projectId: req.body.allId.projectId,
            milestoneId: req.body.allId.milestoneId,
            activityId: req.body.allId.activityId,
            smsId: smsId,
            sendDtTm: "0",
            sendStatus: "1",
            AckStatus: "0",
            mobileNo: req.body.supplierMobNo
        }

        // client.messages
        //     .create({
        //         to: req.body.supplierMobNo,
        //         from: twilioNumber,
        //         body: sms
        //     })
        //     .then(message => console.log("send sms to supplier = ", message.sid));
        sms.sendSMS(req, req.body.supplierMobNo, twilioNumber, smsBody)
            .then(function (data) {
                console.log("Response from send Supplier sms->", data)
            }).catch(function (err) {
                deferred.reject(err)
            })
        db.SmsNotification.insert(
            body,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                registerOtherValidator(req.body, res)
                deferred.resolve(doc);
            });
    }
    // }
    return deferred.promise;
}

function registerOtherValidator(reqBody, res) {
    var deferred = Q.defer();
    var insertBody = {
        username: reqBody.supplierName,
        supplierMobNo: reqBody.supplierMobNo,
        foundationName: 'xyz',
        role: 'validator',
        lat: 19,
        long: 20
    }
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    condition["username"] = reqBody.supplierName;
    console.log("registerOtherValidator", reqBody.supplierName)
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(userFound => {
            console.log("user found")
            deferred.resolve(userFound)
        }).catch(err => {
            console.log("user not found")
            crud.createData(config.cString, config.dbName, collectionName, insertBody)
                .then(user => {
                    console.log("user inserted successfully", user);
                    deferred.resolve(registration(reqBody, res))
                }).catch(err => {
                    deferred.reject(err)
                })
        })
}

function registration(reqBody, res) {
    var deferred = Q.defer();
    var username = reqBody.supplierName;
    var body = 'username=' + username + '&orgName=Org1';
    rp({
        method: 'POST',
        uri: config.Ip + '/users',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (data) {
        reqBody.userTok = data;
        deferred.resolve(initUser(reqBody, res));
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}

function initUser(reqBody, res) {
    var deferred = Q.defer();
    var data = reqBody.userTok;
    var data = JSON.parse(data);
    var blockChainToken = data.token;
    var foundationName = 'xyz';
    var role = 'validator';
    var lat = '0';
    var long = '0';
    console.log("init body:", reqBody.supplierName)
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "addPrivateUser",
        "args": [reqBody.supplierName, 'firstName', 'firstSurname', 'validator', '0', '0']
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
        console.log("init response: ", data)
        deferred.resolve(data);
        // notifyDonor(reqBody, res)

    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}


function notifyDonor(reqBody, res) {
    var deferred = Q.defer();
    var type = 'activityComplete';
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    condition["type"] = type;
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            var Template = data;
            var emailBody = Template[0].emailBody;
            var actName = reqBody.allId.activityName;
            var temp = emailBody.replace("#####", actName);
            temp = temp.replace("*****", reqBody.allId.projectName)
            var userNameList = [];
            console.log("reqBody.allId.donors : ", reqBody)
            userNameList = reqBody.donors;
            db.User.find({ username: { $in: userNameList } }).toArray(function (err, userDetails) {

                if (err) deferred.reject(err.name + ': ' + err.message);
                console.log("Donor userDetails: ", userDetails)
                var tomail = '';
                var smsARR = [];
                for (det in userDetails) {
                    var details = userDetails[det];
                    if (details.email) {
                        //var email = details.email;
                        tomail = details.email + ';' + tomail;
                        smsARR.push(details.phone);
                    }
                }
                var from = 'crm@comgo.io'
                var subject = reqBody.allId.projectName + ' - Actividad finalizada!'
                var attachment = ''
                var filePath = ''
                var senderUsername = "crm@comgo.io"
                var senderPassword = "ComGo1!2@3#4$"
                mail.sendMail(reqBody, from, tomail, tomail, subject, temp, attachment, filePath, senderUsername, senderPassword)
                    .then(function (data) {
                        console.log("Response from send mail->", data)
                    }).catch(function (err) {
                        deferred.reject(err)
                    })
            })
        }).catch(err => {
            deferred.reject(err)
        })
}
// Akshay : 15-01-2018 send email to all donor for a single project
function sendEmail(req, res) {
    var deferred = Q.defer();
    var type = 'activityComplete';
    db.MessageTemplate.find({ messageType: type }).toArray(function (err, data) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        var Template = data;
        var emailBody = Template[0].emailBody;
        var actName = req.body.allId.activityName;
        var temp = emailBody.replace("****", actName);
        var projectId = req.body.allId.projectId;
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
                var smsARR = [];
                for (det in userDetails) {
                    var details = userDetails[det];
                    if (details.email) {
                        //var email = details.email;
                        tomail = details.email + ';' + tomail;
                        smsARR.push(details.phone);
                    }
                }

                // var smtpTransport = nodemailer.createTransport({
                //     host: 'smtp.office365.com', // Office 365 server
                //     port: 587,     // secure SMTP
                //     secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
                //     auth: {
                //         user: "crm@comgo.io",
                //         pass: "ComGo1!2@3#4$"
                //     },
                //     requireTLS: true,
                //     tls: {
                //         ciphers: 'SSLv3'
                //     }
                // });

                // var mailOptions = {
                //     from: 'crm@comgo.io',
                //     bcc: tomail,
                //     subject: 'Activity is Completed',
                //     text: temp
                // }

                // smtpTransport.sendMail(mailOptions, function (error, response) {
                //     if (error) {
                //         res.end("error");
                //     }
                //     deferred.resolve();
                // });
                var from = 'crm@comgo.io'
                var subject = req.body.allId.projectName + ' - Actividad finalizada!'
                var attachment = ''
                var filePath = ''
                var senderUsername = "crm@comgo.io"
                var senderPassword = "ComGo1!2@3#4$"
                mail.sendMail(req, from, tomail, tomail, subject, temp, attachment, filePath, senderUsername, senderPassword)
                    .then(function (data) {
                        console.log("Response from send mail->", data)
                    }).catch(function (err) {
                        deferred.reject(err)
                    })

                sms.sendMultipleSMS(req, smsARR, twilioNumber, temp)
                    .then(function (data) {
                        console.log("Response from send sms->", data)
                    }).catch(function (err) {
                        deferred.reject(err)
                    })
            });
            deferred.resolve(DonorList);
        });
        deferred.resolve(Template);
        // sendEmailToCRM(req,res)
    });
    return deferred.promise;
}

function sendEmailToCRM(req, res) {
    var deferred = Q.defer();
    var type = 'activityComplete';
    db.User.find({ role: 'crm', foundationCompany: req.body.foundationCompany }).toArray(function (err, userDetails) {

        if (err) deferred.reject(err.name + ': ' + err.message);
        var tomail = '';
        var smsARR = [];
        for (det in userDetails) {
            var details = userDetails[det];
            if (details.email) {
                //var email = details.email;
                tomail = details.email + ';' + tomail;
                smsARR.push(details.phone);
            }
        }

        // var smtpTransport = nodemailer.createTransport({
        //     host: 'smtp.office365.com', // Office 365 server
        //     port: 587,     // secure SMTP
        //     secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        //     auth: {
        //         user: "crm@comgo.io",
        //         pass: "ComGo1!2@3#4$"
        //     },
        //     requireTLS: true,
        //     tls: {
        //         ciphers: 'SSLv3'
        //     }
        // });

        // var mailOptions = {
        //     from: 'crm@comgo.io',
        //     bcc: tomail,
        //     subject: 'Activity is Completed',
        //     text: temp
        // }

        // smtpTransport.sendMail(mailOptions, function (error, response) {
        //     if (error) {
        //         res.end("error");
        //     }
        //     deferred.resolve();
        // });
        var from = 'crm@comgo.io'
        var subject = 'Activity is Completed'
        var attachment = ''
        var filePath = ''
        var senderUsername = "crm@comgo.io"
        var senderPassword = "ComGo1!2@3#4$"
        mail.sendMail(req, from, tomail, tomail, subject, temp, attachment, filePath, senderUsername, senderPassword)
            .then(function (data) {
                console.log("Response from send mail->", data)
            }).catch(function (err) {
                deferred.reject(err)
            })

        sms.sendMultipleSMS(req, smsARR, twilioNumber, temp)
            .then(function (data) {
                console.log("Response from send sms->", data)
            }).catch(function (err) {
                deferred.reject(err)
            })
        deferred.resolve(DonorList);
    });

    return deferred.promise;
}


// #Akshay : - 15-08-2017
app.post('/sms', (req, res) => {
    var twiml = new MessagingResponse();

    twiml.message('Thanku You!');

    res.writeHead(200, { 'Content-Type': 'text/xml' });
    res.end(twiml.toString());
});


function update(_id, userParam) {
    var deferred = Q.defer();

    // validation
    db.Document.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        updateDocument();

    });

    function updateDocument() {
        // fields to update
        var set = {
            ProofType: userParam.ProofType,
            DocumentName: userParam.DocumentName,
            Amount: userParam.Amount,
            Currency: userParam.Currency,
            Remarks: userParam.Remarks,
        };
        db.Document.update({ _id: mongo.helper.toObjectID(_id) }, { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(_id, userParam) {
    var deferred = Q.defer();
    db.Document.remove({ _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}


function getAll(milestoneId, projectId) {
    var deferred = Q.defer();
    db.Document.find({ $and: [{ milestoneId: milestoneId }, { projectId: projectId }] }).toArray(function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(doc);
    });
    return deferred.promise;
}