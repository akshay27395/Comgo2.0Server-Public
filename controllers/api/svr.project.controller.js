/**
 * Created By :- Girijashankar Mishra
 * Created Date :- 08-05-2017 15:45 pm
 * Version :- 1.0
 * Updated By :- Akshay
 * Updated Date :- 17-07-2017 02:00 pm
 * Version :- 2.0.0 #akshay add project to blockchain
 * Updated By :- Akshay
 * Updated Date :- 29-07-2017 10:00 pm
 * Version :- 2.0.1 #akshay BKCpublishProject to blockchain
 * Updated By :- Akshay
 * Updated Date :- 17-08-2017 01:43 pm
 * Version :- 2.0.2 #project validation to blockchain
 */
var express = require('express');
var router = express.Router();
var projService = require('services/svr.project.service');
// routes
router.post('/create', createProject);
router.post('/updateProject', updateProject);
router.put('/publishProject', publishProject);
router.get('/getByProjId/:projId', getByProjId);
router.get('/getAllSDG', getAllSDG);
router.get('/projectFiles/:projectId', projectFiles)
router.put('/approveProject', approveProject)
router.get('/getAllProjects/:orgName', getAllProjects);
router.post('/deleteProjectImage', deleteProjectImage)
router.post('/publishedProjectFilesWeb', publishedProjectFilesWeb);
router.get('/getProjectActivities/:projectId',getProjectActivities)
router.get('/getAllPublishedProjects/:userType', getAllPublishedProjects);
router.get('/getMyProjects/:userType', getMyProjects);
router.get('/getOrgPublishedProjects/:orgName',getOrgPublishedProjects)
router.get('/getMyPublishedProjects',getMyPublishedProjects)
router.post('/changeProjectVisibility',changeProjectVisibility)
router.post('/BKCGetAllDetailsByParamsWeb', BKCGetAllDetailsByParamsWeb);
router.get('/getAllProjectsForWebSite', getAllProjectsForWebSite);
router.get('/getProjRatings/:projId',getProjRatings)
module.exports = router;

/**
 * @author: Kuldeep
 * @description: This function will return project ratings
 */
function getProjRatings(req, res) {
    var projId = req.params.projId;
    var session = req.session
    projService.getProjRatings(session,projId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllProjectsForWebSite(req, res) {
    var reqBody = req.body
    var session = req.session
    var params = req.params
    var query = req.query
    projService.getAllProjectsForWebSite(reqBody, session, params, query)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function BKCGetAllDetailsByParamsWeb(req, res) {
    projService.BKCGetAllDetailsByParamsWeb(req.body, res).then(function (data) {
        res.send(data);
    })
        .catch(function (err) {
            res.send(err);
        });
}

function getMyProjects(req, res) {
    var reqBody = req.body
    var session = req.session
    var params = req.params
    var query = req.query
    console.log("getMyProjects")
    projService.getMyProjects(reqBody, session, params, query)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function changeProjectVisibility(req, res) {
    var reqBody = req.body
    var session = req.session
    var params = req.params
    var query = req.query
    projService.changeProjectVisibility(req,reqBody, session, params, query).then(function (doc) {
        res.status(200).send(doc);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getOrgPublishedProjects(req, res) {
    var reqBody = req.body
    var session = req.session
    var params = req.params
    var query = req.query
    projService.getOrgPublishedProjects(reqBody, session, params, query)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getProjectActivities(req, res) {
    projService.getProjectActivities(req, res).then(function (data) {
        console.log("getProjectActivities controller", data)
        res.send(data);
    }).catch(function (err) {
            res.send(err);
        });
}

function createProject(req, res) {
    var reqBody = req.body
    var session = req.session
    var params = req.params
    var query = req.query
    console.log("create project reqBody: ",reqBody)
    projService.create(reqBody, session, params, query)
        .then(function (data) {
            console.log("projService:",data)
            res.status(200).send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getProjectForWebsite(req, res) {
    projService.getProjectForWebsite(req.body, res).then(function (data) {
        console.log("BKCGetAllDataByParams controller", data)
        res.send(data);
    }).catch(function (err) {
            res.send(err);
        });
}

function approveProject(req, res) {
    projService.approveProject(req, res).then(function (doc) {
        var data = JSON.stringify(doc);
        if(doc === "{\"errorCode\":2,\"errorMsg\":\"chaincode error (status: 500, message: Failed to approve project as Milestone and Activity approval is pending.)\"}"){     
            console.log("approveProject doc stringfy unsuccessful",data);
            res.status(200).send(doc);
        }else{
            console.log("approveProject doc stringfy successful",data);
        res.status(200).send({message:"project approve successful"});
        }
    }).catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteProjectImage(req, res) {
    projService.deleteProjectImage(req, res)
        .then(function (doc) {
            res.status(200).send(doc);
        }).catch(function (err) {
            res.status(400).send(err);
        });

}

//Function ends here
/**
   * @author: Kuldeep
   * @argument:req :- contains project id in params.
   * @description:used to get data of published project files
   */
function projectFiles(req, res) {
    var projectId = req.params.projectId;
    projService.projectFiles(projectId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
//Function ends here


function publishedProjectFilesWeb(req, res) {
    // var hour = config.hour;
    // session.updateSession(req,hour, function(err,sessionData){
    //     if(err) res.send(err);
    //     console.log('sessionData ====== ',req.session)
    //     req.session = sessionData;
    // });
    var projectId = req.body.projId;
    console.log("publishedProjectFilesWeb")
    projService.publishedProjectFilesWeb(projectId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function publishProject(req, res) {
    projService.publishProject(req, res).then(function (data) {
        var set = {
            status: 'Project published',
            data: data
        }
        res.send(set);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function updateProject(req, res) {
    var reqBody = req.body
    var session = req.session
    var params = req.params
    var query = req.query
    projService.updateProject(req,reqBody, session, params, query).then(function (doc) {
        res.status(200).send(doc);
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}




function getByProjId(req, res) {
    var projId = req.params.projId;
    var session = req.session
    projService.GetByProjId(session,projId)
        .then(function (projectDet) {
            res.send(projectDet);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllSDG(req, res) {
    projService.getAllSDG()
        .then(function (sdg) {
            res.send(sdg);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function getAllProjects(req, res) {
    var reqBody = req.body
    var session = req.session
    var params = req.params
    var query = req.query
    console.log("getAllProjects")
    projService.getAllProjects(reqBody, session, params, query)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAllPublishedProjects(req, res) {
    var reqBody = req.body
    var session = req.session
    var params = req.params
    var query = req.query
    console.log("getAllPublishedProjects")
    projService.getAllPublishedProjects(reqBody, session, params, query)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}
function getMyPublishedProjects(req, res) {
    var reqBody = req.body
    var session = req.session
    var params = req.params
    var query = req.query
    projService.getMyPublishedProjects(reqBody, session, params, query)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}