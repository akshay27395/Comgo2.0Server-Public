/**
 * Created By :- Akshay
 * Created Date :- 10-06-2017 01:00 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var alldonor = require('services/svr.alldonor.service');

router.get('/getAllDonorListDB', getAll);
router.post('/getAllDonorListDB', getAllDonorListDB);
router.post('/getMyDonations', getMyDonations);
router.post('/getDonorProjectDonation',getDonorProjectDonation)

module.exports = router;


function getDonorProjectDonation(req, res) {
    alldonor.getDonorProjectDonation(req, res)
        .then(function(donationInfo) {
            res.send(donationInfo)
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    var projId = req.params.projId;
    var donorId = req.params.donorId;
    alldonor.getAll(projId, donorId)
        .then(function(proj) {
            res.send(proj)
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function getAllDonorListDB(req, res) {
    alldonor.getAllDonorListDB(req, res)
        .then(function(proj) {
            res.send(proj)
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function getMyDonations(req, res) {
    alldonor.getMyDonations(req, res)
        .then(function(donationInfo) {
            res.send(donationInfo)
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

