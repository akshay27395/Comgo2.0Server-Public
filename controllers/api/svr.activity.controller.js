/**
 * Created By :- Madhura
 * Created Date :- 06-07-2017 05:30 pm
 * Version :- 1.1
 */
var config = require('config.json');
var express = require('express');
var router = express.Router();
var activityService = require('services/svr.activity.service');
router.get('/allByName/:_projId', getByProjname);
router.post('/create', createActivity);
router.post('/updateActivity', updateActivity);
router.get('/activityByProjectId/:projectId', getActivityByProjectId);
router.delete('/:activityId/:projectId/:milestoneId/:milestoneName/:activityName/:role', deleteDocument);
router.get('/getActivityById/:activityId', getActivityById);
router.post('/approveActivity', approveActivity)
router.post('/closeActivity', closeActivity)
router.post('/allocateFunds', allocateFunds)
router.post('/balancedFundAllocate', balancedFundAllocate)
router.get('/getMilestoneActivities/:id', getMilestoneActivities);
router.post('/sendForApproval',sendForApproval)
router.post('/BKCActivityValidation',BKCActivityValidation)
module.exports = router;

function BKCActivityValidation(req, res) {
    console.log("BKCActivityValidation",req.body)
    activityService.BKCActivityValidation(req, res).then(function (response) {
        res.send(response);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function sendForApproval(req, res) {
    activityService.sendForApproval(req, res).then(function (response) {
        res.send(response);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getMilestoneActivities(req, res) {
    activityService.getMilestoneActivities(req, res).then(function (data) {
        res.send(data);
    })
        .catch(function (err) {
            res.send(err);
        });
}

function createActivity(req, res) {
    console.log("Inside createActivity controller")
    activityService.createActivity(req, res)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getByProjname(req, res) {
    var projectId = req.params._projId;

    activityService.GetByProjname(projectId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getActivityById(req, res) {
    var activityId = req.params.activityId;
    activityService.getActivityById(req,activityId)
        .then(function (doc) {
            res.send(doc)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getActivityByProjectId(req, res) {
    var projectId = req.params.projectId;
    activityService.getActivityByProjectId(projectId)
        .then(function (doc) {
            res.send(doc)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateActivity(req, res) {
    console.log("updateActivity controller")
    activityService.updateActivityDetails(req, res).then(function (response) {
        res.status(200).send(response);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function approveActivity(req, res) {
    activityService.approveActivity(req, res).then(function (response) {
        res.send(response);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function closeActivity(req, res) {
    var hour = config.hour;
    activityService.closeActivity(req, res).then(function (response) {
        res.send(response);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function allocateFunds(req, res) {
    var hour = config.hour;
    activityService.allocateFunds(req, res).then(function (response) {
        res.send(response);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function balancedFundAllocate(req, res) {
    activityService.balancedFundAllocate(req, res).then(function (response) {
        res.send(response);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteDocument(req, res) {
    activityService.delete(req, res)
        .then(function (result) {
            res.status(200).send(result);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getActivityByActivityId(req, res) {
    console.log("getActivityByActivityId: ")
    var activityId = req.params.activityId;
    activityService.getActivityByActivityId(activityId)
        .then(function (doc) {
            res.status(200).send(doc)
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

