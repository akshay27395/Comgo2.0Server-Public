var express = require('express');
var router = express.Router();
var projectdonation = require('services/svr.projectdonation.service');

router.get('/allMyProject', getMyProject);
router.get('/allOtherProject', getOtherProject);
router.get('/allFunds', getAllFundDetails);
router.get('/allGroupBy', getAllProjectDonation);
router.get('/BKCMyFunds', BKCgetAllMyDonationDetails);
router.get('/all/:projectId', getAll);

module.exports = router;

function getAllFundDetails(req, res) {
    projectdonation.getAllFundDetails(req, res).then(function (data) {
        res.send(data);
    }).catch(function (err) {
        res.status(400).send(err);
    });
}
//#Madhura : Get my donation from blockchain
function BKCgetAllMyDonationDetails(req, res) {
    var token = req.session.blockChainToken;
    projectdonation.getAllMyFundDetails(token, req.session.username).then(function (data) {
        res.send(data);
    }).catch(function (err) {
        res.status(400).send(err);
    });
}

function getMyProject(req, res) {
    var donorId = req.session.username;
    projectdonation.getAllMyProject(donorId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getOtherProject(req, res) {
    var donorId = req.session.username;
    projectdonation.getAllOtherProject(donorId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllProjectDonation(req, res) {
    projectdonation.getAllProjectDonation()
        .then(function (proj) {
            res.send(proj)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    var projectId = req.params.projectId;
    projectdonation.getAll(projectId).then(function (proj) {
        res.send(proj)
    }).catch(function (err) {
        res.status(400).send(err);
    });
}