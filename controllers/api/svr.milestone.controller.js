var express = require('express');
var router = express.Router();
var milService = require('services/svr.milestone.service');

router.get('/allByName/:_projId', getByProjname);
router.get('/getAllAudit/:_projId', getAllAudit);
router.post('/create', createMilestone);
router.get('/getMilestoneById/:milestoneId', getMilestoneById);
router.get('/updateFundReq/:milestoneId/:fundReq', updateFundReq);
router.post('/BKCFundReleased', BKCFundReleased);
router.post('/BKCFundRequest', BKCFundRequest);
router.get('/updateFundRel/:milestoneId/:fundRel', updateFundRel);
router.get('/updateProofStatus/:milestoneId/:status', updateProofStatus);
router.get('/updateFundBudget/:milestoneId/:fundBudgeted', updateFundBudget);
router.get('/getProjectMilestones/:id', getProjectMilestones);
router.get('/BKCGetAll/:projectId', BKCGetAllDetails);
router.delete('/:_id/:projectId/:milestoneId/:milestone/:role', deleteDocument);
router.get('/allByMilestoneId/:milestoneId', getAllByMilestoneId);
router.put('/', updateMilestone);

module.exports = router;


function getProjectMilestones(req, res) {
    milService.getProjectMilestones(req, res).then(function (data) {
        res.send(data);
    })
        .catch(function (err) {
            res.send(err);
        });
}

// #Akshay 07-08-2017 :- get all project details 
function BKCGetAllDetails(req, res) {
    milService.BKCGetAllDetails(req, res).then(function (data) {
        res.send(data);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateMilestone(req, res) {
    console.log("updateMilestone controller")
    milService.update(req, res).then(function (data) {
        console.log("milestone update res:",data)
        res.status(200).send(data);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function getByProjname(req, res) {
    var projectId = req.params._projId;
    var milestoneId = req.params.milestoneId;

    milService.GetByProjname(projectId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllAudit(req, res) {
    var projectId = req.params._projId;
    var milestoneId = req.params.milestoneId;
    milService.getAllAudit(projectId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

// #GM 060717 :- Update FundRequested in ProjectMilestone
function updateFundReq(req, res) {
    var milestoneId = req.params.milestoneId;
    var fundReq = req.params.fundReq;
    milService.UpdateFundReq(milestoneId, fundReq)
        .then(function (projectDet) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

// #Akshay 27-07-2017 :- Update release in blockchain
function BKCFundReleased(req, res) {
    console.log("BKCFundRequest : ",req)
    console.log("BKCFundReleased")
    milService.BKCFundReleased(req, res)
        .then(function (projectDet) {
            res.send({ message: "Fund Released" });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

// #Akshay 27-07-2017 :- Update FundRequested in blockchain
// #Madhura :- 30-07-2017 send status
function BKCFundRequest(req, res) {
    console.log("BKCFundRequest: ",req.body)
    milService.BKCFundRequest(req, res)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

// #Akshay :- 22-07-2017 Add milestone to mongodb
function createMilestone(req, res) {
    milService.create(req, res)
        .then(function (data) {
            res.status(200).send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


// #GM 060717 :- Update FundReleased in ProjectMilestone
function updateFundRel(req, res) {
    var milestoneId = req.params.milestoneId;
    var fundRel = req.params.fundRel;
    milService.UpdateFundRel(milestoneId, fundRel)
        .then(function (projectDet) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateProofStatus(req, res) {
    var milestoneId = req.params.milestoneId;
    var status = req.params.status;
    milService.UpdateProofStatus(milestoneId, status)
        .then(function (data) {
            res.send({message:"successful"});
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

//#MG update fundBudgeted
function updateFundBudget(req, res) {
    var milestoneId = req.params.milestoneId;
    var fundBudgeted = req.params.fundBudgeted;
    milService.updateFundBudget(milestoneId, fundBudgeted)
        .then(function (projectDet) {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getMilestoneById(req, res) {
    console.log("getMilestoneById controller")
    var milestoneId = req.params.milestoneId;
    milService.getMilestoneById(req,milestoneId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteDocument(req, res) {
    milService.delete(req, res)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.send(err);
        });
}

function getAllByMilestoneId(req, res) {
    var milestoneId = req.params.milestoneId;
    milService.getAllByMilestoneId(milestoneId)
        .then(function (milestoneDetails) {
            res.send(milestoneDetails);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

