/**
 * Updated By :- Akshay
 * Created Date :- 17-06-2017 08:44 am
 * Version :- 1.0
 */

//Variables are defined for getting details from Blockchain
var express = require('express');
var rp = require('request-promise');
var app = express();
var errors = require('request-promise/errors');
var router = express.Router();

// use session auth to secure the angular app files
router.use('/', function (req, res, next) {
    if (req.path !== '/login' && !req.session.token) {
        return res.redirect('/login?returnUrl=' + encodeURIComponent('/app' + req.path));
    }

    next();
});

// make JWT token available to angular app
router.get('/token', function (req, res) {
    res.send(req.session.token);
});

// Blockchain Services to Create Channel
router.get('/createChannel', function (req, res) {
    var authorization = 'Bearer ' + req.session.blockChainToken;
    var body = {
        'channelName': 'mychannel',
        'channelConfigPath': '../artifacts/channel/mychannel.tx'
    };
    rp({
        method: 'POST',
        uri: 'http://localhost:4000/channels',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': authorization
        },
        json: true
    }).then(function (data) {
        res.send(data);
    }).catch(errors.StatusCodeError, function (reason) {
        // The server responded with a status codes other than 2xx.
        // Check reason.statusCode
        //deferred.resolve();
    }).catch(errors.RequestError, function (reason) {
        // The request failed due to technical reasons.
        // reason.cause is the Error object Request would pass into a callback.
        //deferred.resolve();
    });

});

// Blockchain Services to Join Channel
router.get('/joinChannel', function (req, res) {
    var authorization = 'Bearer ' + req.session.blockChainToken;

    var body = {
        'peers': ['peer0.org1.example.com', 'peer1.org1.example.com']
    };
    rp({
        method: 'POST',
        uri: 'http://localhost:4000/channels/mychannel/peers',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': authorization
        },
        json: true
    }).then(function (data) {
        //installChaincode(blockchainToken);
        res.send(data);

    }).catch(errors.StatusCodeError, function (reason) {
        // The server responded with a status codes other than 2xx.
        // Check reason.statusCode

    }).catch(errors.RequestError, function (reason) {
        // The request failed due to technical reasons.
        // reason.cause is the Error object Request would pass into a callback.

    });

});

// Blockchain Services to Install ChainCode
router.get('/installChainCode', function (req, res) {
    var authorization = 'Bearer ' + req.session.blockChainToken;

    var body = {
        'peers': ['peer0.org1.example.com', 'peer1.org1.example.com'],
        'chaincodeName': 'mycc',
        'chaincodePath': 'github.com/comgo',
        'chaincodeVersion': 'v0'
    };
    rp({
        method: 'POST',
        uri: 'http://localhost:4000/chaincodes',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': authorization
        },
        json: true
    }).then(function (data) {
        res.send(data);

    }).catch(errors.StatusCodeError, function (reason) {
        // The server responded with a status codes other than 2xx.
        // Check reason.statusCode

    }).catch(errors.RequestError, function (reason) {
        // The request failed due to technical reasons.
        // reason.cause is the Error object Request would pass into a callback.

    });
});

// Blockchain Services to Instantiate ChainCode
router.get('/instantiateChainCode', function (req, res) {
    var authorization = 'Bearer ' + req.session.blockChainToken;

    var body = {
        'peers': ['peer0.org1.example.com'],
        'chaincodeName': 'mycc',
        'chaincodeVersion': 'v0',
        'functionName': 'init',
        'args': ['44444']
    };
    rp({
        method: 'POST',
        uri: 'http://localhost:4000/channels/mychannel/chaincodes',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': authorization
        },
        json: true
    }).then(function (data) {
        res.send(data);

    }).catch(errors.StatusCodeError, function (reason) {
        // The server responded with a status codes other than 2xx.
        // Check reason.statusCode

    }).catch(errors.RequestError, function (reason) {
        // The request failed due to technical reasons.
        // reason.cause is the Error object Request would pass into a callback.

    });
});

// Blockchain Services to Init Donor
router.get('/initDonor', function (req, res) {
    var authorization = 'Bearer ' + req.session.blockChainToken;

    var body = {
        'peers': ['peer0.org1.example.com', 'peer1.org1.example.com'],
        'fcn': 'invoke',
        'args': ['init_donor', 'test_donor1', 'donor_test', 'test_donor_company']
    };
    rp({
        method: 'POST',
        uri: 'http://localhost:4000/channels/mychannel/chaincodes/mycc',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': authorization
        },
        json: true
    }).then(function (data) {
        res.send(data);

    }).catch(errors.StatusCodeError, function (reason) {
        // The server responded with a status codes other than 2xx.
        // Check reason.statusCode

    }).catch(errors.RequestError, function (reason) {
        // The request failed due to technical reasons.
        // reason.cause is the Error object Request would pass into a callback.

    });
});
// Blockchain Services to Init Project
router.get('/initProject', function (req, res) {
    var authorization = 'Bearer ' + req.session.blockChainToken;

    var body = {
        'peers': ['peer0.org1.example.com', 'peer1.org1.example.com'],
        'fcn': 'invoke',
        'args': ['init_project', 'test_project2', '6000.08', 'test_donor1', 'test_donor_company']
    };
    rp({
        method: 'POST',
        uri: 'http://localhost:4000/channels/mychannel/chaincodes/mycc',
        body: body,
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': authorization
        },
        json: true
    }).then(function (data) {
        res.send(data);

    }).catch(errors.StatusCodeError, function (reason) {
        // The server responded with a status codes other than 2xx.
        // Check reason.statusCode

    }).catch(errors.RequestError, function (reason) {
        // The request failed due to technical reasons.
        // reason.cause is the Error object Request would pass into a callback.

    });
});

// serve angular app files from the '/app' route
router.use('/', express.static('app'));

module.exports = router;
