"use strict"
var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var rp = require('request-promise');
var mongo = require('mongoskin');
var AWS = require('aws-sdk');
var mail = require('./svr.email.service');
var db = mongo.db(config.connectionString, { native_parser: true });
var crud = require('./svr.crudService.service.js');

db.bind('User');
db.bind('EmailConfig');
db.bind('UserAudit');
db.bind('OrganizationDocument');
db.bind('OrgLogo');
db.bind('PaymentInfo');
db.bind('EmailAudit');

var TinyURL = require('tinyurl');

var service = {};

service.getAllOrganizations = getAllOrganizations;
service.authenticate = authenticate;
service.create = create;
service.getAllUser = getAllUser;
service.approveUser = approveUser;
service.getAllValidator = getAllValidator;
service.updateProfile = updateProfile;
service.getUserDetails = getUserDetails;
service.changePassword = changePassword;
service.checkPassword = checkPassword;
service.logout = logout;
service.updateUserDetails = updateUserDetails;
service.getUploadedFiles = getUploadedFiles;
service.getOrganization = getOrganization;
service.getOrganizationDetails = getOrganizationDetails;
service.getPaymentDetails = getPaymentDetails;
service.insertTokenDetails = insertTokenDetails
service.updateTokenDetails = updateTokenDetails;
service.validateUser = validateUser;
service.forgotPassword = forgotPassword;
service.updateSession = updateSession;
service.yourWorkSpace = yourWorkSpace;
service.mailToFindWorkspace = mailToFindWorkspace;
service.updateUserRules = updateUserRules;
service.sendInvitation = sendInvitation;
service.getOrganizationsForProject = getOrganizationsForProject;
service.getOrganizationsForEditProject = getOrganizationsForEditProject;
service.addRating = addRating;

module.exports = service;

function getAllOrganizations(req, res) {
    var deferred = Q.defer();
    var collectionName = 'User'
    var paramNotReq = {};
    var condition;
    console.log("userType: ", req.params)
        // console.log("userType: ", req.params)
        condition = { userType: 'Organization', regUser: 1 };
        crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    
    return deferred.promise;
}

function addRating(session,body) {
    var deferred = Q.defer();
    var collectionName = 'ProjectRating'
    var condition = {};
    condition["projectId"] = body.projectId;
    condition["username"] = session.username;
    var paramNotReq = {};
    console.log("config.connectionString: ", config.cString,condition)

    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("get user rating: ",data)
            var set = body
        crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
            .then(data => {
                deferred.resolve(data);
            }).catch(err => {
                deferred.reject(err)
            })
        }).catch(err => {
            crud.createData(config.cString, config.dbName, collectionName, body)
            .then(data => {
                console.log("create function: ", data)
                    deferred.resolve(data)
            }).catch(err => {
                console.log("user not found")
                deferred.reject(err)
            })
        })
    return deferred.promise;
}


function getOrganizationsForEditProject(req,res){
    var deferred = Q.defer();
    var collectionName = 'User'
    var paramNotReq = {};
    var condition;
    condition = { userType: 'Organization',orgName: { $ne: req.params.organization },profile: 'true' };
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
    .then(data => {
        deferred.resolve(data)
    }).catch(err => {
        deferred.reject(err)
    })
    return deferred.promise;
}

function sendInvitation(req, res) {
    console.log("send Invitation: ", req.body.regURL)
    var deferred = Q.defer();
    TinyURL.shorten(req.body.regURL, function (res) {
        var link
        link = res;
        var to = req.body.email;
        var mailBody;
        console.log("req.body.userType: ", req.body.userType)
        if(req.body.userType == 'Private User'){
        mailBody = req.body.orgName + " wants your Organization to join Comgo as part of our project.\n\nPlease follow the link to complete registration:\n\n" + link;
        } else {
        mailBody = req.body.orgName + " invited you to register in Comgo.\n\nPlease follow the link to complete registration:\n\n" + link;
        }
        var sub = req.body.orgName + ' invites you to Comgo';
        var from = 'crm@comgo.io'
        var attachment = ''
        var filePath = ''
        var senderUsername = "crm@comgo.io"
        var senderPassword = "ComGo1!2@3#4$"
        console.log("Mail body of invitation: ", mailBody)
        mail.sendMail(req, from, to, to, sub, mailBody, attachment, filePath, senderUsername, senderPassword)
            .then(function (data) {
                console.log("Response from send mail->", data)
                var set = {
                    from: 'crm@comgo.io',
                    bcc: to,
                    subject: sub,
                    text: mailBody,
                    status: true
                }
                var collectionName = 'EmailAudit'
                crud.createData(config.cString, config.dbName, collectionName, set)
                    .then(data => {
                        deferred.resolve(data)

                    }).catch(err => {
                        deferred.reject(err)
                    })
            }).catch(function (err) {
                var set = {
                    from: 'crm@comgo.io',
                    bcc: to,
                    subject: sub,
                    text: mailBody,
                    status: false
                }
                var collectionName = 'EmailAudit'
                crud.createData(config.cString, config.dbName, collectionName, set)
                    .then(data => {
                        deferred.resolve(data)

                    }).catch(err => {
                        deferred.reject(err)
                    })
            })
    })
    return deferred.promise;
}

function updateUserRules(req, res) {
    var deferred = Q.defer();
    console.log("updateUserRules ", req.params.rulesForUser)
    var set = {
        Rules: req.body
    }
    var collectionName = 'User'
    var condition = {};
    condition["username"] = req.params.rulesForUser;
    console.log("config.connectionString: ", config.cString)
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function yourWorkSpace(req, res) {
    var deferred = Q.defer();
    var username = req.body.username
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    condition["username"] = username;
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function mailToFindWorkspace(req, res) {
    var deferred = Q.defer();
    var username = req.body.username;
    var operation = 'fp2'
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    condition["username"] = username;
    console.log("config.connectionString: ", config.cString)
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            if (data[0].userType == 'Private User') {
                var token = jwt.sign({ sub: data[0]._id }, config.secret, { expiresIn: 20 * 60 });
                console.log("token: ", token)
                var viewWorkSpaceUrl = req.body.viewWorkSpaceUrl + '?username=' + username + "&token=" + token;
                TinyURL.shorten(viewWorkSpaceUrl, function (res) {
                    var link = res;
                    var to = data[0].email;
                    var mailBody;

                    mailBody = "Hey " + username + ", \n It seems like you want to view Organizations! \n You can view it using given link " + link +
                        "\n\n Thanks for supporting great causes and working for a better society! \n\n The ComGo team";


                    var sub = 'ComGo | View Organizations';
                    var from = 'crm@comgo.io'
                    var attachment = ''
                    var filePath = ''
                    var senderUsername = "crm@comgo.io"
                    var senderPassword = "ComGo1!2@3#4$"
                    mail.sendMail(req, from, to, to, sub, mailBody, attachment, filePath, senderUsername, senderPassword)
                        .then(function (data) {
                            console.log("Response from send mail->", data)
                            deferred.resolve({ message: "Mail Send Successfully" })
                        }).catch(function (err) {
                            deferred.reject(err)
                        })
                })
            } else {
                deferred.reject('User is not a private user');
            }
        }).catch(err => {
            deferred.reject('User Not Found');
        });
    return deferred.promise;
}

function authenticate(req, res) {
    var deferred = Q.defer();
    var username = req.body.username;
    var password = req.body.password
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    condition["username"] = username;
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            if (data.length > 0 && bcrypt.compareSync(password, data[0].hash)) {    
                var body = 'username=' + username + '&orgName=Org1';
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
                    req.session.blockChainToken = bcData["token"]
                    req.session.username = data[0].username
                    var userToken = jwt.sign({ sub: data[0]._id }, config.secret);
                    data[0].userToken = userToken;
                    userAudit(req, res, 'Login Successful');
                    console.log("data[0].userType: ", data[0].userType)
                    if (data[0].userType == 'Private User') {
                        var condition2 = {}
                        condition2 = { 'Rules': { $elemMatch: { orgName: "cmrre" } } };
                        crud.readByMultipleConditions(config.cString, config.dbName, collectionName, condition, condition2, paramNotReq)
                            .then(rulesData => {
                                console.log("Rules Data:", rulesData[0].Rules)
                                data[0].userRules = rulesData[0].Rules
                                deferred.resolve(data[0])
                            }).catch(err => {
                                deferred.reject(err)
                            })
                        // db.User.find({username:username},{'Rules':{$elemMatch:{orgName:"cmrre"}}}).toArray(function (err, user) {
                        //     if (err) deferred.reject(err.name + ': ' + err.message);
                        //     console.log("user details in authenticate: ",user[0].Rules)
                        //     data[0].userRules = user[0].Rules
                        //     deferred.resolve(data[0])
                        // });
                    } else {
                        console.log("inside else", data[0])
                        deferred.resolve(data[0])
                    }
                })
            } else {
                userAudit(req, 'none', 'Login Unsuccessful');
                deferred.reject({ message: "username & password is incorrect." });
            }
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function updateSession(req, res) {
    var deferred = Q.defer();
    // db.User.findOne({ username: username }, function (err, user) {
    //     if (err) deferred.reject(err.name + ': ' + err.message);
    //     var body = 'username=' + username + '&orgName=Org1';
    //     rp({
    //         method: 'POST',
    //         uri: config.Ip + '/users',
    //         body: body,
    //         headers: {
    //             'User-Agent': 'Request-Promise',
    //             'Content-Type': 'application/x-www-form-urlencoded'
    //         }
    //     }).then(function (data) {
    //         var bcData = JSON.parse(data);
    //         var userToken = jwt.sign({ sub: user._id }, config.secret);
    //         req.body.bcData = bcData;
    //         req.body.userToken = userToken;
    //         req.body.user = user;
    //         if (user.role === 'donor') {
    //             req.body.user.orgName = 'default'
    //         }
    //         deferred.resolve(req.body)
    //     }).catch(function (error) {
    //         deferred.reject(error)
    //     })
    // });
    var username = req.body.username;
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    condition["username"] = username;
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            var body = 'username=' + username + '&orgName=Org1';
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
                req.session.blockChainToken = bcData["token"]
                req.session.username = data[0].username
                var userToken = jwt.sign({ sub: data[0]._id }, config.secret);
                data[0].userToken = userToken;
                userAudit(req, res, 'Login Successful');
                console.log("data[0].userType: ", data[0].userType)
                if (data[0].userType == 'Private User') {
                    var condition2 = {}
                    condition2 = { 'Rules': { $elemMatch: { orgName: "cmrre" } } };
                    crud.readByMultipleConditions(config.cString, config.dbName, collectionName, condition, condition2, paramNotReq)
                        .then(rulesData => {
                            console.log("Rules Data:", rulesData[0].Rules)
                            data[0].userRules = rulesData[0].Rules
                            deferred.resolve(data[0])
                        }).catch(err => {
                            deferred.reject(err)
                        })
                } else {
                    console.log("inside else", data[0])
                    deferred.resolve(data[0])
                }
            })
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


/**
* @function userAudit
* @author: Kuldeep.Ramesh.Narvekar
* @since:12/09/2018
* @argument: req:-contains ip and username ,tokenData:- contains token,firstname,role ,  status:- contains status
* @description:Used to insert login attempts
* @version: 1.0.0
* */
function userAudit(req, res, status) {
    var deferred = Q.defer();
    var date = new Date();
    var user = { "username": req.body.username, "status": status, "ip": req.body.ip, "inTime": date }
    var collectionName = 'UserAudit'
    crud.createData(config.cString, config.dbName, collectionName, user)
        .then(data => {
            deferred.resolve(data)

        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

/**
* @function getUploadedFiles
* @author: Kuldeep.Ramesh.Narvekar
* @since:12/10/2018
* @argument: req:-contains organization Name,res:-contains response
* @description:Used to get Uploaded File Details
* @version: 1.0.0
* */
function getUploadedFiles(req, res) {
    var deferred = Q.defer();
    var collectionName = 'OrganizationDocument'
    var condition = {};
    var paramNotReq = {};
    console.log("req.params.organizationName: ", req.params.organizationName)
    condition["organizationName"] = req.params.organizationName;
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(user => {
            deferred.resolve(user);
        }).catch(err => {
            deferred.reject(err)
        })
    // db.OrganizationDocument.find({}).toArray(function (err, user) {
    //     if (err) deferred.reject(err.name + ': ' + err.message);
    //     deferred.resolve(user);
    // });
    return deferred.promise;
}


/**
* @function getOrganizationDetails
* @author: Kuldeep.Ramesh.Narvekar
* @argument: req:-contains organization Name,res:-contains response
* @description:Used to get Organization Details
* @version: 1.0.0
* */
function getOrganizationDetails(req, res) {
    var deferred = Q.defer();
    var orgName = req.params.orgName;
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    condition["orgName"] = orgName;
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(user => {
            deferred.resolve(user);
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function getPaymentDetails(req, res) {
    var deferred = Q.defer();
    var collectionName = 'PaymentInfo'
    var condition = { orgName: req.params.owner }
    var paramNotReq = {}
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("Payment Info", data)
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

/**
* @function getUploadedFiles
* @author: Kuldeep.Ramesh.Narvekar
* @since:12/10/2018
* @argument: req:-contains organization Name,res:-contains response
* @description:Used to get Organization Name
* @version: 1.0.0
* */
function getOrganization(req, res) {
    var deferred = Q.defer();
    var orgName = req.params.orgName;
    console.log("orgName:", orgName)
    var collectionName = 'User'
    var condition = { orgName: orgName, hash: 0 }
    var paramNotReq = {}
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


/**
* @function logout
* @author: Kuldeep.Ramesh.Narvekar
* @since:12/09/2018
* @argument: req:-contains username
* @description:Used to save logout details
* @version: 1.0.0
* */
function logout(req, res) {
    var deferred = Q.defer();
    var username = req.body.username
    var date = new Date();
    var _id = req.session.userId;
    var collectionName = 'UserAudit'
    var set = { "outTime": date, status: 'Logout Successful' }
    var condition = { _id: mongo.helper.toObjectID(_id), username: username, status: 'Login Successful' };
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            req.session.destroy()
            deferred.resolve({ message: "User Logged out" });
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


/**
* @function getUserDetails
* @author: Kuldeep.Ramesh.Narvekar
* @since:07/08/2018
* @argument: req:-contains body,res:-contains response
* @description:Used to get User Details
* @version: 1.0.0
* */
function getUserDetails(req, res) {
    var deferred = Q.defer();
    var username = req.body.username
    var collectionName = 'User'
    var condition = { username: username }
    var paramNotReq = {
        hash: 0, url: 0, lat: 0, long: 0,
        emailBody: 0, location: 0
    }
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            var user = data[0]
            deferred.resolve(user);
        }).catch(err => {
            deferred.reject(err);
        })
    // db.User.findOne({ username: username }, {
    //     hash: 0, url: 0, lat: 0, long: 0,
    //     emailBody: 0, location: 0
    // }, function (err, user) {
    //     if (err) deferred.reject(err.name + ': ' + err.message);
    //     deferred.resolve(user);
    // });
    return deferred.promise;
}

/**
* @function getUserDetails
* @author: Kuldeep.Ramesh.Narvekar
* @since:07/08/2018
* @argument: req:-contains body,res:-contains response
* @description:Used to get User Details
* @version: 1.0.0
* */
function updateUserDetails(req, res) {
    var deferred = Q.defer();
    if (req.body.userType == "Private User") {
        var set = {
            address: req.body.address,
            city: req.body.city,
            country: req.body.country,
            countryCode: req.body.countryCode,
            email: req.body.email,
            firstName: req.body.firstName,
            firstSurname: req.body.firstSurname,
            idNumber: req.body.idNumber,
            mobileNoWithoutCountryCode: req.body.mobileNoWithoutCountryCode,
            phone: req.body.phone,
            secondSurname: req.body.secondSurname,
            zipCode: req.body.zipCode
        }
        var collectionName = 'User'
        var condition = { username: req.body.username }
        crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
            .then(data => {
                deferred.resolve(data);
            }).catch(err => {
                deferred.reject(err)
            })
    } else {
        var set = {
            orgName: req.body.orgName,
            country: req.body.country,
            countryCode: req.body.countryCode,
            email: req.body.email,
            idNumber: req.body.idNumber,
            mobileNoWithoutCountryCode: req.body.mobileNoWithoutCountryCode,
            phone: req.body.phone,
            domainName: req.body.domainName
        }
        var collectionName = 'User'
        var condition = { username: req.body.username }
        crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
            .then(data => {
                deferred.resolve(data);
            }).catch(err => {
                deferred.reject(err)
            })
    }
    return deferred.promise;
}

/**
* @function checkPassword
* @author: Kuldeep.Ramesh.Narvekar
* @since:07/08/2018
* @argument: req:-contains body,res:-contains response
* @description:Used to check Password
* @version: 1.0.0
* */
function checkPassword(req, res) {
    var deferred = Q.defer();
    var username = req.body.username
    var password = req.body.password
    var collectionName = 'User'
    var paramNotReq = {};
    var condition = { username: username };
    console.log("crud params: ",config.cString, config.dbName, collectionName, condition, paramNotReq)
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("user data: ",data[0])
            var user = data[0]
            if (user && bcrypt.compareSync(password, user.hash)) {
                user.hash = '';
                user.confirmPassword = '';
                deferred.resolve(user);
            }
            else {
                deferred.reject();
            }
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

/**
* @function changePassword
* @author: Kuldeep.Ramesh.Narvekar
* @since:07/08/2018
* @argument: req:-contains body,res:-contains response
* @description:Used to get User Details
* @version: 1.0.0
* */
function changePassword(req, res) {
    var deferred = Q.defer();
    var username = req.body.username
    var password = req.body.password
    var hash = bcrypt.hashSync(req.body.password, 10);
    var collectionName = 'User'
    var condition = { username: username }
    var set = { createFlag: 1, hash: hash }
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            // deferred.resolve(authenticate(req, username, password));
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


function create(req, res) {
    console.log("user register : ", req.body)
    var deferred = Q.defer();
    var userParam = req.body;
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    console.log("userParam.username:", userParam.username)
    condition["username"] = userParam.username;
    console.log("config.connectionString: ", config.cString)
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("create function: ", data)
            deferred.reject('Username is already taken');

        }).catch(err => {
            console.log("user not found")
            deferred.resolve(checkIdNum(req, res));
            //   deferred.reject(err)
        })
    return deferred.promise;
}

function checkIdNum(req, res) {
    console.log("user register : ", req.body)
    var deferred = Q.defer();
    var userParam = req.body;
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    console.log("userParam.username:", userParam.username)
    condition["idNumber"] = userParam.idNumber;
    console.log("config.connectionString: ", config.cString)
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("create function: ", data)
            deferred.reject('Id Number is already taken');

        }).catch(err => {
            console.log("user not found")
            deferred.resolve(createUser(req, res));
            //   deferred.reject(err)
        })
    return deferred.promise;
}

/**
    * @function createUserLocal
    * @author: Kuldeep.Ramesh.Narvekar
    * @since:04/08/2018
    * @argument: None,
    * @description:Used to Register User
    * @version: 1.0.0
* */
function createUser(req, res) {
    var deferred = Q.defer();
    if (req.body.userType == 'Organization') {
        req.body.profile = 'false'    // 'false' set as half profile
    } else {
        req.body.profile = 'true'
    }
    var userParam = req.body;
    var user = req.body;
    console.log("domainName : ", userParam.domainName)
    user.hash = bcrypt.hashSync(userParam.password, 10);
    if (user.userType == 'Organization') {
        user.regUser = 0;
    } else {
        user.regUser = 1;
    }
    user.confirmPassword = user.hash;
    user.password = user.hash;
    var collectionName = 'User'
    console.log("config.connectionString: ", config.cString)
    user.Rules = []
    console.log("Register data : ", user)
    crud.createData(config.cString, config.dbName, collectionName, user)
        .then(data => {
            console.log("create function: ", data)
            if (req.body.domainName != '') {
                var domainData = {};
                domainData.domainName = req.body.domainName
                domainData.pointTo = config.awsIP
                domainData.comment = 'Domain Created'
                deferred.resolve(registration(req, res))
            }
            else {
                deferred.resolve(registration(req, res))
            }

        }).catch(err => {
            console.log("user not found")
            deferred.reject(err)
        })

    return deferred.promise;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//# Akshay :- 08-08-2017 registration to blockchain///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
function registration(req, res) {
    var deferred = Q.defer();
    var username = req.body.username;
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
        console.log("User Enrolled", data)
        req.data = data;
        // deferred.resolve({ message: "Registration Successful" })
        deferred.resolve(initUser(req, res));
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////
//# Akshay :- 08-08-2017 init user to blockchain///////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////
function initUser(req, res) {
    var deferred = Q.defer();
    var data = req.data;
    var data = JSON.parse(data);
    var blockChainToken = data.token;
    var role = req.body.role;
    var lat = req.body.lat;
    var long = req.body.long;
    if(req.body.userType == 'Private User'){
        
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "addPrivateUser",
        "args": [req.body.username, req.body.firstName, req.body.firstSurname, req.body.role, lat, long]
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
        // if (req.body.userType == 'Organization') {
        //     var domainData;
        //     domainData.domainName = req.body.domainName
        //     domainData.pointTo = config.awsIP
        //     domainData.comment = 'Domain Created'
        //     deferred.resolve(addDomain(domainData))
        // } else {
        //     deferred.resolve({ message: "Registration Successful" })
        // }
        deferred.resolve(sendRegistrationEmail(req, res))
    }).catch(function (err) {
        deferred.reject(err);
    })
} else {
    var body = {
        "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
        "fcn": "addAdmin",
        "args": [req.body.username, req.body.orgName, req.body.userType, lat, long]
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
        console.log("init org response: ", data)
        deferred.resolve(sendRegistrationEmail(req, res))
    }).catch(function (err) {
        deferred.reject(err);
    }) 
}
    return deferred.promise;
}


/**
 * @function sendRegistrationEmail
 * @author: Kuldeep.Ramesh.Narvekar the legend
 * @since:04/08/2018
 * @argument: req:-contains body,res:-contains response
 * @description:Used to send email to Registered User
 * @version: 1.0.0
 * */
function sendRegistrationEmail(req, res) {
    var deferred = Q.defer();
    var to = req.body.email;
    var mailBody;
    var templateName;
    if(req.body.userType == 'Organization'){
        templateName = "Register Organization"
    } else {
        templateName = "Register Private User"
    }
    var from = 'crm@comgo.io'
    var attachment = ''
    var filePath = ''
    var senderUsername = "crm@comgo.io"
    var senderPassword = "ComGo1!2@3#4$"
    var collectionName = 'EmailTemplate'
    var condition = {};
    var paramNotReq = {};
    condition["name"] = templateName;
crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            console.log("response data: ",data[0].subject)
    mail.sendMail(req, from, to, to,data[0].subject,data[0].body, attachment, filePath, senderUsername, senderPassword,templateName)
        .then(function (data) {
            deferred.resolve(data)
        }).catch(function (err) {
            deferred.reject(err)
        })
    })

    return deferred.promise;
}

/**
 * @function sendEmail
 * @author: Kuldeep.Ramesh.Narvekar the legend
 * @since:04/08/2018
 * @argument: req:-contains body,res:-contains response
 * @description:Used to send email to Registered User
 * @version: 1.0.0
 * */
function sendEmail(req, res) {
    var deferred = Q.defer();
    var to = req.body.email;
    var mailBody;
    var sub = "User Approved successfully"
    mailBody = "You have successfully completed your registration. Please enter your account to start tracking your impact.";
    var from = 'crm@comgo.io'
    var attachment = ''
    var filePath = ''
    var senderUsername = "crm@comgo.io"
    var senderPassword = "ComGo1!2@3#4$"
    mail.sendMail(req, from, to, to, sub, mailBody, attachment, filePath, senderUsername, senderPassword)
        .then(function (data) {
            console.log("Response from send mail->", data)
            var set = {
                from: 'crm@comgo.io',
                bcc: to,
                subject: sub,
                text: mailBody,
                status: true
            }
            var collectionName = 'EmailAudit'
            crud.createData(config.cString, config.dbName, collectionName, set)
                .then(data => {
                    deferred.resolve(data)

                }).catch(err => {
                    deferred.reject(err)
                })
        }).catch(function (err) {
            var set = {
                from: 'crm@comgo.io',
                bcc: to,
                subject: sub,
                text: mailBody,
                status: false
            }
            var collectionName = 'EmailAudit'
            crud.createData(config.cString, config.dbName, collectionName, set)
                .then(data => {
                    deferred.resolve(data)

                }).catch(err => {
                    deferred.reject(err)
                })
        })

    return deferred.promise;
}


/**
* @author AKshay Misal
* @description This function will add new donor user into the blockchain
*/
function initFoundationDonor(req, res) {
    var deferred = Q.defer();
    var foundationName = req.body.foundationName;
    var lat = req.body.lat;
    var long = req.body.long;

    var body = 'username=' + req.body.username + 'Donor' + '&orgName=Org1';
    rp({
        method: 'POST',
        uri: config.Ip + '/users',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }).then(function (donorData) {
        var foundDonor = JSON.parse(donorData);
        var foundDonorToken = foundDonor.token;
        var body = {
            "peers": ["peer0.org1.example.com", "peer1.org1.example.com"],
            "fcn": "invoke",
            "args": ["init_donor", req.body.username + 'Donor', foundationName, lat, long]
        };

        rp({
            method: 'POST',
            uri: config.Ip + '/channels/mychannel/chaincodes/test',
            body: JSON.stringify(body),
            headers: {
                'User-Agent': 'Request-Promise',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + foundDonorToken
            }
        }).then(function (data) {
            deferred.resolve(data);
        }).catch(function (error) {
            deferred.reject(error);
        })
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

function addPath(req, res) {
    var deferred = Q.defer();

    var data = {
        path: "/assets/images/orgLogos/default.png",
        orgName: req.body.foundationName
    }
    var collectionName = 'OrgLogo'
    crud.createData(config.cString, config.dbName, collectionName, data)
        .then(doc => {
            deferred.resolve(doc)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}

function getOrganizationsForProject(req,res){
    var deferred = Q.defer();
    var collectionName = 'User'
    var paramNotReq = {};
    var condition;
    condition = { userType: 'Organization',orgName: { $ne: req.params.organization },profile: 'true' };
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
    .then(data => {
        deferred.resolve(data)
    }).catch(err => {
        deferred.reject(err)
    })
    return deferred.promise;
}

function getAllUser(req, res) {
    var deferred = Q.defer();
    var collectionName = 'User'
    var paramNotReq = {};
    var condition;
    console.log("userType: ", req.params)
    if (req.params.userType == 'admin' && req.params.userCondition == 'pendingUser') {
        // console.log("userType: ", req.params)
        condition = { userType: 'Organization', regUser: 0 };
        crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    } else if (req.params.userType == 'admin' && req.params.userCondition == 'registeredUser') {
        condition = { userType: 'Organization', regUser: 1 };
        crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    } else if (req.params.userType == 'admin' && req.params.userCondition == 'privateUser') {
        condition = { userType: 'Private User' };
        crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    }
    else if (req.params.userType == 'Organization' && req.params.userCondition == 'myUsers') {
        var condition2;
        condition = { Rules: { $elemMatch: { orgName: req.params.orgName } } }
        crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    }  else if (req.params.userType == 'Organization' && req.params.userCondition == 'searchUsers') {
        console.log("Search users")
        var condition2 = {};
        // condition = { userType: 'Private User' };
        condition2 = { userType: 'Private User',"Rules.orgName": {$ne: req.params.orgName} } 
        crud.readByCondition(config.cString, config.dbName, collectionName,condition2, paramNotReq)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    }
    
    return deferred.promise;
}

/** 
 * @author:Kuldeep
 * @argument {1/0} 
 * @description:activate and deactive user if(1)- activate if(0)- deactivate   
*/

function approveUser(req, res) {
    var deferred = Q.defer();
    var set = {
        regUser: req.body.regUser
    }

    var collectionName = 'User'
    var condition = {};
    condition["username"] = req.body.username;
    console.log("config.connectionString: ", config.cString)
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(modifiedData => {
            console.log("modifiedData: ",modifiedData)
            var collectionName1 = 'User'
            var condition1 = {};
            var paramNotReq1 = {
                hash: 0, url: 0, lat: 0, long: 0,
                emailBody: 0, location: 0
            }
            condition1["username"] = req.body.username;
            console.log("get details: ",config.cString, config.dbName, collectionName1, condition1, paramNotReq1)
            if (req.body.regUser == 1) {
                crud.readByCondition(config.cString, config.dbName, collectionName1, condition1, paramNotReq1)
                .then(user => {
                    console.log("user details: ",user)
                    req.body.email = user[0].email
                    deferred.resolve(sendEmail(req, res))
                }).catch(err => {
                    deferred.reject(err);
                })
            } else {
                deferred.resolve(modifiedData)
            }
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
};

// get all validators

function getAllValidator(username, foundationName) {
    var deferred = Q.defer();
    var collectionName = 'User'
    var condition = {};
    var paramNotReq = {};
    var organizations = JSON.parse(foundationName)
    condition = { Rules: { $elemMatch: { $and: [{ orgName: {$in:organizations}, validate_Proof: true }] } } }
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(user => {
            deferred.resolve(user);
        }).catch(err => {
            deferred.reject(err)
        })
    // db.User.find({ Rules: { $elemMatch: { $and: [{orgName: "cmrre",validate_Proof:true}] } } }).toArray(function (err, user) {
    //     // console.log("validator users",user)
    //     if (err) deferred.reject(err.name + ': ' + err.message);
    //     deferred.resolve(user);
    // });
    return deferred.promise;
}

function updateProfile(req, res) {
    var deferred = Q.defer();
    var set = {
        orgLegalName: req.body.orgLegalName,
        orgTaxId: req.body.orgTaxId,
        profile: 'true',
        paypal: req.body.paypal
    }

    var collectionName = 'User'
    var condition = {};
    condition["username"] = req.body.username;
    console.log("config.connectionString: ", config.cString)
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


function updateTokenDetails(req, res) {
    var deferred = Q.defer();
    var set = {
        accountType: req.body.accountType,
        sandBoxtoken: req.body.sandBoxtoken,
        liveToken: req.body.liveToken
    }
    var collectionName = 'PaymentInfo'
    var condition = { foundationName: req.body.foundationName }
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


function insertTokenDetails(req, res) {
    var deferred = Q.defer();
    var tokenDetails = req.body
    var collectionName = 'PaymentInfo'
    crud.createData(config.cString, config.dbName, collectionName, tokenDetails)
        .then(data => {
            deferred.resolve(data)
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}


function validateUser(req, res) {
    var deferred = Q.defer();
    var username = req.body.username;
    var operation = 'fp2'
    var collectionName = 'User'
    var paramNotReq = {};
    var condition = { username: username };
    crud.readByCondition(config.cString, config.dbName, collectionName, condition, paramNotReq)
        .then(data => {
            var user = data[0]
            if (user) {
                var forgetPasswordUrl = req.body.forgetPasswordUrl + "/" + username + "/" + operation;
                TinyURL.shorten(forgetPasswordUrl, function (res) {
                    var link = res;
                    var to = user.email;
                    var mailBody;

                    mailBody = "Hey " + username + ", \n It seems like you forgot your password! \n No issues! You can change your password using given link " + link +
                        "\n\n Thanks for supporting great causes and working for a better society! \n\n The ComGo team";


                    var sub = 'ComGo | Forgot Password';
                    var from = 'crm@comgo.io'
                    var attachment = ''
                    var filePath = ''
                    var senderUsername = "crm@comgo.io"
                    var senderPassword = "ComGo1!2@3#4$"
                    mail.sendMail(req, from, to, to, sub, mailBody, attachment, filePath, senderUsername, senderPassword)
                        .then(function (data) {
                            console.log("Response from send mail->", data)
                            deferred.resolve(data)
                        }).catch(function (err) {
                            deferred.reject(err)
                        })
                })
            } else {
                deferred.reject('User Not Found');
            }
        }).catch(err => {
            deferred.reject(err)
        });
    return deferred.promise;
}


function forgotPassword(req, res) {
    var deferred = Q.defer();
    var username = req.body.username
    var hash = bcrypt.hashSync(req.body.password, 10);
    var collectionName = 'User'
    var condition = { username: username };
    var set = { hash: hash }
    crud.modifyData(config.cString, config.dbName, collectionName, condition, set)
        .then(data => {
            deferred.resolve(data);
        }).catch(err => {
            deferred.reject(err)
        })
    return deferred.promise;
}