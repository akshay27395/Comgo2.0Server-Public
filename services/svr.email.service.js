'use strict'
var _ = require('lodash');
var Q = require('q');
var nodemailer = require("nodemailer");

var service = {};
service.sendMail = sendMail;
module.exports = service;

function sendMail(req, from, tomail, bcc, subject, body, attachment, filePath, username, password,templateName) {
    var deferred = Q.defer();
    console.log("Inside send mail")
    var smtpTransport = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
        auth: {
            user: username,
            pass: password
        },
        requireTLS: true,
        tls: {
            ciphers: 'SSLv3'
        }
    });

    var tomail = tomail;
    var mailOptions;
    if (attachment == '') {
        mailOptions = {
            from: from,
            bcc: bcc,
            subject: subject,
            text: body
        }
    } else {
        mailOptions = {
            from: from,
            bcc: bcc,
            subject: subject,
            text: body,
            attachments: [{
                filename: attachment,
                path: filePath
            }]
        }
    }
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            deferred.reject(error);
        } else {
            deferred.resolve(response);
        }
    });
    return deferred.promise;
}