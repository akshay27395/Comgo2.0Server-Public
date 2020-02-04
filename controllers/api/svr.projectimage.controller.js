/**
 * Created By :- Akshay
 * Created Date :- 12-06-2017 02:30 pm
 * Version :- 1.0
 */
var express = require('express');
var router = express.Router();
var imageService = require('services/svr.projectimage.service');
router.get('/getImageByProjId/:_projId', GetImageByProjId);
router.post('/allByProjIdWeb', allByProjIdWeb);

module.exports = router;


function allByProjIdWeb(req,res) {
    // var hour = config.hour;
    // session.updateSession(req,hour, function(err,sessionData){
    //     if(err) res.send(err);
    //     console.log('sessionData ====== ',req.session)
    //     req.session = sessionData;
    // });
    var projectId = req.body.projId;
    imageService.allByProjIdWeb(projectId)
    
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function GetImageByProjId(req,res) {
    var projectId = req.params._projId;
    imageService.GetImageByProjId(projectId)
    
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}