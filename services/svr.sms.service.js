'use strict'
var _ = require('lodash');
var Q = require('q');
var config = require('config.json');
var accountSid = config.accountSid;
var authToken = config.authToken;
var client = require('twilio')(accountSid, authToken);
var nodemailer = require("nodemailer");

var service = {};
service.sendSMS = sendSMS;
service.sendMultipleSMS = sendMultipleSMS;
module.exports = service;

function sendSMS(req,to,from,body) {
    console.log("SMS body in service:", body)
    var deferred = Q.defer();
    client.messages
    .create({
        to: to,
        from: from,
        body: body,
    })
    .then(message => deferred.resolve(message));
    return deferred.promise;
}

async function sendMultipleSMS(req,to,from,body) {
    console.log("SMS body in multiple sms service:", body,to.length,to)
    var deferred = Q.defer();
//    var to = [ '+917045870802', '+919503934304' ]
    for(var i=0;i<to.length;i++){
    var toNumber = to[i]
    console.log("to mobile:",toNumber);
    await new Promise(next => {
    client.messages
    .create({
        to: toNumber,
        from: from,
        body: body,
    })
    .then(message => console.log("message send:",message.sid));
    next()
})
}
    return deferred.promise;
}
