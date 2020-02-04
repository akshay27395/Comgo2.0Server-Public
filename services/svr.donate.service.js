'use strict'
var config = require('config.json');
var _ = require('lodash');
var Q = require('q');
var mongo = require('mongoskin');
var accountSid = config.accountSid;
var authToken = config.authToken;
var client = require('twilio')(accountSid, authToken);
var twilioNumber = config.twilioNumber;
var db = mongo.db(config.connectionString, { native_parser: true });
const rp = require('request-promise');
var mail = require('./svr.email.service');
var sms = require('./svr.sms.service');
var crud = require('./svr.crudService.service.js');

db.bind('ProjectDonation');
db.bind('AuditTable');
db.bind('NotificationPreference');
db.bind('SaveDonate');
db.bind('SmsNotification');
db.bind('User');
db.bind('MessageTemplate');

var service = {};

service.getById = getById;
service.getAll = getAll;
service.getAllNotification = getAllNotification;
service.getAllDonorList = getAllDonorList;
service.update = update;
service.delete = _delete;
service.getAll = getAll;
service.create = saveDonate;
service.foundationDonate = foundationDonate;
service.donatedCurrency = donatedCurrency;
service.getCurrencies = getCurrencies;
module.exports = service;

function getCurrencies(req,res){
    var deferred = Q.defer();
    var currencyTYpe = req.body.currencyType;
    rp({
        method: 'GET',
        uri: 'http://data.fixer.io/api/latest? access_key=5406783ac25a9902a2fa849114f5e9ab',
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (data) {
        var currenciesValues = JSON.parse(data);
        console.log("getCurrencies res: ",currenciesValues.rates.INR)
    })
}

function donatedCurrency(req, res) {
    var deferred = Q.defer();
    var currencyTYpe = req.body.currencyType;
    rp({
        method: 'GET',
        uri: 'https://api.exchangeratesapi.io/latest?base=' + currencyTYpe,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (data) {
        var currenciesValues = JSON.parse(data);
        var rates = currenciesValues.rates;
        amount = currenciesValues.rates[req.body.projectCurrency] * req.body.amount
        deferred.resolve({ rates })
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {projectId, amount} req 
 * @param {*} res 
 * @description This function will donate amount to the project as donor.
 */
function saveDonate(req, res) {
    var deferred = Q.defer();
    var blockChainToken = req.session.blockChainToken;
    if(req.body.aliasName == 'Anonymous'){ 
        var flag = "Donation made by Anonymous user to "+req.body.projectName
    } else{
    var flag = "Donation made by "+req.body.aliasName+" to "+req.body.projectName
    }
    // var flag = "Donation made by "+req.session.username+" to "+req.body.projectName
    console.log("req.body.aliasName: ",req.body)
        console.log("Donation flag : ",flag)
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "fundProject",
        "args": ["" + req.body.projectId + "", "" + req.body.amount + "", "" + flag + ""]
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
        console.log("save donate: ",data)
        auditTrailSaveDonation(req, res)
        deferred.resolve(data);
    }).catch(function (error) {
        deferred.reject(error);
    })
    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {donorName, projectId, amount} req 
 * @param {*} res 
 * @description This function will donate amount to the project as foundation.
 */
function foundationDonate(req, res) {
    var deferred = Q.defer();
    console.log("donation body => ",req.body);
    var username = req.body.donorName;
    var body = 'username=' + username + '&orgName=Org1';
        var blockChainToken = req.session.blockChainToken;
        var flag = "Donation made by "+req.session.username+" to "+req.body.projectName
        console.log("foundationDonate Donation flag:",flag)
        var body = {
            "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
            "fcn": "fundProject",
            "args": ["" + req.body.projectId + "", "" + req.body.amount + "", "" + flag + ""]
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
            console.log("foundationDonate save donate: ",data)
            auditTrailSaveDonation(req, res)
            deferred.resolve(data);
        }).catch(function (error) {
            deferred.reject(error);
        })
    return deferred.promise;
}

// Akshay :- 02-08-2017 Audit trail for update milestone go to db
function auditTrailSaveDonation(req, res) {
    console.log("auditTrailSaveDonation")
    var deferred = Q.defer();
    var projectId = req.body.projectId;
    var projectName = req.body.projectName
    var donationType = req.body.donationType;
    var username = req.session.username;
    var amount = req.body.amount;
    console.log("auditTrailSaveDonation before saveDonate")
    var saveDonate;
        if(req.body.donationType == 'Donation'){
        saveDonate = {
            updatedDate: Date(),
            projectId: projectId,
            projectName: projectName,
            donationType: donationType,
            username: username,
            amount: amount,
            notificationPreference: req.body.notificationPreference,
            anonymousUser: req.body.anonymousUser,
            aliasName: req.body.aliasName,
            uploadedDocument: req.body.fileName,
            docPath:req.body.filePath,
            fileHash:req.body.fileHash,
            referenceNo: req.body.referenceNo
        };
    }
    else {
        saveDonate = {
            updatedDate: Date(),
            projectId: projectId,
            projectName: projectName,
            donationType: donationType,
            username: req.body.donorName,
            amount: amount,
            notificationPreference: req.body.notificationPreference,
            anonymousUser: req.body.anonymousUser,
            aliasName: req.body.aliasName,
            uploadedDocument: req.body.fileName,
            docPath:req.body.filePath,
            fileHash:req.body.fileHash,
            referenceNo: req.body.referenceNo
        };
    }
    console.log("SaveDonate : ",saveDonate)

    var collectionName = 'SaveDonate'
    crud.createData(config.cString, config.dbName, collectionName, saveDonate)
        .then(data => {
            console.log("donate function: ", data)
            sendMessage(req, res);
                deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


function sendMessage(req, res) {
    var deferred = Q.defer();
    var type = 'donation';
    var collectionName1 = 'MessageTemplate'
    var condition1 = {};
    var paramNotReq1 = {};
    condition1 = { messageType:type}
    crud.readByCondition(config.cString, config.dbName, collectionName1, condition1, paramNotReq1)
        .then(msgTmp => {
            console.log("msgTmp[0].smsBody: ",msgTmp[0].smsBody)
        var msgTmp = msgTmp[0].smsBody;
        console.log("req.body.donationType: ",req.body.donationType)
        var username = req.session.username;
            req.foundationCompany = req.body.projectOwner;
        var tem = msgTmp.replace("*****", username);
        var amount = req.body.amount;
        var temp = tem.replace("$$$$$", req.body.projectCurrency)
        var foundationCompany = temp.replace("#####", amount);
        req.finalSMS = foundationCompany.replace("!!!!!",req.foundationCompany);
            if (req.body.donationType == "Donation") {
                sendSMS(req, res);
                getCRMUsers(req, res)
            }
            deferred.resolve();
    });

    return deferred.promise;
}


function getProjectOwnerDetails(req, res) {
    var deferred = Q.defer();
    db.User.find({ orgName: req.body.projectOwner }, { foundationCompany: true }).toArray(function (err, projectOwnerDetails) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        req.foundationCompany = projectOwnerDetails[0].foundationCompany;
        getCRMUsers(req, res);
        deferred.resolve();
    })
    return deferred.promise;
}

function getCRMUsers(req, res) {
    var deferred = Q.defer();
    var userNameList = [];

    var collectionName1 = 'User'
    var condition1 = {};
    var paramNotReq1 = {};
    var organizations = req.body.projectOwner
    condition1 = { Rules: { $elemMatch: { $and: [{ orgName: organizations, crm_Notification: true }] } } }
    crud.readByCondition(config.cString, config.dbName, collectionName1, condition1, paramNotReq1)
        .then(crmUsers => {
            console.log("crmUsers: ",crmUsers)
        var tomail = '';
        var u;
        for (u in crmUsers) {
            userNameList.push(crmUsers[u]);
            tomail = crmUsers[u].email + ';' + tomail;
        }
        if (req.body.notificationMode == 'email' || req.body.notificationMode == 'both') {
            var collectionName = 'EmailTemplate'
            var condition = {};
            var paramNotReq = {};
            condition["name"] = "Donation CRM";
        crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
                .then(temp => {
                    console.log("Donation mail to crm: ",temp[0].body)
                    var templateData = temp[0].body
                    var emailbody = templateData.replace('@@@@@',req.body.amount).replace('#####',req.body.projectCurrency).replace('$$$$$',req.body.aliasName).replace('&&&&&',req.body.projectName)
            var bcc = tomail
            var subject = temp[0].subject
            var from = 'crm@comgo.io'
            var attachment = 'Thankyouphoto.jpg'
            var filePath = './uploads/Thankyou/Thankyouphoto.jpg'
            var senderUsername = "crm@comgo.io"
            var senderPassword = "ComGo1!2@3#4$"
            console.log("Donation mail Body: ",emailbody)
            mail.sendMail(req, from,tomail,bcc,subject,emailbody,attachment,filePath,senderUsername,senderPassword)
            .then(function (data) {
                console.log("Response from send mail->", data)
                deferred.resolve(data)
            }).catch(function (err) {
                deferred.reject(err)
            })
        })
        }
        deferred.resolve();
    })
    return deferred.promise;
}

function sendSMS(req, res) {
    var deferred = Q.defer();
    var body = req.finalSMS;

    var username = req.session.username;
    db.User.find({ username: username }, { phone: true, email: true }).toArray(function (err, contactDetails) {
        if (err) { deferred.reject(err) };

        var phone = contactDetails[0].phone;
        var tomail = contactDetails[0].email;
        if (req.body.notificationMode == 'sms' || req.body.notificationMode == 'both') {
                sms.sendSMS(req,phone,twilioNumber,body)
                .then(function (data) {
                    // console.log("Response from send sms->", data)
                    deferred.resolve(data)
                }).catch(function (err) {
                    deferred.reject(err)
                })
        }
        if (req.body.notificationMode == 'email' || req.body.notificationMode == 'both') {
            var collectionName = 'EmailTemplate'
            var condition = {};
            var paramNotReq = {};
            condition["name"] = "Donor Mail";
        crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
                .then(data => {
                    console.log("Donor Mail: ",data[0])
                    var temp = data[0].body
                    console.log("temp: ",temp)
                    var replacedBody= temp.replace('#####',req.session.username).replace('@@@@@',req.body.amount).replace('$$$$$',req.body.projectCurrency).replace('&&&&&',req.body.projectOwner)
                    // var replacedAmount = replacedBody.replace('@@@@@',req.body.amount)
                    // var replacedCurrency = replacedAmount.replace('$$$$$',req.body.projectCurrency)
                    // var replacedProjectOwner  = replacedCurrency.replace('&&&&&',req.body.projectOwner);
                    var from = 'crm@comgo.io'
                    var bcc = tomail
                    var attachment = 'Thankyouphoto.jpg'
                    var filePath = './uploads/Thankyou/Thankyouphoto.jpg'
                    var senderUsername = "crm@comgo.io"
                    var senderPassword = "ComGo1!2@3#4$"
                    console.log("replacedBody: ",replacedBody)
                    mail.sendMail(req, from,tomail,bcc,data[0].subject,replacedBody,attachment,filePath,senderUsername,senderPassword)
            .then(function (mailres) {
                // console.log("Response from send mail->", mailres)
                deferred.resolve(mailres)
            }).catch(function (err) {
                deferred.reject(err)
            })
                })
        }

    })
    return deferred.promise;
}


function getById(_id) {
    var deferred = Q.defer();
    db.ProjectDonation.findById(_id, function (err, donate) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (donate) {
            deferred.resolve(_.omit(project, 'hash'));
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();

    db.ProjectDonation.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        updateDonate();
    });

    function updateDonate() {
        var set = {
            projectName: userParam.projectName,
            description: userParam.description,
            ngo: userParam.ngo,
            fundgoal: userParam.fundgoal,
        };

        db.ProjectDonation.update({ _id: mongo.helper.toObjectID(_id) }, { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }
    return deferred.promise;
}

function _delete(_id, userParam) {
    var deferred = Q.defer();
    db.ProjectDonation.remove({ _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}


function getAll() {
    var deferred = Q.defer();
    console.log("getAll service")
    db.SaveDonate.find().sort( { username: -1 } ).toArray(function (err, cust) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        console.log("getAll service res: ",cust)
        deferred.resolve(cust);
    });

    return deferred.promise;
}

function getAllNotification() {
    var deferred = Q.defer();

    db.NotificationPreference.find().toArray(function (err, cust) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(cust);
    });

    return deferred.promise;
}

function getAllDonorList(req, res) {
    var deferred = Q.defer();

    var projectId = req.body.projectId;
    db.SaveDonate.find({ projectId: projectId }, {
        notificationPreference: 0,
        role: 0,
        _id: 0
    }).toArray(function (err, DonorList) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        deferred.resolve(DonorList);
    });

    return deferred.promise;
}