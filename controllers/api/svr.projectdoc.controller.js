/**
 * Created By :- Kuldeep
 * Created Date :- 06-09-2018 11:30 am
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var docService = require('services/svr.projectdoc.service');

router.get('/allByProjId/:projId', GetDocByProjId);
router.post('/allByProjIdWeb', allByProjIdWeb);

module.exports = router;

function GetDocByProjId(req,res) {
    var projectId = req.params.projId;
    docService.GetDocByProjId(projectId)
    
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function allByProjIdWeb(req,res) {
    var projectId = req.body.projId;
    docService.allByProjIdWeb(projectId)
    
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}