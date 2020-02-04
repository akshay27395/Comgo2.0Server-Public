/**
 * Created By :- Akshay
 * Created Date :- 10-06-2017 01:00 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var projectcommunication = require('services/svr.projectcommunication.service');
router.get('/all/:projId/:donorId', getAll);
router.get('/GetAllReceiveEmail', GetAllReceiveEmail);
router.post('/saveEmail', saveEmail);

module.exports = router;

function getAll(req, res) {
    var projId = req.params.projId;
    var donorId = req.params.donorId;

    projectcommunication.getAll(projId, donorId)
        .then(function(proj) {
            res.send(proj)
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}

function GetAllReceiveEmail(req, res) {
    console.log("GetAllReceiveEmail")
    projectcommunication.GetAllReceiveSms(req, res);
        res.send({proj:"proj"})

}

function saveEmail(req, res) {
    projectcommunication.saveEmail(req, res)
        .then(function(proj) {

            res.status(200).send(proj);
        })
        .catch(function(err) {
            res.status(400).send(err);
        });
}